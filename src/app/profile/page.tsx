'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import BottomNav from '@/components/ui/BottomNav'
import { Camera, LogOut, Save, User as UserIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { supabaseUser, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSetup = searchParams.get('setup') === 'true'
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [age, setAge] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (!loading && !supabaseUser) router.replace('/auth') }, [supabaseUser, loading, router])
  useEffect(() => { if (profile) { setName(profile.name || ''); setBio(profile.bio || ''); setAge(profile.age ? String(profile.age) : ''); setPhotoUrl(profile.photo_url) } }, [profile])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !supabaseUser) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${supabaseUser.id}.${ext}`
      const { error: uploadError } = await supabase.storage.from('profile-photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
      setPhotoUrl(data.publicUrl)
      toast.success('Photo uploaded!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(message)
    } finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!supabaseUser) return
    if (!name.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      const { error } = await supabase.from('users').upsert({ id: supabaseUser.id, name: name.trim(), bio: bio.trim() || null, age: age ? parseInt(age) : null, photo_url: photoUrl, updated_at: new Date().toISOString() })
      if (error) throw error
      await refreshProfile()
      toast.success(isSetup ? 'Profile created! 🔥' : 'Profile updated!')
      if (isSetup) router.replace('/discover')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Save failed'
      toast.error(message)
    } finally { setSaving(false) }
  }

  const handleSignOut = async () => { await supabase.auth.signOut(); router.replace('/auth') }

  return (
    <div className="h-screen flex flex-col bg-coal-900 overflow-hidden">
      <div className="flex-none flex items-center justify-between px-5 pt-14 pb-4">
        <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Space Mono', monospace" }}>{isSetup ? 'Create Profile' : 'My Profile'}</h1>
        {!isSetup && <button onClick={handleSignOut} className="flex items-center gap-1.5 text-coal-400 hover:text-white text-sm"><LogOut className="w-4 h-4" />Sign out</button>}
      </div>
      <div className="flex-1 overflow-y-auto scrollable px-5 pb-28 space-y-5">
        <div className="flex flex-col items-center py-2">
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl overflow-hidden" style={{ border: '3px solid rgba(255,77,51,0.5)', boxShadow: '0 8px 32px rgba(255,77,51,0.2)' }}>
              {photoUrl ? <Image src={photoUrl} alt="Profile" width={112} height={112} className="object-cover w-full h-full" /> : <div className="w-full h-full bg-coal-700 flex items-center justify-center"><UserIcon className="w-12 h-12 text-coal-400" /></div>}
            </div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff6b50, #ff4d33)' }}>
              {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          <p className="text-coal-400 text-xs mt-3">Tap to add a photo</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-white/70 text-sm font-medium block mb-2">Name <span className="text-red-400">*</span></label>
            <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="input-dark" maxLength={50} />
          </div>
          <div>
            <label className="text-white/70 text-sm font-medium block mb-2">Age <span className="text-coal-400 text-xs">(optional)</span></label>
            <input type="number" placeholder="Your age" value={age} onChange={(e) => setAge(e.target.value)} className="input-dark" min={18} max={99} />
          </div>
          <div>
            <label className="text-white/70 text-sm font-medium block mb-2">Bio <span className="text-coal-400 text-xs">(optional)</span></label>
            <textarea placeholder="Tell people about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} className="input-dark resize-none" rows={4} maxLength={300} style={{ fontFamily: 'DM Sans, sans-serif' }} />
            <p className="text-coal-400 text-xs text-right mt-1">{bio.length}/300</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving || uploading} className="btn-ember w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" />{isSetup ? 'Create My Profile 🔥' : 'Save Changes'}</>}
        </button>
      </div>
      {!isSetup && <BottomNav />}
    </div>
  )
}
