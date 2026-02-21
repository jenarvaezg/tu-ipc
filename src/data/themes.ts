export interface ThemeDefinition {
  id: string
  name: string
  themeColor: string
  themeColorDark: string
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'hesperides',
    name: 'Hespérides',
    themeColor: '#F5C800',
    themeColorDark: '#D4AD00',
  },
]

const DEFAULT_THEME_COLOR = '#f97316'
const DEFAULT_THEME_COLOR_DARK = '#f97316'

export function getThemeById(id: string): ThemeDefinition | undefined {
  return THEMES.find(theme => theme.id === id)
}

export function isValidThemeId(id: string): boolean {
  return THEMES.some(theme => theme.id === id)
}

export function getThemeColor(themeId: string | null, isDark: boolean): string {
  if (!themeId) return isDark ? DEFAULT_THEME_COLOR_DARK : DEFAULT_THEME_COLOR
  const theme = getThemeById(themeId)
  if (!theme) return isDark ? DEFAULT_THEME_COLOR_DARK : DEFAULT_THEME_COLOR
  return isDark ? theme.themeColorDark : theme.themeColor
}
