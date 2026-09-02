"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { getSupabase } from "@/lib/supabaseClient"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      try {
        const { data, error } = await getSupabase().auth.getSession()
        if (error) {
          console.error("Auth callback error:", error)
          router.push("/?error=auth_failed")
          return
        }
        router.push(data.session ? "/dashboard" : "/")
      } catch (error) {
        console.error("Unexpected error during auth callback:", error)
        router.push("/?error=auth_failed")
      }
    }
    void run()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  )
}
