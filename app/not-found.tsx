import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="surface-panel w-full max-w-lg rounded-lg border p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
          <Search size={22} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/80"
          >
            Go back home
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Start a new chat
          </Link>
        </div>
      </div>
    </main>
  );
}
