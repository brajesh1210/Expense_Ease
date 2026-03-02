import express from 'express'
import { getProfile, updateProfile } from '../controllers/profileController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// All routes need login first
router.use(authenticate)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)

export default router