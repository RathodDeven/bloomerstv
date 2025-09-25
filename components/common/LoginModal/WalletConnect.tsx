import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PermIdentityIcon from '@mui/icons-material/PermIdentity'
import LoadingButton from '@mui/lab/LoadingButton'
import { Button } from '@mui/material'
import { ConnectKitButton } from 'connectkit'
import React from 'react'
import { useAccount } from 'wagmi'

interface WalletConnectProps {
  onContinueAsGuest?: () => void
  isFullPage?: boolean
  connectKitButtonRef?: React.RefObject<HTMLButtonElement | null>
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  onContinueAsGuest,
  isFullPage = false,
  connectKitButtonRef
}) => {
  const { isConnecting, isReconnecting } = useAccount()
  const internalButtonRef = React.useRef<HTMLButtonElement>(null)
  const buttonRef = connectKitButtonRef || internalButtonRef

  return (
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
              ref={buttonRef}
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
  )
}

export default WalletConnect
