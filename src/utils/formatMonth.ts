const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  const monthIndex = parseInt(m, 10) - 1
  if (monthIndex < 0 || monthIndex > 11) return month
  return `${MONTH_NAMES[monthIndex]} ${year}`
}
