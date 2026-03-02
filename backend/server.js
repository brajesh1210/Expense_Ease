import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import expenseRoutes from './src/routes/expenseRoutes.js'
import profileRoutes from './src/routes/profileRoutes.js'
import authRoutes from './src/routes/authRoutes.js'

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const PORT = process.env.PORT || 5000

// ============================================
// MIDDLEWARE
// ============================================

// Allow frontend to talk to backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// Parse JSON request bodies
app.use(express.json())

// ============================================
// ROUTES
// ============================================

// Auth routes:    POST /api/auth/verify
app.use('/api/auth', authRoutes)

// Expense routes: GET/POST/PUT/DELETE /api/expenses
app.use('/api', expenseRoutes)

// Profile routes: GET/PUT /api/profile
app.use('/api', profileRoutes)

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ExpenseEase Backend is running! 🚀' 
  })
})

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('')
  console.log('=================================')
  console.log(`🚀 Backend server is running!`)
  console.log(`📍 http://localhost:${PORT}`)
  console.log(`❤️  Health: http://localhost:${PORT}/health`)
  console.log('=================================')
  console.log('')
})