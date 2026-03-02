export const categories = [
  { id: 'food', icon: '🍔', label: 'Food', color: '#FF6384' },
  { id: 'transport', icon: '🚗', label: 'Transport', color: '#36A2EB' },
  { id: 'shopping', icon: '🛒', label: 'Shopping', color: '#FFCE56' },
  { id: 'bills', icon: '📱', label: 'Bills', color: '#4BC0C0' },
  { id: 'entertainment', icon: '🎬', label: 'Entertainment', color: '#9966FF' },
  { id: 'education', icon: '📚', label: 'Education', color: '#FF9F40' },
  { id: 'health', icon: '🏥', label: 'Health', color: '#C9CBCF' },
  { id: 'others', icon: '📦', label: 'Others', color: '#7C8CF8' }
]

export const getCategoryById = (id) => {
  return categories.find(cat => cat.id === id) || categories[7]
}

export const paymentModes = [
  { id: 'cash', icon: '💵', label: 'Cash' },
  { id: 'upi', icon: '📱', label: 'UPI' },
  { id: 'card', icon: '💳', label: 'Card' }
]

export const getPaymentModeById = (id) => {
  return paymentModes.find(mode => mode.id === id) || paymentModes[0]
}