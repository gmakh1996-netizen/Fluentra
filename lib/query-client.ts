import { QueryClient } from "@tanstack/react-query";

/** Shared QueryClient factory. Server data fetching uses Server Components;
 *  TanStack Query handles client-side mutations and cache (chat history,
 *  vocabulary reviews, dashboard widgets that refetch). */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
      mutations: { retry: 0 },
    },
  });
}
