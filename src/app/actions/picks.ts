'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function submitPicks(
  gameweekId: string,
  leagueId: string,
  teamIds: string[]
): Promise<{ success: boolean; error?: string }> {
  if (teamIds.length !== 3) {
    return { success: false, error: 'You must select exactly 3 teams.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be signed in to make picks.' }
  }

  const { error: deleteError } = await supabase
    .from('picks')
    .delete()
    .eq('user_id', user.id)
    .eq('gameweek_id', gameweekId)
    .eq('league_id', leagueId)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  const rows = teamIds.map((teamId) => ({
    user_id: user.id,
    gameweek_id: gameweekId,
    league_id: leagueId,
    team_id: teamId,
  }))

  const { error: insertError } = await supabase.from('picks').insert(rows)

  if (insertError) {
    if (insertError.message.includes('picks_deadline_passed')) {
      return { success: false, error: 'The pick deadline for this gameweek has passed.' }
    }
    if (insertError.message.includes('picks_team_usage_limit')) {
      return { success: false, error: 'One of your picks has already been used 3 times this season.' }
    }
    return { success: false, error: insertError.message }
  }

  revalidatePath('/home')
  return { success: true }
}
