// src/pages/BudgetSettings.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useExpenses } from '../context/ExpenseContext'
import { categories } from '../utils/categories'
import { User, DollarSign, Bell, Moon, Sun, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const BudgetSettings = () => {
  const { profile, updateProfile } = useAuth()
  const { categoryBudgets, updateCategoryBudget, deleteAllExpenses } = useExpenses()
  
  const [settings, setSettings] = useState({
    full_name: '',
    currency: '₹',
    monthly_budget: 20000,
    alert_threshold: 80,
    dark_mode: false
  })
  
  const [catBudgets, setCatBudgets] = useState({})
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    if (profile) {
      setSettings({
        full_name: profile.full_name || '',
        currency: profile.currency || '₹',
        monthly_budget: profile.monthly_budget || 20000,
        alert_threshold: profile.alert_threshold || 80,
        dark_mode: profile.dark_mode || false
      })
    }
  }, [profile])

  useEffect(() => {
    const budgets = {}
    categoryBudgets.forEach(b => {
      budgets[b.category] = b.budget_limit
    })
    setCatBudgets(budgets)
  }, [categoryBudgets])

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile(settings)
      
      // Update category budgets
      for (const [category, limit] of Object.entries(catBudgets)) {
        await updateCategoryBudget(category, parseFloat(limit) || 0)
      }
      
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
    setDarkMode(!darkMode)
    setSettings({ ...settings, dark_mode: !darkMode })
  }

  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to delete ALL expenses? This cannot be undone.')) {
      if (window.confirm('This will permanently delete all your expense data. Are you absolutely sure?')) {
        await deleteAllExpenses()
      }
    }
  }

  const currencies = [
    { symbol: '₹', name: 'INR' },
    { symbol: '$', name: 'USD' },
    { symbol: '€', name: 'EUR' },
    { symbol: '£', name: 'GBP' }
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Budget Settings ⚙️
      </h1>

      {/* Profile Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <User className="w-5 h-5" />
          Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={settings.full_name}
              onChange={(e) => setSettings({ ...settings, full_name: e.target.value })}
              className="input-field"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="input-field"
            >
              {currencies.map(c => (
                <option key={c.symbol} value={c.symbol}>
                  {c.symbol} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Budget Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <DollarSign className="w-5 h-5" />
          Budget
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monthly Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {settings.currency}
              </span>
              <input
                type="number"
                value={settings.monthly_budget}
                onChange={(e) => setSettings({ ...settings, monthly_budget: parseFloat(e.target.value) || 0 })}
                className="input-field pl-8"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Category-wise Limits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-3">
              <span className="text-xl w-8">{cat.icon}</span>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {cat.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    {settings.currency}
                  </span>
                  <input
                    type="number"
                    value={catBudgets[cat.id] || ''}
                    onChange={(e) => setCatBudgets({ 
                      ...catBudgets, 
                      [cat.id]: e.target.value 
                    })}
                    className="input-field pl-8 text-sm"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <Bell className="w-5 h-5" />
          Alerts
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alert me when I reach
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="50"
              max="100"
              value={settings.alert_threshold}
              onChange={(e) => setSettings({ ...settings, alert_threshold: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-lg font-semibold text-primary-600 w-16">
              {settings.alert_threshold}%
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            You'll see a warning when you've used {settings.alert_threshold}% of your budget
          </p>
        </div>
      </div>

      {/* Appearance */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Dark Mode
            </span>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
              darkMode ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-2 border-red-200 dark:border-red-900">
        <h2 className="text-lg font-semibold mb-4 text-red-600">
          ⚠️ Danger Zone
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Once you delete your expenses, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleResetData}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Reset All Data
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="btn-primary w-full py-3"
      >
        {loading ? 'Saving...' : (
          <>
            <Save className="w-5 h-5" />
            Save Settings
          </>
        )}
      </button>
    </div>
  )
}

export default BudgetSettings