import { account as accountMetadata } from '@lens-protocol/metadata'
import {
  type LoginParams,
  useAccountsAvailable,
  useAccount as useFetchAccount,
  useLogin
} from '@lens-protocol/react'
import { signMessageWith } from '@lens-protocol/react/viem'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PermIdentityIcon from '@mui/icons-material/PermIdentity'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LoadingButton from '@mui/lab/LoadingButton'
import { Button, CircularProgress, Skeleton, TextField } from '@mui/material'
import clsx from 'clsx'
import { ConnectKitButton } from 'connectkit'
import React from 'react'
import toast from 'react-hot-toast'
import { useAccount, useDisconnect, useWalletClient } from 'wagmi'
import { APP_ADDRESS } from '../../utils/config'
import useCreateAccount from '../../utils/hooks/lens/useCreateAccount'
import useSession from '../../utils/hooks/useSession'
import formatHandle from '../../utils/lib/formatHandle'
import getAvatar from '../../utils/lib/getAvatar'
import { acl, storageClient } from '../../utils/lib/lens/storageClient'
import { stringToLength } from '../../utils/stringToLength'

const LoginComponent = ({
  onClose,
  isFullPage = false,
  onContinueAsGuest,
  startWithSignup = false
}: {
  onClose?: () => void
  isFullPage?: boolean
  onContinueAsGuest?: () => void
  startWithSignup?: boolean
}) => {
  const { data: walletClient } = useWalletClient()
  const { disconnectAsync } = useDisconnect()
  const { isConnected, address, isConnecting, isReconnecting } = useAccount()

  const [selectedAccountAddress, setSelectedAccountAddress] = React.useState<string>()
  const [showCreateAccount, setShowCreateAccount] = React.useState(startWithSignup)
  const [localName, setLocalName] = React.useState('')
  const connectKitButtonRef = React.useRef<HTMLButtonElement>(null)
  const { data: profiles, loading: loadingProfiles } = useAccountsAvailable({
    managedBy: address,
    includeOwned: true
  })
  const { isAuthenticated, authenticatedUser } = useSession()

  const { execute, loading: logging } = useLogin()
  const { execute: createAccount, loading: creating } = useCreateAccount()
  const { data: usernameCheck, loading: checkingUsername } = useFetchAccount({
    username: {
      localName
    }
  })

  // Auto-click ConnectKit button when modal opens without wallet
  React.useEffect(() => {
    if (!isFullPage && !isConnected && connectKitButtonRef.current) {
      setTimeout(() => {
        connectKitButtonRef.current?.click()
      }, 100)
    }
  }, [isFullPage, isConnected])

  // Auto-show create account when no profiles exist
  React.useEffect(() => {
    if (profiles?.items?.length === 0 && !loadingProfiles && isConnected) {
      setShowCreateAccount(true)
    }
  }, [profiles?.items?.length, loadingProfiles, isConnected])

  const handleCreateUsername = async () => {
    try {
      if (!checkingUsername && usernameCheck?.address) {
        toast.error('Username already exists')
        return
      }

      const account = accountMetadata({
        name: localName
      })

      const response = await storageClient.uploadAsJson(account, {
        acl: acl
      })

      await createAccount({
        username: {
          localName: localName
        },
        metadataUri: response?.uri
      })

      toast.success('Profile created successfully')
      setShowCreateAccount(false)
      setLocalName('')
      window.location.reload()
    } catch (e) {
      console.error(e)
      toast.error(stringToLength(String(e), 100))
    }
  }

  const onHandleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return
    setLocalName(e.target.value)
  }

  const handleChangeWallet = async () => {
    // Disconnect current wallet
    await disconnectAsync()
    // Reset state
    setShowCreateAccount(false)
    setLocalName('')
    setSelectedAccountAddress(undefined)
    // Trigger ConnectKit after a short delay
    setTimeout(() => {
      connectKitButtonRef.current?.click()
    }, 100)
  }

  return (
    <div className={isFullPage ? 'between-col h-full' : 'p-4 sm:p-0'}>
      {isConnected ? (
        !isAuthenticated ? (
          <>
            {showCreateAccount ? (
              // Create Account View
              <div className={isFullPage ? 'w-full max-w-md mx-auto' : 'w-full'}>
                <div className={isFullPage ? 'font-bold text-4xl mb-8' : 'text-2xl font-bold mb-4'}>
                  Create your account
                </div>
                <div className="text-s-text font-semibold text-sm mb-6">
                  Choose a unique username for your profile
                </div>

                <div className="space-y-4">
                  <TextField
                    className="w-full"
                    label="Username"
                    variant="outlined"
                    value={localName}
                    onChange={onHandleChange}
                    disabled={creating}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px'
                      }
                    }}
                    size="medium"
                    autoFocus
                  />

                  {localName && usernameCheck && !checkingUsername && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <span>Username not available!</span>
                    </div>
                  )}
                  {localName && usernameCheck && checkingUsername && (
                    <div className="text-s-text text-sm">Checking username...</div>
                  )}
                  {localName && !usernameCheck && !checkingUsername && (
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                      <CheckCircleIcon fontSize="small" />
                      <span>Username available!</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {profiles?.items && profiles.items.length > 0 && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setShowCreateAccount(false)
                          setLocalName('')
                        }}
                        disabled={creating}
                        fullWidth
                        sx={{
                          borderRadius: '24px',
                          padding: '12px 0'
                        }}
                      >
                        Back
                      </Button>
                    )}
                    <LoadingButton
                      variant="contained"
                      onClick={handleCreateUsername}
                      loading={checkingUsername || creating}
                      disabled={
                        checkingUsername || creating || !localName || usernameCheck?.address
                      }
                      fullWidth
                      startIcon={<PersonAddIcon />}
                      sx={{
                        borderRadius: '24px',
                        padding: '12px 0'
                      }}
                    >
                      {creating ? 'Creating...' : 'Create'}
                    </LoadingButton>
                  </div>
                </div>
              </div>
            ) : (
              // Profile Selection View
              <>
                {profiles?.items && profiles.items.length > 0 && (
                  <div
                    className={
                      isFullPage ? 'font-bold text-5xl mt-4 mb-8' : 'text-2xl font-bold mb-4'
                    }
                  >
                    Select your profile
                  </div>
                )}

                <div className={isFullPage ? 'start-col space-y-8 w-full' : 'w-full'}>
                  {profiles?.items && profiles.items.length > 0 && (
                    <div className="w-full">
                      <div className="text-s-text font-semibold mb-4">
                        Choose a profile to sign in
                      </div>
                      <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2">
                        {loadingProfiles && (
                          <>
                            {[1, 2, 3, 4].map(index => (
                              <div
                                key={index}
                                className="flex flex-col items-center p-4 rounded-xl border-2 border-p-border bg-s-bg"
                              >
                                <Skeleton
                                  variant="circular"
                                  width={80}
                                  height={80}
                                  className="mb-2"
                                />
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
                              onClick={async () => {
                                if (logging || selectedAccountAddress === profile?.account.address)
                                  return

                                setSelectedAccountAddress(profile?.account.address)

                                const params: LoginParams =
                                  profile?.__typename === 'AccountManaged'
                                    ? {
                                        accountManager: {
                                          account: profile.account.address,
                                          manager: address,
                                          app: APP_ADDRESS
                                        },
                                        signMessage: signMessageWith(walletClient!)
                                      }
                                    : {
                                        accountOwner: {
                                          account: profile.account.address,
                                          owner: address,
                                          app: APP_ADDRESS
                                        },
                                        signMessage: signMessageWith(walletClient!)
                                      }

                                const data = await execute(params)

                                if (data?.isOk()) {
                                  onClose?.()
                                  window.location.reload()
                                } else if (!data?.isOk() || data?.isErr()) {
                                  toast.error('Error logging in')
                                }
                              }}
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

                        {/* Create New Account Card - Always show this */}
                        <div
                          className="flex flex-col items-center p-4 rounded-xl border-2 border-p-border cursor-pointer transition-all hover:scale-105 hover:border-brand/50 bg-s-bg hover:bg-p-hover"
                          onClick={() => setShowCreateAccount(true)}
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
                </div>
              </>
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
                  onClick={handleChangeWallet}
                  className="text-s-text font-bold text-sm cursor-pointer hover:text-p-text transition-colors mt-2"
                >
                  Change wallet
                </div>
              </div>
            ) : (
              <div
                onClick={handleChangeWallet}
                className="unselectable text-p-text cursor-pointer w-fit font-bold text-sm hover:bg-p-hover rounded-full px-3 py-1 -ml-1 text-center mt-2"
              >
                Change wallet
              </div>
            )}
          </>
        ) : (
          <></>
          // <>
          //   {!authenticatedUser?.sponsored && (
          //     <>
          //       <div className="text-2xl font-bold ">
          //         Enable signless transactions
          //       </div>
          //       <div className="text-s-text font-semibold text-sm mb-4">
          //         This will allow you to post onchain without signing. No fees
          //         required.
          //       </div>

          //       {/* // todo enable sponsored action */}

          //       <div className="p-4 mb-4 rounded-lg bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200">
          //         <div className="font-medium">Coming Soon!</div>
          //         <div className="text-sm">
          //           Sponsored transactions will be available soon. Some
          //           features may be limited until then.
          //         </div>
          //       </div>

          //       <LoadingButton
          //         variant="contained"
          //         loading={loading}
          //         loadingPosition="start"
          //         startIcon={<AutoAwesomeIcon />}
          //         onClick={async () => {
          //           try {
          //             const { isOk } = await enableSignless()
          //             if (isOk()) {
          //               onClose?.()
          //             }
          //           } catch (e) {
          //             // @ts-expect-error
          //             toast.error(e.message)
          //           }
          //         }}
          //         sx={{
          //           borderRadius: '2rem'
          //         }}
          //         disabled={loading || data?.sponsored}
          //       >
          //         Approve signless
          //       </LoadingButton>
          //     </>
          //   )}
          // </>
        )
      ) : (
        <div className={isFullPage ? 'between-col h-full' : 'centered-col p-8'}>
          {!isFullPage && (
            <div className="text-center mb-6">
              <div className="text-2xl font-bold mb-2">Connect to continue</div>
              <div className="text-s-text text-sm">Connect your wallet to access your profiles</div>
            </div>
          )}
          {isFullPage && <div className="font-bold text-7xl my-16">Connect your wallet</div>}

          <div className={isFullPage ? 'start-col w-full my-6 space-y-8' : 'w-full'}>
            <ConnectKitButton.Custom>
              {({ show }) => (
                <LoadingButton
                  ref={connectKitButtonRef}
                  variant="contained"
                  onClick={show}
                  loading={isConnecting || isReconnecting}
                  loadingPosition="start"
                  startIcon={<AccountBalanceWalletIcon />}
                  fullWidth
                  size={isFullPage ? 'large' : 'medium'}
                  sx={{
                    borderRadius: isFullPage ? '2rem' : '24px',
                    padding: isFullPage ? '1rem 0' : '12px 0'
                  }}
                >
                  Connect Wallet
                </LoadingButton>
              )}
            </ConnectKitButton.Custom>
            {isFullPage && onContinueAsGuest && (
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
          </div>
        </div>
      )}

      {/* Hidden ConnectKit button for triggering wallet connection */}
      <div style={{ display: 'none' }}>
        <ConnectKitButton.Custom>
          {({ show }) => (
            <button
              ref={connectKitButtonRef}
              onClick={show || (() => {})}
              data-connectkit-button
            />
          )}
        </ConnectKitButton.Custom>
      </div>
    </div>
  )
}

export default LoginComponent
