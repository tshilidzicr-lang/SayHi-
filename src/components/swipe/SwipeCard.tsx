'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { MapPin, Info } from 'lucide-react'
import { User } from '@/types'

interface SwipeCardProps {
  user: User
  onLike: () => void
  onPass: () => void
  isTop: boolean
}

export default function SwipeCard({ user, onLike, onPass, isTop }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null)
  const [showBio, setShowBio] = useState(false)
  const SWIPE_THRESHOLD = 100

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTop) return
    setDragging(true)
    setStartX(e.clientX)
    setStartY(e.clientY)
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !isTop) return
    setOffsetX(e.clientX - startX)
    setOffsetY(e.clientY - startY)
  }

  const handlePointerUp = () => {
    if (!dragging) return
    setDragging(false)
    if (offsetX > SWIPE_THRESHOLD) triggerSwipe('right')
    else if (offsetX < -SWIPE_THRESHOLD) triggerSwipe('left')
    else { setOffsetX(0); setOffsetY(0) }
  }

  const triggerSwipe = (direction: 'left' | 'right') => {
    setExiting(direction)
    setTimeout(() => { if (direction === 'right') onLike(); else onPass() }, 380)
  }

  const rotation = dragging ? (offsetX / 15) : 0
  const likeOpacity = Math.min(Math.max(offsetX / 80, 0), 1)
  const passOpacity = Math.min(Math.max(-offsetX / 80, 0), 1)

  const cardStyle: React.CSSProperties = {
    transform: exiting === 'right' ? 'translateX(150%) rotate(30deg)' : exiting === 'left' ? 'translateX(-150%) rotate(-30deg)' : dragging ? `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rotation}deg)` : 'translateX(0) rotate(0deg)',
    transition: dragging ? 'none' : exiting ? 'transform 0.38s ease-in' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    zIndex: isTop ? 10 : 5,
  }

  return (
    <div ref={cardRef} className="swipe-card absolute inset-0 rounded-3xl overflow-hidden select-none" style={cardStyle} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
      <div className="absolute inset-0">
        {user.photo_url ? <Image src={user.photo_url} alt={user.name} fill className="object-cover" draggable={false} priority /> : <div className="w-full h-full flex items-center justify-center text-8xl" style={{ background: 'linear-gradient(135deg, #2d2d36, #18181c)' }}>👤</div>}
      </div>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 80%)' }} />
      {isTop && <div className="absolute top-12 left-8 border-4 border-green-400 text-green-400 text-2xl font-black px-4 py-2 rounded-xl rotate-[-20deg] tracking-widest" style={{ opacity: likeOpacity }}>LIKE</div>}
      {isTop && <div className="absolute top-12 right-8 border-4 border-red-400 text-red-400 text-2xl font-black px-4 py-2 rounded-xl rotate-[20deg] tracking-widest" style={{ opacity: passOpacity }}>NOPE</div>}
      {showBio && <div className="absolute inset-0 flex items-center justify-center p-8" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setShowBio(false)}><p className="text-white text-base leading-relaxed text-center">{user.bio || 'No bio yet 🔥'}</p></div>}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white text-2xl font-bold">{user.name}</h2>
              {user.age && <span className="text-white/70 text-xl">{user.age}</span>}
            </div>
            <div className="flex items-center gap-1 text-white/60 text-sm"><MapPin className="w-3 h-3" /><span>Nearby</span></div>
          </div>
          {user.bio && <button onClick={(e) => { e.stopPropagation(); setShowBio(true) }} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Info className="w-5 h-5 text-white" /></button>}
        </div>
      </div>
    </div>
  )
                                   }
