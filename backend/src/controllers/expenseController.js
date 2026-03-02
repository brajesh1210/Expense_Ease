import { getAuthClient } from '../config/supabase.js'

// ============================================
// GET ALL EXPENSES
// ============================================
export const getExpenses = async (req, res) => {
  try {
    // Create supabase client with user's token
    const supabase = getAuthClient(req.token)

    // Get all expenses (RLS will filter by user automatically)
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Get expenses error:', error)
    res.status(500).json({ error: error.message })
  }
}

// ============================================
// CREATE NEW EXPENSE
// ============================================
export const createExpense = async (req, res) => {
  try {
    const supabase = getAuthClient(req.token)

    // Get data from request body
    const { amount, category, expense_date, note, payment_mode } = req.body

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' })
    }

    // Validate category
    if (!category) {
      return res.status(400).json({ error: 'Category is required' })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: req.user.id,
        amount,
        category,
        expense_date: expense_date || new Date().toISOString().split('T')[0],
        note: note || '',
        payment_mode: payment_mode || 'cash'
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error('Create expense error:', error)
    res.status(500).json({ error: error.message })
  }
}

// ============================================
// UPDATE EXPENSE
// ============================================
export const updateExpense = async (req, res) => {
  try {
    const supabase = getAuthClient(req.token)
    const { id } = req.params
    const { amount, category, expense_date, note, payment_mode } = req.body

    const { data, error } = await supabase
      .from('expenses')
      .update({
        amount,
        category,
        expense_date,
        note,
        payment_mode,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Update expense error:', error)
    res.status(500).json({ error: error.message })
  }
}

// ============================================
// DELETE ONE EXPENSE
// ============================================
export const deleteExpense = async (req, res) => {
  try {
    const supabase = getAuthClient(req.token)
    const { id } = req.params

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Delete expense error:', error)
    res.status(500).json({ error: error.message })
  }
}

// ============================================
// DELETE ALL EXPENSES
// ============================================
export const deleteAllExpenses = async (req, res) => {
  try {
    const supabase = getAuthClient(req.token)

    // Delete all expenses for this user
    // neq means "not equal" - this is a trick to delete all rows
    const { error } = await supabase
      .from('expenses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) throw error

    res.json({ message: 'All expenses deleted successfully' })
  } catch (error) {
    console.error('Delete all expenses error:', error)
    res.status(500).json({ error: error.message })
  }
}

// ============================================
// GET CATEGORY BUDGETS
// ============================================
export const getCategoryBudgets = async (req, res) => {
  try {
    const supabase = getAuthClient(req.token)

    const { data, error } = await supabase
      .from('category_budgets')
      .select('*')

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Get category budgets error:', error)
    res.status(500).json({ error: error.message })
  }
}

// ============================================
// UPDATE CATEGORY BUDGET
// ============================================
export const updateCategoryBudget = async (req, res) => {
  try {
    const supabase = getAuthClient(req.token)
    const { category, budget_limit } = req.body

    const { data, error } = await supabase
      .from('category_budgets')
      .upsert({
        user_id: req.user.id,
        category,
        budget_limit
      }, {
        onConflict: 'user_id,category'
      })
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Update category budget error:', error)
    res.status(500).json({ error: error.message })
  }
}