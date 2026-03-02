import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ExpenseContext = createContext({})

export const useExpenses = () => useContext(ExpenseContext)

export const ExpenseProvider = ({ children }) => {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [categoryBudgets, setCategoryBudgets] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setExpenses([])
      setCategoryBudgets([])
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchExpenses(),
        fetchCategoryBudgets(),
        fetchProfile()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get('/expenses')
      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error('Failed to load expenses')
    }
  }

  const fetchCategoryBudgets = async () => {
    try {
      const { data } = await api.get('/category-budgets')
      setCategoryBudgets(data || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile')
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const addExpense = async (expense) => {
    try {
      const { data } = await api.post('/expenses', expense)
      setExpenses(prev => [data, ...prev])
      toast.success('Expense added successfully! 💰')
      return data
    } catch (error) {
      toast.error('Failed to add expense')
      throw error
    }
  }

  const updateExpense = async (id, updates) => {
    try {
      const { data } = await api.put(`/expenses/${id}`, updates)
      setExpenses(prev => prev.map(exp => exp.id === id ? data : exp))
      toast.success('Expense updated! ✅')
      return data
    } catch (error) {
      toast.error('Failed to update expense')
      throw error
    }
  }

  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`)
      setExpenses(prev => prev.filter(exp => exp.id !== id))
      toast.success('Expense deleted! 🗑️')
    } catch (error) {
      toast.error('Failed to delete expense')
      throw error
    }
  }

  const deleteAllExpenses = async () => {
    try {
      await api.delete('/expenses')
      setExpenses([])
      toast.success('All expenses deleted!')
    } catch (error) {
      toast.error('Failed to delete expenses')
      throw error
    }
  }

  const updateCategoryBudget = async (category, budgetLimit) => {
    try {
      const { data } = await api.post('/category-budgets', {
        category,
        budget_limit: budgetLimit
      })
      
      setCategoryBudgets(prev => {
        const exists = prev.find(b => b.category === category)
        if (exists) {
          return prev.map(b => b.category === category ? data : b)
        }
        return [...prev, data]
      })
      
      return data
    } catch (error) {
      toast.error('Failed to update budget')
      throw error
    }
  }

  const updateProfile = async (updates) => {
    try {
      const { data } = await api.put('/profile', updates)
      setProfile(data)
      toast.success('Profile updated!')
      return data
    } catch (error) {
      toast.error('Failed to update profile')
      throw error
    }
  }

  const getExpensesByDateRange = (startDate, endDate) => {
    return expenses.filter(exp => {
      const date = new Date(exp.expense_date)
      return date >= startDate && date <= endDate
    })
  }

  const getTotalSpent = () => {
    return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
  }

  const getThisMonthSpent = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthExpenses = getExpensesByDateRange(startOfMonth, now)
    return monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
  }

  const getCategoryTotals = (startDate, endDate) => {
    const filtered = startDate && endDate 
      ? getExpensesByDateRange(startDate, endDate)
      : expenses

    return filtered.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount)
      return acc
    }, {})
  }

  const getBudgetStatus = () => {
    const monthlyBudget = profile?.monthly_budget || 20000
    const spent = getThisMonthSpent()
    const percentage = (spent / monthlyBudget) * 100
    const remaining = monthlyBudget - spent

    return {
      total: monthlyBudget,
      spent,
      remaining,
      percentage: Math.min(percentage, 100),
      status: percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : 'safe'
    }
  }

  const value = {
    expenses,
    categoryBudgets,
    profile,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteAllExpenses,
    updateCategoryBudget,
    updateProfile,
    getExpensesByDateRange,
    getTotalSpent,
    getThisMonthSpent,
    getCategoryTotals,
    getBudgetStatus,
    refreshData: fetchData
  }

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  )
}