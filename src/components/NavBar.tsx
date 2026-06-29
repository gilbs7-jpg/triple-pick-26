'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function NavBar({ user }: { user: User | null }) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <nav className="border-b border-[#1e3d24] px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-[#c8f135] text-lg tracking-wide">
          TRIPLE PICK
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-[#8fa88a] hover:text-[#f2f5ee] transition-colors">
            Season
          </Link>
          <Link href="/picks" className="text-[#8fa88a] hover:text-[#f2f5ee] transition-colors">
            My Picks
          </Link>
          <Link href="/hall-of-fame" className="text-[#8fa88a] hover:text-[#f2f5ee] transition-colors">
            Hall of Fame
          </Link>
          {user ? (
            <button
              onClick={signOut}
              className="text-[#8fa88a] hover:text-[#f2f5ee] transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link href="/login" className="bg-[#c8f135] text-[#0a1f0e] px-3 py-1 rounded font-semibold hover:bg-[#d4f54d] transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}