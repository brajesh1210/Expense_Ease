import { supabase } from '../config/supabase.js'

export const authenticate = async (req, res, next) => {
  try {
    // Step 1: Get the token from request header
    const authHeader = req.headers.authorization

    // Step 2: Check if token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided. Please login first.' 
      })
    }

    // Step 3: Extract the token
    const token = authHeader.split(' ')[1]

    // Step 4: Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    // Step 5: Check if user is valid
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid token. Please login again.' 
      })
    }

    // Step 6: Save user info and token for later use
    req.user = user
    req.token = token

    // Step 7: Continue to the next function
    next()

  } catch (error) {
    console.error('Auth error:', error)
    res.status(401).json({ error: 'Authentication failed' })
  }
}