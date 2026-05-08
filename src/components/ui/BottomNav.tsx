'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, Heart, MessageCircle, User } from 'lucide-react'

const navItems = [
  { href: '/discover', icon: Flame, label: 'Discover' },
  { href: '/matches', icon: Heart, label: 'Matches' },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center justify-around px-4 py-3" style={{ background: 'rgba(17,17,19,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200 ${active ? 'text-ember-500' : 'text-coal-400'}`} style={active ? { color: '#ff4d33' } : {}}>
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.5} style={active ? { filter: 'drop-shadow(0 0 6px rgba(255,77,51,0.6))' } : {}} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
