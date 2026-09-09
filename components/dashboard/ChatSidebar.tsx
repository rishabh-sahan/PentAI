"use client"

import Link from "next/link"
import { MoreHorizontal, Pencil, Pin, PinOff, Plus, Trash2 } from "lucide-react"

import { ThreadSummary } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type Props = {
  threads: ThreadSummary[]
  activeId: string | null
  renamingId: string | null
  renameValue: string
  onSelect: (id: string) => void
  onNewChat: () => void
  onStartRename: (thread: ThreadSummary) => void
  onRenameChange: (value: string) => void
  onCommitRename: (id: string) => void
  onCancelRename: () => void
  onTogglePin: (id: string) => void
  onDelete: (id: string) => void
}

export function ChatSidebar({
  threads,
  activeId,
  renamingId,
  renameValue,
  onSelect,
  onNewChat,
  onStartRename,
  onRenameChange,
  onCommitRename,
  onCancelRename,
  onTogglePin,
  onDelete,
}: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
          PentAI
        </Link>
      </div>

      <div className="px-3 pb-3">
        <Button onClick={onNewChat} className="h-10 w-full justify-start gap-2 lg:h-9">
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {threads.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            No chats yet. Start one above.
          </p>
        ) : (
          <div className="space-y-0.5">
            {threads.map((thread) => {
              const isActive = thread.id === activeId

              if (renamingId === thread.id) {
                return (
                  <input
                    key={thread.id}
                    autoFocus
                    value={renameValue}
                    onChange={(e) => onRenameChange(e.target.value)}
                    onBlur={() => onCommitRename(thread.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onCommitRename(thread.id)
                      if (e.key === "Escape") onCancelRename()
                    }}
                    className="h-9 w-full rounded-md border border-border bg-background px-2 text-base outline-none focus-visible:border-foreground/30 lg:h-8 lg:text-sm"
                  />
                )
              }

              return (
                <div
                  key={thread.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-md pr-1 transition-colors",
                    isActive ? "bg-accent" : "hover:bg-accent/60"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(thread.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2.5 text-left lg:py-2"
                  >
                    {thread.pinned && (
                      <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        "truncate text-sm",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {thread.title || "Untitled"}
                    </span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Chat options"
                        // Rename/pin/delete live behind this button. Revealing
                        // it on group-hover alone makes them unreachable on
                        // touch, where the sidebar is the mobile drawer.
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-opacity hover:bg-background hover:text-foreground focus-visible:opacity-100 data-[state=open]:opacity-100 lg:h-7 lg:w-7 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onStartRename(thread)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTogglePin(thread.id)}>
                        {thread.pinned ? (
                          <>
                            <PinOff className="mr-2 h-3.5 w-3.5" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="mr-2 h-3.5 w-3.5" />
                            Pin
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(thread.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
