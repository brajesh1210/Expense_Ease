import { useAuth } from '../context/AuthContext'
import { useExpenses } from '../context/ExpenseContext'
import { Link } from 'react-router-dom'
import { PlusCircle, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { categories, getCategoryById } from '../utils/categories'
import { formatCurrency, formatDate, getDateRange } from '../utils/helpers'
import { useMemo } from 'react'

const Dashboard = () => {
  const { user } = useAuth()
  const { expenses, profile, getBudgetStatus, getCategoryTotals, loading } = useExpenses()

  const budgetStatus = getBudgetStatus()
  const recentExpenses = expenses.slice(0, 5)
  
  const { start, end } = useMemo(() => getDateRange('month'), [])
  const categoryTotals = getCategoryTotals(start, end)
  
  const pieData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: getCategoryById(category).label,
    value: amount,
    color: getCategoryById(category).color
  }))

  const currency = profile?.currency || '₹'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getBudgetBarColor = () => {
    switch (budgetStatus.status) {
      case 'danger': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your expense summary
          </p>
        </div>
        <Link to="/add" className="btn-primary">
          <PlusCircle className="w-5 h-5" />
          Add Expense
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(budgetStatus.spent, currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              budgetStatus.remaining >= 0 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {budgetStatus.remaining >= 0 
                ? <TrendingUp className="w-6 h-6 text-green-600" />
                : <TrendingDown className="w-6 h-6 text-red-600" />
              }
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Budget Left</p>
              <p className={`text-2xl font-bold ${
                budgetStatus.remaining >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency(Math.abs(budgetStatus.remaining), currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(budgetStatus.total, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Monthly Budget Progress
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {budgetStatus.percentage.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getBudgetBarColor()}`}
            style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
          />
        </div>
        {budgetStatus.status === 'warning' && (
          <p className="text-yellow-600 text-sm mt-2">
            ⚠️ You've used {budgetStatus.percentage.toFixed(0)}% of your monthly budget
          </p>
        )}
        {budgetStatus.status === 'danger' && (
          <p className="text-red-600 text-sm mt-2">
            🚨 You've exceeded your monthly budget!
          </p>
        )}
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Category Breakdown
          </h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value, currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {pieData.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No expenses this month
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>
            <Link 
              to="/history" 
              className="text-primary-600 text-sm hover:underline"
            >
              View All
            </Link>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const category = getCategoryById(expense.category)
                return (
                  <div 
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {expense.note || category.label}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(expense.expense_date)}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      -{formatCurrency(expense.amount, currency)}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No expenses yet</p>
              <Link to="/add" className="text-primary-600 hover:underline">
                Add your first expense
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard