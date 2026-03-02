import express from 'express'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  deleteAllExpenses,
  getCategoryBudgets,
  updateCategoryBudget
} from '../controllers/expenseController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// All routes need login first
router.use(authenticate)

// Expense routes
router.get('/expenses', getExpenses)
router.post('/expenses', createExpense)
router.put('/expenses/:id', updateExpense)
router.delete('/expenses/:id', deleteExpense)
router.delete('/expenses', deleteAllExpenses)

// Budget routes
router.get('/category-budgets', getCategoryBudgets)
router.post('/category-budgets', updateCategoryBudget)

export default router