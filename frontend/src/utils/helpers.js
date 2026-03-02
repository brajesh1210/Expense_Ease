import { format, isToday, isYesterday, parseISO } from 'date-fns'

export const formatCurrency = (amount, currency = '₹') => {
  return `${currency}${parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
}

export const formatDate = (dateString) => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
  
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'dd MMM yyyy')
}

export const formatDateShort = (dateString) => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
  return format(date, 'dd MMM')
}

export const groupExpensesByDate = (expenses) => {
  const grouped = {}
  
  expenses.forEach(expense => {
    const dateKey = expense.expense_date
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(expense)
  })
  
  return Object.entries(grouped)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(([date, items]) => ({
      date,
      formattedDate: formatDate(date),
      expenses: items
    }))
}

export const getDateRange = (period) => {
  const now = new Date()
  const end = new Date(now)
  let start

  switch (period) {
    case 'week':
      start = new Date(now)
      start.setDate(now.getDate() - 7)
      break
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case '3months':
      start = new Date(now)
      start.setMonth(now.getMonth() - 3)
      break
    case 'year':
      start = new Date(now.getFullYear(), 0, 1)
      break
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return { start, end }
}

export const exportToCSV = (expenses, filename = 'expenses.csv') => {
  const headers = ['Date', 'Category', 'Amount', 'Note', 'Payment Mode']
  const rows = expenses.map(exp => [
    exp.expense_date,
    exp.category,
    exp.amount,
    exp.note || '',
    exp.payment_mode
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}