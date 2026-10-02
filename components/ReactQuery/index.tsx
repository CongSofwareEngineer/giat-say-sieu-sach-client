'use client'
import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/reactQuery'
import { BRANCH_CACHE_DURATION } from '@/constants/app'
import BranchService from '@/services/branch'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function ReactQuery({ children }: { children: React.ReactNode }) {
  // Load branches on first visit so booking forms can filter provinces right away (cached 1 day in localStorage)
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: [QUERY_KEYS.getListBranches],
      queryFn: () => BranchService.getBranches(),
      staleTime: BRANCH_CACHE_DURATION,
    })
  }, [])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default ReactQuery
