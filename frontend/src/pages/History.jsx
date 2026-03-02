// src/pages/History.jsx
import { useState, useMemo } from 'react'
import { useExpenses } from '../context/ExpenseContext'
import { useAuth } from '../context/AuthContext'
import { categories, getCategoryById, paymentModes } from '../utils/categories'
import { formatCurrency, formatDate, groupExpensesByDate, exportToCSV } from '../utils/helpers'
import { Search, Filter, Edit2, Trash2, Download, X } from 'lucide-react'
import toast from 'react-hot-toast'

const History = () => {
  const { expenses, deleteExpense, updateExpense, loading } = useExpenses()
  const { profile } = useAuth()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('')
  const [editingExpense, setEditingExpense] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const currency = profile?.currency || '₹'

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           getCategoryById(expense.category).label.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || expense.category === selectedCategory
      const matchesPayment = !selectedPaymentMode || expense.payment_mode === selectedPaymentMode
      return matchesSearch && matchesCategory && matchesPayment
    })
  }, [expenses, searchTerm, selectedCategory, selectedPaymentMode])

  const groupedExpenses = useMemo(() => {
    return groupExpensesByDate(filteredExpenses)
  }, [filteredExpenses])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id)
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense({
      ...expense,
      date: expense.expense_date
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await updateExpense(editingExpense.id, editingExpense)
      setEditingExpense(null)
    } catch (error) {
      console.error(error)
    }
  }

  const handleExport = () => {
    exportToCSV(filteredExpenses, `expenses_${new Date().toISOString().split('T')[0]}.csv`)
    toast.success('Expenses exported successfully!')
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedPaymentMode('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transaction History 📋
        </h1>
        <button onClick={handleExport} className="btn-primary">
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses..."
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field w-auto"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedPaymentMode}
                onChange={(e) => setSelectedPaymentMode(e.target.value)}
                className="input-field w-auto"
              >
                <option value="">All Payment Modes</option>
                {paymentModes.map(mode => (
                  <option key={mode.id} value={mode.id}>
                    {mode.icon} {mode.label}
                  </option>
                ))}
              </select>

              {(searchTerm || selectedCategory || selectedPaymentMode) && (
                <button
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredExpenses.length} of {expenses.length} expenses
      </p>

      {/* Expense List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : groupedExpenses.length > 0 ? (
        <div className="space-y-6">
          {groupedExpenses.map((group) => (
            <div key={group.date}>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                📅 {group.formattedDate}
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {group.expenses.length} items
                </span>
              </h3>
              <div className="space-y-2">
                {group.expenses.map((expense) => {
                  const category = getCategoryById(expense.category)
                  return (
                    <div 
                      key={expense.id}
                      className="card flex items-center justify-between hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {expense.note || category.label}
                          </p>
                          <p className="text-sm text-gray-500">
                            {expense.payment_mode.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(expense.amount, currency)}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No expenses found</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Edit Expense
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({
                    ...editingExpense,
                    amount: e.target.value
                  })}
                  className="input-field"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({
                    ...editingExpense,
                    category: e.target.value
                  })}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={editingExpense.date}
                  onChange={(e) => setEditingExpense({
                    ...editingExpense,
                    date: e.target.value
                  })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note</label>
                <input
                  type="text"
                  value={editingExpense.note || ''}
                  onChange={(e) => setEditingExpense({
                    ...editingExpense,
                    note: e.target.value
                  })}
                  className="input-field"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default History