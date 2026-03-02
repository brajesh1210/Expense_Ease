import { getAuthClient } from '../config/supabase.js'

// ============================================
// GET USER PROFILE
// ============================================
export const getProfile = async (req, res) => {
  try {
    const supabase = getAuthClient(req.token)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: error.message })
  }
}

// ============================================
// UPDATE USER PROFILE
// ============================================
export const updateProfile = async (req, res) => {
  try {
    const supabase = getAuthClient(req.token)
    const updates = req.body

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: error.message })
  }
}