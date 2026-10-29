'use client'

import { useState } from 'react'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyEmpty from '@/components/MyEmpty'
import MyLoading from '@/components/MyLoading'
import { CheckIcon } from '@/components/Icons/Check'
import FacebookIcon from '@/components/Icons/SocialMedia/Facebook'
import { COPY_FEEDBACK_DURATION, REFERRAL, SHARE_URL } from '@/constants/app'
import useLanguage from '@/hooks/useLanguage'
import { useGetReferralSummary } from '@/hooks/reactQuery/useGetReferrals'
import { copyToClipboard, viewExternal } from '@/utils/functions'
import { buildReferralLink } from '@/utils/referral'
import { toast } from '@/utils/toast'

// My referral link (copy / share) + totals + the commission rule
const ReferralLinkCard = () => {
  const { translate } = useLanguage()
  const { summary, isLoading, isError, refetch } = useGetReferralSummary()
  const [isCopied, setIsCopied] = useState(false)

  const link = summary ? buildReferralLink(summary.referralCode) : ''
  const ratePercent = Math.round((summary?.commissionRate ?? REFERRAL.COMMISSION_RATE) * 100)

  const handleCopy = async () => {
    try {
      await copyToClipboard(link)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION)
    } catch {
      toast({ message: translate('common.error'), type: 'error' })
    }
  }

  // Native share sheet on mobile, copy elsewhere
  const handleShare = async () => {
    if (!navigator.share) return handleCopy()

    try {
      await navigator.share({ title: translate('referral.shareTitle'), text: translate('referral.shareText'), url: link })
    } catch {}
  }

  const stats = [
    { label: translate('referral.stats.referred'), value: summary?.totalReferred ?? 0 },
    { label: translate('referral.stats.orders'), value: summary?.totalCommissionOrders ?? 0 },
    { label: translate('referral.stats.points'), value: summary?.totalCommissionPoints ?? 0 },
  ]

  return (
    <MyCard>
      <MyCardHeader>
        <h2 className='text-lg font-bold text-text'>{translate('referral.title')}</h2>
        <p className='text-sm text-gray-500'>{translate('referral.subtitle', { rate: ratePercent })}</p>
      </MyCardHeader>
      <MyCardBody>
        {isLoading ? (
          <MyLoading />
        ) : isError || !summary ? (
          <MyEmpty
            message={translate('referral.loadError')}
            action={
              <MyButton variant='outline' onClick={() => refetch()}>
                {translate('common.retry')}
              </MyButton>
            }
          />
        ) : (
          <div className='space-y-5'>
            <div>
              <p className='mb-2 text-sm font-medium text-text'>{translate('referral.yourLink')}</p>
              <div className='flex flex-col gap-2 sm:flex-row'>
                <input
                  readOnly
                  value={link}
                  aria-label={translate('referral.yourLink')}
                  onFocus={(e) => e.target.select()}
                  className='min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text'
                />
                <div className='flex gap-2'>
                  <MyButton variant='primary' className='flex-1 gap-1 sm:flex-none' onClick={handleCopy}>
                    {isCopied && <CheckIcon className='size-4' />}
                    {translate(isCopied ? 'common.copied' : 'referral.copy')}
                  </MyButton>
                  <MyButton variant='outline' className='flex-1 sm:flex-none' onClick={handleShare}>
                    {translate('referral.share')}
                  </MyButton>
                  <MyButton
                    variant='outline'
                    aria-label={translate('referral.shareFacebook')}
                    onClick={() => viewExternal(`${SHARE_URL.FACEBOOK}${encodeURIComponent(link)}`)}
                  >
                    <FacebookIcon className='size-5' />
                  </MyButton>
                </div>
              </div>
              <p className='mt-2 text-xs text-gray-500'>{translate('referral.code', { code: summary.referralCode })}</p>
            </div>

            <div className='grid grid-cols-3 gap-3'>
              {stats.map((stat) => (
                <div key={stat.label} className='rounded-xl border border-border bg-background p-3 text-center'>
                  <p className='text-xl font-bold text-primary sm:text-2xl'>{stat.value.toLocaleString('vi-VN')}</p>
                  <p className='mt-1 text-xs text-gray-500'>{stat.label}</p>
                </div>
              ))}
            </div>

            <ul className='list-disc space-y-1 rounded-xl bg-primary/5 py-3 pl-8 pr-4 text-sm text-gray-600'>
              <li>{translate('referral.rules.share')}</li>
              <li>{translate('referral.rules.commission', { rate: ratePercent })}</li>
              <li>{translate('referral.rules.newOnly')}</li>
            </ul>
          </div>
        )}
      </MyCardBody>
    </MyCard>
  )
}

export default ReferralLinkCard
