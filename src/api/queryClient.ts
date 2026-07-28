import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Unused cache data is garbage collected after 15 minutes
      gcTime: 15 * 60 * 1000,
      // Refetch on window focus is disabled for mobile apps to prevent unnecessary background requests
      refetchOnWindowFocus: false,
      // Retry failed requests twice with exponential backoff
      retry: 2,
      // Prevent refetching on mount if data is fresh
      refetchOnMount: true,
      // Keep previous data when fetching new query parameters (e.g. pagination)
      placeholderData: (previousData: any) => previousData,
    },
  },
});
