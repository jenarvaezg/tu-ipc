import { test, expect } from '@playwright/test'

test('rubricas: renderiza curvas, persiste URL y aplica límite de selección', async ({ page }) => {
  await page.goto('/?t=rubricas')
  await expect(page.getByText('Selector de rúbricas')).toBeVisible()
  await expect(page.getByText('Benchmark horizontal (rojo)')).toBeVisible()

  await expect.poll(async () => page.locator('.recharts-line-curve').count()).toBeGreaterThan(0)

  // Quitar una selección por defecto debe persistir estado en URL.
  const firstSelected = page.getByRole('button', { name: /Quitar rúbrica/i }).first()
  await firstSelected.click()
  await expect.poll(() => new URL(page.url()).searchParams.get('rs')).not.toBeNull()

  // Limpiar y seleccionar 6 para validar límite.
  await page.getByRole('button', { name: 'Limpiar' }).click()
  const selectable = page.getByRole('button', { name: /Seleccionar rúbrica/i })
  for (let i = 0; i < 6; i += 1) {
    await selectable.nth(i).click()
  }

  await expect(page.getByText('6/6 seleccionadas')).toBeVisible()
  await expect(page.getByText('Límite alcanzado: máximo 6 rúbricas.')).toBeVisible()
  await expect.poll(() => new URL(page.url()).searchParams.get('rs')?.split(',').length ?? 0).toBe(6)
})
