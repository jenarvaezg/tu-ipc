const DEFAULT_ATTEMPTS = 4
const DEFAULT_DELAY_MS = 3000
const DEFAULT_BACKOFF_FACTOR = 2

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function withRetryFlag(error, retriable) {
  error.retriable = retriable
  return error
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

function isRetriableError(error) {
  if (error && typeof error === 'object' && 'retriable' in error) {
    return error.retriable === true
  }
  return true
}

export function shouldRetryHttpStatus(status) {
  return status === 408 || status === 429 || (status >= 500 && status <= 599)
}

export function isRetriableInePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false

  const status = String(payload.status || payload.Status || '')
  return /petici[oó]n en proceso|actualice p[aá]gina pasados unos minutos/i.test(status)
}

export async function fetchJsonWithRetry(url, label, options = {}) {
  const attempts = Math.max(1, options.attempts ?? DEFAULT_ATTEMPTS)
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS
  const backoffFactor = options.backoffFactor ?? DEFAULT_BACKOFF_FACTOR
  const fetchImpl = options.fetchImpl ?? fetch
  const sleep = options.sleep ?? wait
  const onRetry =
    options.onRetry ??
    ((message) => {
      console.warn(`  ${message}`)
    })

  let lastError
  let attemptsUsed = 0

  for (let attempt = 1; attempt <= attempts; attempt++) {
    attemptsUsed = attempt
    try {
      const resp = await fetchImpl(url)

      if (!resp.ok) {
        throw withRetryFlag(
          new Error(`HTTP ${resp.status} fetching ${label}`),
          shouldRetryHttpStatus(resp.status)
        )
      }

      const payload = await resp.json()
      if (isRetriableInePayload(payload)) {
        throw withRetryFlag(
          new Error(`Respuesta temporal del INE en ${label}: ${payload.status || payload.Status}`),
          true
        )
      }

      return payload
    } catch (error) {
      lastError = error
      if (!isRetriableError(error) || attempt === attempts) break

      const waitMs = Math.round(delayMs * Math.pow(backoffFactor, attempt - 1))
      onRetry(
        `${label}: ${errorMessage(error)}. Reintento ${attempt + 1}/${attempts} en ${waitMs} ms`
      )
      await sleep(waitMs)
    }
  }

  const suffix = attemptsUsed > 1 ? ` tras ${attemptsUsed} intentos` : ''
  throw new Error(`${label}: no se pudo descargar${suffix}. ${errorMessage(lastError)}`, {
    cause: lastError,
  })
}
