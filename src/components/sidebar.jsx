"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, History } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const routes = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/',
    },
    {
        label: 'History',
        icon: History,
        href: '/history',
    },
]

const Sidebar = () => {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-neutral-800 text-white">
            <div className="px-3 py-2 flex-1">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    Menu
                </h2>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Button
                            key={route.href}
                            variant={pathname === route.href ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start",
                            )}
                            asChild
                        >
                            <Link href={route.href}>
                                <route.icon className="mr-2 h-4 w-4" />
                                {route.label}
                            </Link>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Sidebar;