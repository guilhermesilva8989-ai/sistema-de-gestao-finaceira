const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,

      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    },
  );

  if (!response.ok) {
    let errorData: ApiErrorResponse = {};

    try {
      errorData = await response.json();
    } catch {
      throw new Error(
        'Não foi possível comunicar com o servidor.',
      );
    }

    const message =
      Array.isArray(errorData.message)
        ? errorData.message.join(' ')
        : errorData.message;

    throw new Error(
      message ??
        'Ocorreu um erro inesperado.',
    );
  }

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  const text =
    await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export function getAccessToken() {
  if (
    typeof window === 'undefined'
  ) {
    return null;
  }

  return localStorage.getItem(
    'accessToken',
  );
}

export async function authenticatedApiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      'Sessão não encontrada. Faça login novamente.',
    );
  }

  return apiRequest<T>(
    path,
    {
      ...options,

      headers: {
        Authorization:
          `Bearer ${token}`,
        ...options?.headers,
      },
    },
  );
}
