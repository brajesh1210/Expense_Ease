import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Wallet, TrendingUp, PieChart, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import { supabase } from '../api/supabase' // DHYAN DEIN: Agar supabase.js ka folder path alag hai, toh isko update kar lena

const Login = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      // Google se token liya aur silently Supabase ko de diya
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      })

      if (error) throw error

      toast.success('Successfully logged in!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to sign in. Please try again.')
      console.error("Login Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: Wallet, title: 'Track Expenses', desc: 'Log every rupee you spend' },
    { icon: TrendingUp, title: 'Smart Analytics', desc: 'Understand your spending patterns' },
    { icon: PieChart, title: 'Budget Goals', desc: 'Set and achieve your financial goals' },
    { icon: Shield, title: 'Secure & Private', desc: 'Your data is protected' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding (Aapka original mast UI) */}
        <div className="text-white space-y-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">💰</span>
            </div>
            <h1 className="text-4xl font-bold">ExpenseEase</h1>
          </div>
          
          <p className="text-xl text-primary-100">
            Your personal expense tracker that helps you understand where your money goes.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
              >
                <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary-200" />
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-primary-200 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome Back! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to continue tracking your expenses
            </p>
          </div>

          {/* Yahan aapka naya Google Popup Button hai, jo chode width mein aayega */}
          <div className="w-full flex justify-center items-center py-2 opacity-100 transition-opacity duration-300">
            {loading ? (
              <p className="text-primary-600 font-medium animate-pulse">Signing in securely...</p>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Popup closed or failed')}
                useOneTap={true}
                theme="outline"        // Clean white outline style
                size="large"           // Bada aur prominent button
                shape="rectangular"    // Modern square edges
                text="continue_with"   // Text: Continue with Google
                width="350"            // Isse button full width (lamba) dikhega aapke layout mein
              />
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Secure Authentication
              </span>
            </div>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Your data is stored securely and never shared.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login