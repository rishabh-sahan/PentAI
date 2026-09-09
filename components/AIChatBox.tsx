"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ArrowUp, FileText, FileType2, Loader2, Paperclip, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import {
  ACCEPT_ATTR,
  formatBytes,
  toAttachment,
  type Attachment,
} from "@/lib/attachments"

// One 24px line plus the 8px vertical padding on each side. Setting this to the
// line height alone leaves scrollHeight permanently above the element height,
// which makes the browser paint a scrollbar on an empty single-line box.
const MIN_HEIGHT = 40
const MAX_HEIGHT = 200

function useAutoResizeTextarea(minHeight: number, maxHeight: number) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return
      textarea.style.height = `${minHeight}px`
      if (reset) {
        textarea.style.overflowY = "hidden"
        return
      }
      const next = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${next}px`
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden"
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = `${minHeight}px`
    textarea.style.overflowY = "hidden"
  }, [minHeight])

  return { textareaRef, adjustHeight }
}

export function AiInput({
  onSubmit,
  loading = false,
}: {
  onSubmit: (text: string, attachments: Attachment[]) => void
  loading?: boolean
}) {
  const [value, setValue] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [reading, setReading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { textareaRef, adjustHeight } = useAutoResizeTextarea(MIN_HEIGHT, MAX_HEIGHT)

  const usable = attachments.filter((a) => a.kind !== "unsupported")
  const canSend = (value.trim().length > 0 || usable.length > 0) && !loading && !reading

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setReading(true)
    try {
      const parsed = await Promise.all(Array.from(files).map(toAttachment))
      setAttachments((prev) => {
        const byId = new Map(prev.map((a) => [a.id, a]))
        for (const a of parsed) byId.set(a.id, a)
        return Array.from(byId.values())
      })
    } finally {
      setReading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (id: string) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id))

  const handleSubmit = () => {
    if (!canSend) return
    onSubmit(value.trim(), usable)
    setValue("")
    setAttachments([])
    adjustHeight(true)
  }

  // Paste an image straight from the clipboard.
  const handlePaste = (e: React.ClipboardEvent) => {
    const files = e.clipboardData?.files
    if (files && files.length > 0) {
      e.preventDefault()
      void addFiles(files)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((a) => (
            <AttachmentChip key={a.id} attachment={a} onRemove={() => removeAttachment(a.id)} />
          ))}
        </div>
      )}

      <div
        className="flex items-end gap-2 rounded-xl border border-border bg-card p-2 shadow-sm transition-colors focus-within:border-primary/45"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          void addFiles(e.dataTransfer.files)
        }}
      >
        <label
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:h-9 sm:w-9"
          title="Attach files — documents, code, PDFs or images"
        >
          <input
            type="file"
            multiple
            accept={ACCEPT_ATTR}
            ref={fileInputRef}
            onChange={(e) => void addFiles(e.target.files)}
            className="hidden"
          />
          {reading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
          <span className="sr-only">Attach files</span>
        </label>

        <Textarea
          value={value}
          rows={1}
          placeholder="Ask all selected models at once…"
          // field-sizing-content fights the JS resize above, so it's disabled here.
          className="min-h-0 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-base leading-6 shadow-none [field-sizing:fixed] focus-visible:ring-0 sm:text-[15px]"
          ref={textareaRef}
          onPaste={handlePaste}
          onChange={(e) => {
            setValue(e.target.value)
            adjustHeight()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-9 sm:w-9",
            canSend
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground"
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
        </button>
      </div>

      <p className="mt-2 hidden text-center text-xs text-muted-foreground sm:block">
        Enter to send · Shift + Enter for a new line · drag, paste or attach files
      </p>
    </div>
  )
}

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: Attachment
  onRemove: () => void
}) {
  const broken = attachment.kind === "unsupported"

  return (
    <div
      className={cn(
        "group flex max-w-[15rem] items-center gap-2 rounded-lg border py-1.5 pl-1.5 pr-2",
        broken ? "border-destructive/40 bg-destructive/8" : "border-border bg-card"
      )}
      title={attachment.problem ?? attachment.name}
    >
      {attachment.kind === "image" && attachment.dataUrl ? (
        <Image
          src={attachment.dataUrl}
          alt=""
          width={56}
          height={56}
          className="h-7 w-7 shrink-0 rounded object-cover"
          unoptimized
        />
      ) : (
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded",
            broken ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"
          )}
        >
          {attachment.kind === "pdf" ? (
            <FileType2 className="h-3.5 w-3.5" />
          ) : (
            <FileText className="h-3.5 w-3.5" />
          )}
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs text-foreground">{attachment.name}</span>
        <span
          className={cn(
            "block truncate text-[10px]",
            broken ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {attachment.problem ?? formatBytes(attachment.size)}
        </span>
      </span>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${attachment.name}`}
        className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
