// src/pages/Analytics.jsx
import { useState, useMemo } from 'react'
import { useExpenses } from '../context/ExpenseContext'
import { useAuth } from '../context/AuthContext'
import { categories, getCategoryById } from '../utils/categories'
import { formatCurrency, getDateRange } from '../utils/helpers'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'

const Analytics = () => {
  const { expenses, getCategoryTotals, categoryBudgets } = useExpenses()
  const { profile } = useAuth()
  const [period, setPeriod] = useState('month')

  const currency = profile?.currency || '₹'

  const { start, end } = useMemo(() => getDateRange(period), [period])

  const periodExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const date = new Date(exp.expense_date)
      return date >= start && date <= end
    })
  }, [expenses, start, end])

  const categoryTotals = useMemo(() => {
    return getCategoryTotals(start, end)
  }, [getCategoryTotals, start, end])

  const totalSpent = useMemo(() => {
    return Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)
  }, [categoryTotals])

  // Pie chart data
  const pieData = useMemo(() => {
    return Object.entries(categoryTotals)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        name: getCategoryById(category).label,
        value: amount,
        color: getCategoryById(category).color,
        percentage: ((amount / totalSpent) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value)
  }, [categoryTotals, totalSpent])

  // Bar chart data (daily spending for the week)
  const barData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayExpenses = expenses.filter(exp => exp.expense_date === dayStr)
      const total = dayExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
      return {
        day: format(day, 'EEE'),
        amount: total
      }
    })
  }, [expenses])

  // Category progress data
  const categoryProgress = useMemo(() => {
    return categories.map(cat => {
      const spent = categoryTotals[cat.id] || 0
      const budget = categoryBudgets.find(b => b.category === cat.id)?.budget_limit || 0
      const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
      return {
        ...cat,
        spent,
        budget,
        percentage
      }
    }).filter(cat => cat.spent > 0 || cat.budget > 0)
  }, [categoryTotals, categoryBudgets])

  // Insights
  const insights = useMemo(() => {
    const insightList = []
    
    if (pieData.length > 0) {
      insightList.push(`🏆 ${pieData[0].name} is your highest spending category (${pieData[0].percentage}%)`)
    }

    const avgDaily = totalSpent / Math.max(periodExpenses.length, 1)
    if (avgDaily > 0) {
      insightList.push(`📊 Average daily spending: ${formatCurrency(avgDaily, currency)}`)
    }

    const maxDay = barData.reduce((max, day) => day.amount > max.amount ? day : max, { amount: 0 })
    if (maxDay.amount > 0) {
      insightList.push(`📅 ${maxDay.day} was your highest spending day this week`)
    }

    return insightList
  }, [pieData, totalSpent, periodExpenses, barData, currency])

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: '3months', label: '3 Months' },
    { id: 'year', label: 'This Year' }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Analytics 📊
      </h1>

      {/* Period Selector */}
      <div className="flex flex-wrap gap-2">
        {periods.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === p.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Total Spent */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <p className="text-primary-100">Total Spent ({periods.find(p => p.id === period)?.label})</p>
        <p className="text-4xl font-bold mt-2">{formatCurrency(totalSpent, currency)}</p>
        <p className="text-primary-100 mt-1">{periodExpenses.length} transactions</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Category Distribution
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data for selected period
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Daily Spending (This Week)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                formatter={(value) => formatCurrency(value, currency)}
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="amount" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Progress */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Category Breakdown
        </h2>
        <div className="space-y-4">
          {categoryProgress.map(cat => (
            <div key={cat.id}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {cat.label}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(cat.spent, currency)}
                  {cat.budget > 0 && ` / ${formatCurrency(cat.budget, currency)}`}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${cat.budget > 0 ? cat.percentage : (cat.spent / totalSpent) * 100}%`,
                    backgroundColor: cat.color 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            💡 Insights
          </h2>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <p key={index} className="text-gray-700 dark:text-gray-300">
                {insight}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics