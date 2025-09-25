import { type AccountAvailable, useAccountsAvailable, useSessionClient } from '@lens-protocol/react'
import { CircularProgress, Skeleton } from '@mui/material'
import clsx from 'clsx'
import React from 'react'
import toast from 'react-hot-toast'
import { useAccount } from 'wagmi'
import useSession from '../../../utils/hooks/useSession'
import formatHandle from '../../../utils/lib/formatHandle'
import getAvatar from '../../../utils/lib/getAvatar'

interface ProfileSwitcherProps {
  onClose?: () => void
  isFullPage?: boolean
}

const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ onClose, isFullPage = false }) => {
  const { address } = useAccount()
  const { account: currentAccount } = useSession()
  const { data: sessionClient } = useSessionClient()
  const [switchingToAddress, setSwitchingToAddress] = React.useState<string | undefined>()

  const { data: profiles, loading: loadingProfiles } = useAccountsAvailable({
    managedBy: address,
    includeOwned: true
  })

  const handleSwitchProfile = async (profile: AccountAvailable) => {
    if (!sessionClient) {
      toast.error('Session client not available')
      return
    }

    const accountAddress = profile.account.address

    if (accountAddress === currentAccount?.address) {
      return // Already the current account
    }

    setSwitchingToAddress(accountAddress)
    try {
      const result = await sessionClient.switchAccount({
        account: accountAddress
      })

      if (result.isErr()) {
        throw new Error(result.error.message)
      }

      toast.success(`Switched to ${formatHandle(profile.account)}`)
      window.location.reload()
      onClose?.()
    } catch (error: any) {
      console.error('Profile switch error:', error)
      toast.error(error?.message || 'Failed to switch profile')
    } finally {
      setSwitchingToAddress(undefined)
    }
  }

  return (
    <div className={isFullPage ? 'w-full max-w-md mx-auto' : 'w-full'}>
      <div className={isFullPage ? 'font-bold text-5xl mt-4 mb-8' : 'text-2xl font-bold mb-4'}>
        Switch Profile
      </div>

      <div className="w-full">
        <div className="text-s-text font-semibold mb-4">Choose a profile to switch to</div>
        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2">
          {loadingProfiles && (
            <>
              {[1, 2, 3, 4].map(index => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 rounded-xl border-2 border-p-border bg-s-bg"
                >
                  <Skeleton variant="circular" width={80} height={80} className="mb-2" />
                  <Skeleton variant="text" width={100} height={24} />
                  <Skeleton variant="text" width={80} height={16} />
                </div>
              ))}
            </>
          )}

          {!loadingProfiles &&
            profiles?.items?.map(profile => {
              const accountAddress = profile.account.address
              const isCurrentAccount = accountAddress === currentAccount?.address
              const isSwitching = switchingToAddress === accountAddress

              return (
                <div
                  className={clsx(
                    'flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all relative',
                    isCurrentAccount
                      ? 'border-brand bg-brand/10 hover:scale-100 cursor-default'
                      : isSwitching
                        ? 'border-brand bg-brand/10'
                        : 'border-p-border hover:border-brand/50 bg-s-bg hover:bg-p-hover hover:scale-105'
                  )}
                  key={accountAddress}
                  onClick={() => !isCurrentAccount && handleSwitchProfile(profile)}
                >
                  <div className="relative w-20 h-20 mb-2">
                    <img
                      src={getAvatar(profile.account)}
                      alt="avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                    {/* Current account overlay */}
                    {isCurrentAccount && (
                      <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">Logged In</span>
                      </div>
                    )}
                    {/* Switching overlay */}
                    {isSwitching && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <CircularProgress size={30} sx={{ color: 'white' }} />
                      </div>
                    )}
                  </div>
                  <div className="text-p-text font-semibold text-center truncate w-full">
                    {formatHandle(profile.account)}
                  </div>
                  {profile.account.metadata?.name && (
                    <div className="text-s-text text-xs text-center truncate w-full">
                      {profile.account.metadata.name}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default ProfileSwitcher
