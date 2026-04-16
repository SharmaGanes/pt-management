"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, Stethoscope, Users, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const mobileNavItems = [
  { href: "/", label: "Patients", icon: Users },
  { href: "/handover", label: "Handover", icon: ArrowRightLeft },
]

export function DashboardHeader({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center gap-3 px-4">
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
            <Stethoscope className="size-4 text-primary" />
          </div>
          <span className="font-semibold">PatientFlow</span>
        </div>

        <nav className="flex items-center gap-1 md:hidden ml-2">
          {mobileNavItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">{userEmail}</span>
          <ThemeToggle />
          <Button variant="ghost" size="icon-sm" onClick={handleSignOut}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
