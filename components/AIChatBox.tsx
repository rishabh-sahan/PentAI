"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { Paperclip, Send, Loader2, X, Plus, Globe } from "lucide-react"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

const AnimatedPlaceholder = ({ showSearch }: { showSearch: boolean }) => (
  <AnimatePresence mode="wait">
    <motion.p
      key={showSearch ? "search" : "ask"}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.1 }}
      className="pointer-events-none w-[200px] text-sm absolute text-muted-foreground"
    >
      Ask anything…
    </motion.p>
  </AnimatePresence>
)

export function AiInput({ onSubmit, loading = false }: { onSubmit: (text: string, imageDataUrl?: string, webSearch?: boolean) => void; loading?: boolean }) {
  const [value, setValue] = useState("")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })
  const [showSearch, setShowSearch] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handelClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Reset file input
    }
    setImagePreview(null) // Use null instead of empty string
  }

  const handelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    let dataUrl: string | undefined
    if (imageFile) {
      dataUrl = await new Promise<string>((resolve) => {
        const fr = new FileReader()
        fr.onload = () => resolve(String(fr.result))
        fr.readAsDataURL(imageFile)
      })
    }
    onSubmit(value.trim(), dataUrl, showSearch)
    setValue("")
    setImageFile(null)
    setImagePreview(null)
    adjustHeight(true)
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])
  return (
    <div className="w-full py-4">
      <div className="relative w-full px-3 lg:px-4">
        <div className="w-full flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-lg ring-1 ring-ring/20">
          <label className="cursor-pointer inline-flex items-center justify-center w-9 h-9 rounded-full bg-secondary text-secondary-foreground border border-border">
            <input type="file" ref={fileInputRef} onChange={handelChange} className="hidden" />
            <Plus className="w-4 h-4" />
          </label>
          <div className="relative grow">
            <Textarea
              id="ai-input-04"
              value={value}
              placeholder=""
              className="w-full bg-transparent border-none text-foreground resize-none focus-visible:ring-0 leading-[1.4] px-0 py-2 min-h-[44px] flex items-center"
              ref={textareaRef}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              onChange={(e) => {
                setValue(e.target.value)
                adjustHeight()
              }}
            />

          </div>
          <button
            type="button"
            onClick={() => setShowSearch((s) => !s)}
            className={cn(
              "inline-flex items-center gap-1.5 h-9 rounded-full border px-2.5 text-xs transition-all",
              showSearch
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            )}
            title={showSearch ? "Search the web enabled" : "Enable web search"}
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{showSearch ? "Search" : "Off"}</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={cn(
              "inline-flex items-center justify-center w-9 h-9 rounded-full border shadow-sm transition-all",
              loading || value.trim().length === 0
                ? "bg-secondary text-muted-foreground border-border cursor-not-allowed opacity-60"
                : "bg-primary text-primary-foreground border-border hover:brightness-95"
            )}
            disabled={loading || value.trim().length === 0}
            aria-busy={loading}
            aria-label="Send"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        {imagePreview && (
          <div className="absolute -top-28 left-2 flex items-center gap-2 bg-card border border-border rounded-xl p-2 shadow-lg">
            <div className="relative h-[64px] w-[64px] rounded-lg overflow-hidden border border-border">
              <Image className="object-cover h-full w-full" src={imagePreview} height={160} width={160} alt="attached image" />
              <button onClick={handelClose} className="absolute top-1 right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-black/70 text-white border border-white/20" aria-label="Remove image">
                <X className="w-3 h-3" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground">Image attached</span>
          </div>
        )}
      </div>
    </div>
  )
}
