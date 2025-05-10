import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient();
}

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  return fetch(input, {
    ...init,
    credentials: 'include', // dołącza cookies (w tym supabase)
  });
}
