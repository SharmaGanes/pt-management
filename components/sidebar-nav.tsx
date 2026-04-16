"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, ArrowRightLeft, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Patients", icon: Users },
  { href: "/handover", label: "Handover", icon: ArrowRightLeft },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-56 shrink-0 border-r bg-sidebar md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <Stethoscope className="size-4 text-primary" />
        </div>
        <span className="font-semibold text-sidebar-foreground">PatientFlow</span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
