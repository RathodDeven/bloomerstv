import { type LoginParams, useAccountsAvailable, useLogin } from '@lens-protocol/react'
import { signMessageWith } from '@lens-protocol/react/viem'
import AddIcon from '@mui/icons-material/Add'
import PermIdentityIcon from '@mui/icons-material/PermIdentity'
import { Button, CircularProgress, Skeleton } from '@mui/material'
import clsx from 'clsx'
import React from 'react'
import toast from 'react-hot-toast'
import { useWalletClient } from 'wagmi'
import { APP_ADDRESS } from '../../../utils/config'
import formatHandle from '../../../utils/lib/formatHandle'
import getAvatar from '../../../utils/lib/getAvatar'

interface ProfileSelectionProps {
  address?: `0x${string}`
  onClose?: () => void
  onCreateNew: () => void
  onChangeWallet: () => void
  onContinueAsGuest?: () => void
  isFullPage?: boolean
}

const ProfileSelection: React.FC<ProfileSelectionProps> = ({
  address,
  onClose,
  onCreateNew,
  onChangeWallet,
  onContinueAsGuest,
  isFullPage = false
}) => {
  const { data: walletClient } = useWalletClient()
  const [selectedAccountAddress, setSelectedAccountAddress] = React.useState<string>()
  const { data: profiles, loading: loadingProfiles } = useAccountsAvailable({
    managedBy: address,
    includeOwned: true
  })
  const { execute: login, loading: logging } = useLogin()

  const handleProfileLogin = async (profile: any) => {
    if (logging || selectedAccountAddress === profile?.account.address) return

    setSelectedAccountAddress(profile?.account.address)

    const params: LoginParams =
      profile?.__typename === 'AccountManaged'
        ? {
            accountManager: {
              account: profile.account.address,
              manager: address!,
              app: APP_ADDRESS
            },
            signMessage: signMessageWith(walletClient!)
          }
        : {
            accountOwner: {
              account: profile.account.address,
              owner: address!,
              app: APP_ADDRESS
            },
            signMessage: signMessageWith(walletClient!)
          }

    const data = await login(params)

    if (data?.isOk()) {
      onClose?.()
    } else {
      toast.error('Error logging in')
      setSelectedAccountAddress(undefined)
    }
  }

  return (
    <>
      {profiles?.items && profiles.items.length > 0 && (
        <div className={isFullPage ? 'font-bold text-5xl mt-4 mb-8' : 'text-2xl font-bold mb-4'}>
          Select your profile
        </div>
      )}

      <div className={isFullPage ? 'start-col space-y-8 w-full' : 'w-full'}>
        {profiles?.items && profiles.items.length > 0 && (
          <div className="w-full">
            <div className="text-s-text font-semibold mb-4">Choose a profile to sign in</div>
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
                profiles?.items?.map(profile => (
                  <div
                    className={clsx(
                      'flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105',
                      selectedAccountAddress === profile?.account.address
                        ? 'border-brand bg-brand/10'
                        : 'border-p-border hover:border-brand/50 bg-s-bg hover:bg-p-hover'
                    )}
                    key={profile?.account?.address}
                    onClick={() => handleProfileLogin(profile)}
                  >
                    <div className="relative w-20 h-20 mb-2">
                      <img
                        src={getAvatar(profile?.account)}
                        alt="avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                      {logging && selectedAccountAddress === profile?.account.address && (
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                          <CircularProgress size={30} sx={{ color: 'white' }} />
                        </div>
                      )}
                    </div>
                    <div className="text-p-text font-semibold text-center truncate w-full">
                      {formatHandle(profile?.account)}
                    </div>
                    {profile?.account?.metadata?.name && (
                      <div className="text-s-text text-xs text-center truncate w-full">
                        {profile.account.metadata.name}
                      </div>
                    )}
                  </div>
                ))}

              {/* Create New Account Card */}
              <div
                className="flex flex-col items-center p-4 rounded-xl border-2 border-p-border cursor-pointer transition-all hover:scale-105 hover:border-brand/50 bg-s-bg hover:bg-p-hover"
                onClick={onCreateNew}
              >
                <div className="w-20 h-20 rounded-full bg-p-hover flex items-center justify-center mb-2">
                  <AddIcon className="text-s-text" sx={{ fontSize: 40 }} />
                </div>
                <div className="text-p-text font-semibold text-center">Create New</div>
                <div className="text-s-text text-xs text-center">Account</div>
              </div>
            </div>
          </div>
        )}

        {isFullPage ? (
          <div className="start-col space-y-4 w-full">
            {onContinueAsGuest && (
              <Button
                startIcon={<PermIdentityIcon />}
                onClick={onContinueAsGuest}
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                className="text-3xl"
                sx={{
                  borderRadius: '2rem',
                  padding: '1rem 0'
                }}
              >
                Continue as guest
              </Button>
            )}
            <div
              onClick={onChangeWallet}
              className="text-s-text font-bold text-sm cursor-pointer hover:text-p-text transition-colors mt-2"
            >
              Change wallet
            </div>
          </div>
        ) : (
          <div
            onClick={onChangeWallet}
            className="unselectable text-p-text cursor-pointer w-fit font-bold text-sm hover:bg-p-hover rounded-full px-3 py-1 -ml-1 text-center mt-2"
          >
            Change wallet
          </div>
        )}
      </div>
    </>
  )
}

export default ProfileSelection