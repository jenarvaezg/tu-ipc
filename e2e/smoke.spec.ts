import { test, expect, type Page } from '@playwright/test'

async function getOverflowDiagnostics(page: Page) {
  return page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth
    const offenders: Array<{
      tag: string
      id: string
      className: string
      overRight: number
      width: number
      right: number
      clientWidth: number
      scrollWidth: number
      text: string
    }> = []

    document.querySelectorAll('*').forEach((element) => {
      const rect = element.getBoundingClientRect()
      const overRight = rect.right - viewportWidth
      if (overRight > 0.5) {
        offenders.push({
          tag: element.tagName,
          id: element.id,
          className: element.className,
          overRight: Number(overRight.toFixed(1)),
          width: Number(rect.width.toFixed(1)),
          right: Number(rect.right.toFixed(1)),
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          text: (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80),
        })
      }
    })

    offenders.sort((a, b) => b.overRight - a.overRight)

    return {
      viewportWidth,
      docClientWidth: document.documentElement.clientWidth,
      docScrollWidth: document.documentElement.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      offenders: offenders.slice(0, 30),
    }
  })
}

test('carga calculadora y no hay overflow horizontal global', async ({ page }) => {
  await page.goto('/?t=evolucion')

  await expect(page.getByRole('heading', { name: 'Tu IPC Personal' }).first()).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Rúbricas' })).toBeVisible()
  await expect(page.getByText('Evolución del IPC')).toBeVisible()

  const diagnostics = await getOverflowDiagnostics(page)
  expect(
    diagnostics.docScrollWidth <= diagnostics.docClientWidth + 1,
    `Overflow detectado: ${JSON.stringify(diagnostics, null, 2)}`
  ).toBeTruthy()
})

test('embed de rúbricas renderiza sin sidebar y sin overflow', async ({ page }) => {
  await page.goto('/?embed=1&t=rubricas')

  await expect(page.getByText('Selector de rúbricas')).toBeVisible()
  await expect(page.getByText('Inflación acumulada por rúbricas desde enero 2002')).toBeVisible()
  await expect(page.getByText('Comunidad Autónoma')).toHaveCount(0)

  const diagnostics = await getOverflowDiagnostics(page)
  expect(
    diagnostics.docScrollWidth <= diagnostics.docClientWidth + 1,
    `Overflow detectado: ${JSON.stringify(diagnostics, null, 2)}`
  ).toBeTruthy()
})
