import { Role, useLogin } from '@lens-protocol/react'
import { signMessageWith } from '@lens-protocol/react/viem'
import LoadingButton from '@mui/lab/LoadingButton'
import { CircularProgress } from '@mui/material'
import React from 'react'
import toast from 'react-hot-toast'
import { useWalletClient } from 'wagmi'
import { APP_ADDRESS } from '../../../utils/config'
import useSession from '../../../utils/hooks/useSession'

interface OnboardingAuthProps {
  address?: `0x${string}`
  autoAuthenticate?: boolean
}

const OnboardingAuth: React.FC<OnboardingAuthProps> = ({ address, autoAuthenticate = true }) => {
  const { data: walletClient } = useWalletClient()
  const { authenticatedUser } = useSession()
  const { execute: login } = useLogin()
  const [authenticating, setAuthenticating] = React.useState(false)
  const [hasAttempted, setHasAttempted] = React.useState(false)

  console.log('walletClient', walletClient)
  console.log('address', address)
  console.log('authenticatedUser', authenticatedUser)

  const authenticateAsOnboardingUser = async () => {
    if (authenticatedUser?.role === Role.OnboardingUser) {
      return
    }

    if (!walletClient || !address) {
      toast.error('Wallet not connected')
      return
    }

    setAuthenticating(true)
    try {
      const loginResult = await login({
        onboardingUser: {
          wallet: address,
          app: APP_ADDRESS
        },
        signMessage: signMessageWith(walletClient)
      })

      if (loginResult?.isErr()) {
        toast.error('Failed to authenticate. Please try again.')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      toast.error('Authentication failed')
    } finally {
      setAuthenticating(false)
      setHasAttempted(true)
    }
  }

  React.useEffect(() => {
    if (
      autoAuthenticate &&
      !hasAttempted &&
      (!authenticatedUser || authenticatedUser?.role !== Role.OnboardingUser) &&
      Boolean(walletClient)
    ) {
      authenticateAsOnboardingUser()
    }
  }, [autoAuthenticate, authenticatedUser?.role, Boolean(walletClient)])

  if (authenticatedUser?.role === Role.OnboardingUser) {
    return null
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="text-2xl font-bold mb-2">Setting up your account</div>
        <div className="text-s-text text-sm mb-4">
          {authenticating
            ? 'Please sign the message to continue...'
            : 'We need to authenticate you to create your profile'}
        </div>
      </div>

      {authenticating ? (
        <div className="flex justify-center py-8">
          <CircularProgress size={48} />
        </div>
      ) : (
        hasAttempted && (
          <LoadingButton
            variant="contained"
            onClick={authenticateAsOnboardingUser}
            loading={authenticating}
            fullWidth
            sx={{
              borderRadius: '24px',
              padding: '12px 0'
            }}
          >
            Try Again
          </LoadingButton>
        )
      )}
    </div>
  )
}

export default OnboardingAuth
