import { env } from "../../config/env"

export class HttpError extends Error {
  public readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.status = status
  }
}

let unauthorizedHandler: (() => void) | undefined

export function setUnauthorizedHandler(handler: (() => void) | undefined): () => void {
  unauthorizedHandler = handler

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = undefined
    }
  }
}

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

function throwHttpError(path: string, response: Response, data: unknown): never {
  if (response.status === 401) {
    unauthorizedHandler?.()
  }

  const message =
    (data as { message?: string } | null)?.message ??
    `HTTP ${response.status} en ${path}`

  throw new HttpError(message, response.status)
}

export async function httpGet<T>(path: string, query?: QueryParams): Promise<T> {
  const response = await fetch(buildUrl(path, query), {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  const data = await parseJsonSafe<T>(response)

  if (!response.ok) {
    throwHttpError(path, response, data)
  }

  if (data === null) {
    throw new Error(`Respuesta vacía en ${path}`)
  }

  return data
}

export async function httpPostForm<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  })

  const data = await parseJsonSafe<T>(response)

  if (!response.ok) {
    throwHttpError(path, response, data)
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
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await parseJsonSafe<TResponse>(response)

  if (!response.ok) {
    throwHttpError(path, response, data)
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
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await parseJsonSafe<TResponse>(response)

  if (!response.ok) {
    throwHttpError(path, response, data)
  }

  if (data === null) {
    throw new Error(`Respuesta vacía en ${path}`)
  }

  return data
}

export async function httpDelete(path: string): Promise<void> {
  const response = await fetch(buildUrl(path), {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  if (response.ok) {
    return
  }

  const data = await parseJsonSafe<{ message?: string }>(response)
  throwHttpError(path, response, data)
}
