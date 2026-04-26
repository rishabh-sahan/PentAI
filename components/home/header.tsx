"use client"

import type React from "react"
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, User } from "lucide-react"
import Link from "next/link"
import ThemeToggler from "@/components/ThemeToggler";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const navItems = [
    { name: "Compare", href: "#compare" },
    { name: "Workflow", href: "#workflow" },
    { name: "Security", href: "#security" },
    { name: "Use cases", href: "#use-cases" },
    { name: "FAQ", href: "#faq-section" },
  ]

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('login') === '1') {
        setIsLoginModalOpen(true);
        url.searchParams.delete('login');
        window.history.replaceState({}, '', url.pathname + url.hash);
      }
    }
  }, []);

  const { session, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="w-full px-5 py-4">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between rounded-lg border border-border bg-background/82 px-4 py-3 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-foreground text-xl font-semibold tracking-tight">PentAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-md font-medium transition-colors hover:bg-background/60"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-24 h-9 bg-muted rounded-md animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" rel="noopener noreferrer" className="hidden md:block">
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm transition-colors cursor-pointer">
                  Dashboard
                </Button>
              </Link>
              
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted px-4 py-2 rounded-md font-medium shadow-sm transition-colors cursor-pointer"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {session.user?.user_metadata?.name || 'Profile'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{session.user?.user_metadata?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 rounded-md font-medium shadow-sm"
            >
              Login
            </button>
          )}
          <ThemeToggler />
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-7 w-7" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-background border-t border-border text-foreground">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-semibold text-foreground">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleScroll(e, item.href)}
                    className="text-muted-foreground hover:text-foreground justify-start text-lg py-2"
                  >
                    {item.name}
                  </Link>
                ))}
                {session ? (
                  <div className="flex flex-col gap-3 mt-4">
                    <Link href="/dashboard" className="w-full">
                      <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <div className="flex flex-col space-y-1 p-2 border rounded-md">
                      <p className="text-sm font-medium leading-none">{session.user?.user_metadata?.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                      <Button 
                        onClick={handleLogout}
                        variant="outline"
                        className="border-border text-foreground hover:bg-muted px-4 py-2 rounded-full font-medium shadow-sm w-full mt-2"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setIsLoginModalOpen(true)} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium shadow-sm">
                    Login
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  )
}
