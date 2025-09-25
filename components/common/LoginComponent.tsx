import { Role, useAccountsAvailable } from '@lens-protocol/react'
import { ConnectKitButton } from 'connectkit'
import React from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import useSession from '../../utils/hooks/useSession'
import AccountCreation from './LoginModal/AccountCreation'
import OnboardingAuth from './LoginModal/OnboardingAuth'
import ProfileSelection from './LoginModal/ProfileSelection'
import ProfileSwitcher from './LoginModal/ProfileSwitcher'
import WalletConnect from './LoginModal/WalletConnect'

const LoginComponent = ({
  onClose,
  isFullPage = false,
  onContinueAsGuest,
  startWithSignup = false,
  isProfileSwitching = false
}: {
  onClose?: () => void
  isFullPage?: boolean
  onContinueAsGuest?: () => void
  startWithSignup?: boolean
  isProfileSwitching?: boolean
}) => {
  const { disconnectAsync } = useDisconnect()
  const { isConnected, address } = useAccount()
  const [showCreateAccount, setShowCreateAccount] = React.useState(startWithSignup)
  const connectKitButtonRef = React.useRef<HTMLButtonElement>(null)

  const { data: profiles, loading: loadingProfiles } = useAccountsAvailable({
    managedBy: address,
    includeOwned: true
  })
  const { isAuthenticated, authenticatedUser } = useSession()

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

  const handleChangeWallet = async () => {
    // Disconnect current wallet
    await disconnectAsync()
    // Reset state
    setShowCreateAccount(false)
    // Trigger ConnectKit after a short delay
    setTimeout(() => {
      connectKitButtonRef.current?.click()
    }, 100)
  }

  const handleAccountCreationSuccess = () => {
    setShowCreateAccount(false)
  }

  const renderContent = () => {
    // If profile switching mode and authenticated
    if (isProfileSwitching && isAuthenticated) {
      // If user wants to create a new account from profile switcher
      if (showCreateAccount) {
        // Check if authenticated as onboarding user
        if (!authenticatedUser || authenticatedUser?.role !== Role.OnboardingUser) {
          return <OnboardingAuth address={address} autoAuthenticate={true} />
        }

        return (
          <AccountCreation
            onBack={() => setShowCreateAccount(false)}
            onSuccess={() => {
              setShowCreateAccount(false)
              onClose?.()
            }}
            isFullPage={isFullPage}
            hasExistingProfiles={true}
          />
        )
      }

      return (
        <ProfileSwitcher
          onClose={onClose}
          isFullPage={isFullPage}
        />
      )
    }

    // User is not connected - show wallet connect
    if (!isConnected) {
      return (
        <WalletConnect
          onContinueAsGuest={onContinueAsGuest}
          isFullPage={isFullPage}
          connectKitButtonRef={connectKitButtonRef!}
        />
      )
    }

    // User is connected but not authenticated
    if (!isAuthenticated) {
      // Determine if we should show create account or profile selection
      const shouldShowCreateAccount = showCreateAccount || profiles?.items?.length === 0

      if (shouldShowCreateAccount) {
        // If not authenticated as onboarding user yet, show onboarding auth
        if (!authenticatedUser || authenticatedUser?.role !== Role.OnboardingUser) {
          return <OnboardingAuth address={address} autoAuthenticate={true} />
        }

        // Authenticated as onboarding user, show account creation
        return (
          <AccountCreation
            onBack={
              profiles?.items && profiles.items.length > 0
                ? () => setShowCreateAccount(false)
                : undefined
            }
            onSuccess={handleAccountCreationSuccess}
            isFullPage={isFullPage}
            hasExistingProfiles={profiles?.items ? profiles.items.length > 0 : false}
          />
        )
      }

      // Show profile selection
      return (
        <ProfileSelection
          address={address}
          onClose={onClose}
          onCreateNew={() => setShowCreateAccount(true)}
          onChangeWallet={handleChangeWallet}
          onContinueAsGuest={onContinueAsGuest}
          isFullPage={isFullPage}
        />
      )
    }

    // User is authenticated - no content to show
    return null
  }

  return (
    <div className={isFullPage ? 'between-col h-full' : 'p-4 sm:p-0'}>
      {renderContent()}

      {/* Hidden ConnectKit button for triggering wallet connection */}
      <div style={{ display: 'none' }}>
        <ConnectKitButton.Custom>
          {({ show }) => (
            <button ref={connectKitButtonRef} onClick={show || (() => {})} data-connectkit-button />
          )}
        </ConnectKitButton.Custom>
      </div>
    </div>
  )
}

export default LoginComponent
