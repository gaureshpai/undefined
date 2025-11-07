"use client"

import Link from "next/link"

const links = [
  { href: "/admin/buildings", text: "Buildings" },
  { href: "/admin/analytics", text: "Analytics" },
  { href: "/admin/all-requests", text: "All Requests" },
]

export default function AdminNav() {
  return (
    <nav className="flex items-center space-x-4">
      {links.map(({ href, text }) => (
        <Link
          key={href}
          href={href}
          className="text-white hover:bg-slate-600/50 p-2 rounded-md transition-all duration-200"
        >
          {text}
        </Link>
      ))}
    </nav>
  )
}
