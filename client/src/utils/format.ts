export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(value)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}