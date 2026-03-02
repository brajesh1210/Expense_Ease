import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Verify if a token is valid
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    res.json({ user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router