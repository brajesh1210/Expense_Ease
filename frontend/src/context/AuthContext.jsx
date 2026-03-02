import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../api/supabase'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch the user's profile from your backend
  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile')
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      // Store token for API calls and fetch profile
      if (session?.access_token) {
        localStorage.setItem('supabase_token', session.access_token)
        await fetchProfile()
      }
      
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.access_token) {
          localStorage.setItem('supabase_token', session.access_token)
          await fetchProfile()
        } else {
          localStorage.removeItem('supabase_token')
          setProfile(null) // Clear profile on logout
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
    } catch (error) {
      toast.error('Failed to sign in with Google')
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      localStorage.removeItem('supabase_token')
      setUser(null)
      setProfile(null)
    } catch (error) {
      toast.error('Failed to sign out')
      throw error
    }
  }

  // Update profile function that BudgetSettings.jsx needs
  const updateProfile = async (settings) => {
    try {
      const { data } = await api.put('/profile', settings)
      setProfile(data) // Update the local state with the new data
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Provide all necessary data and functions to the rest of the app
  const value = {
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}