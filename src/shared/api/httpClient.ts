import { env } from "../../config/env"


type QueryValue = string | number | boolean | null | undefined
type QueryParams = Record<string, QueryValue>

function buildUrl(path: string, query?: QueryParams): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${env.apiUrl}${normalizedPath}`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined || value === '') continue
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export async function httpGet<T>(path: string, query?: QueryParams): Promise<T> {
  const response = await fetch(buildUrl(path, query), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const data = await parseJsonSafe<T>(response)

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ??
      `HTTP ${response.status} al consultar ${path}`
    throw new Error(message)
  }

  if (data === null) {
    throw new Error(`Respuesta vacía en ${path}`)
  }

  return data
}

export async function httpPostForm<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  })

  const data = await parseJsonSafe<T>(response)

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ??
      `HTTP ${response.status} al enviar ${path}`
    throw new Error(message)
  }

  if (data === null) {
    throw new Error(`Respuesta vacía en ${path}`)
  }

  return data
}

export async function httpPostJson<TResponse, TBody extends Record<string, unknown>>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await parseJsonSafe<TResponse>(response)

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ??
      `HTTP ${response.status} al crear ${path}`
    throw new Error(message)
  }

  if (data === null) {
    throw new Error(`Respuesta vacía en ${path}`)
  }

  return data
}

export async function httpPatchJson<TResponse, TBody extends Record<string, unknown>>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await fetch(buildUrl(path), {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await parseJsonSafe<TResponse>(response)

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ??
      `HTTP ${response.status} al actualizar ${path}`
    throw new Error(message)
  }

  if (data === null) {
    throw new Error(`Respuesta vacía en ${path}`)
  }

  return data
}

export async function httpDelete(path: string): Promise<void> {
  const response = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })

  if (response.ok) {
    return
  }

  const data = await parseJsonSafe<{ message?: string }>(response)
  const message = data?.message ?? `HTTP ${response.status} al eliminar ${path}`
  throw new Error(message)
}
