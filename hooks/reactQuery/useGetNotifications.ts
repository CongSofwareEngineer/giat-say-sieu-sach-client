import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { NOTIFICATION_INBOX } from '@/constants/app'
import { QUERY_KEYS } from '@/constants/reactQuery'
import useUser from '@/hooks/useUser'
import { NotificationInboxService } from '@/services/notification'

// In-app notifications of the logged-in customer (Header bell) + mark as read
const useGetNotifications = () => {
  const queryClient = useQueryClient()
  const { isLogin, hasHydrated, user } = useUser()

  const queryKey = [QUERY_KEYS.getNotifications, user?.id ?? '']

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => NotificationInboxService.getMine({ limit: NOTIFICATION_INBOX.pageSize }),
    enabled: hasHydrated && isLogin && !!user?.id,
    refetchInterval: NOTIFICATION_INBOX.refetchIntervalMs,
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getNotifications] })

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => NotificationInboxService.markRead(id),
    onSuccess: refresh,
  })

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => NotificationInboxService.markAllRead(),
    onSuccess: refresh,
  })

  return {
    notifications: data?.data ?? [],
    unreadCount: data?.meta?.unreadCount ?? 0,
    isLoading,
    markRead,
    markAllRead,
    refresh,
  }
}

export default useGetNotifications
