import PersonIcon from '@mui/icons-material/Person'
import { ConnectKitButton } from 'connectkit'
import type React from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAccount } from 'wagmi'
import LoginComponent from '../components/common/LoginComponent'
import ModalWrapper from '../components/ui/Modal/ModalWrapper'
import useSession from '../utils/hooks/useSession'

interface LoginModalContextType {
  requireAuth: (message?: string) => boolean
  openLoginModal: () => void
  openSignupModal: () => void
  openProfileSwitcher: () => void
  closeLoginModal: () => void
  isLoginModalOpen: boolean
  startWithSignup: boolean
  isProfileSwitching: boolean
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined)

export const useLoginModal = () => {
  const context = useContext(LoginModalContext)
  if (!context) {
    throw new Error('useLoginModal must be used within LoginModalProvider')
  }
  return context
}

export const LoginModalProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSession()
  const { isConnected } = useAccount()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [startWithSignup, setStartWithSignup] = useState(false)
  const [isProfileSwitching, setIsProfileSwitching] = useState(false)
  const [loginIntended, setLoginIntended] = useState(false)
  const connectButtonRef = useRef<HTMLButtonElement | null>(null)

  // Handle wallet connection state changes
  useEffect(() => {
    if (isConnected && loginIntended && !isAuthenticated) {
      setIsLoginModalOpen(true)
      setLoginIntended(false)
    }
  }, [isConnected, loginIntended, isAuthenticated])

  const openLoginModal = () => {
    setStartWithSignup(false)
    if (!isConnected) {
      // Trigger ConnectKit instead
      setLoginIntended(true)
      setTimeout(() => {
        connectButtonRef.current?.click()
      }, 100)
    } else if (!isAuthenticated) {
      setIsLoginModalOpen(true)
    }
  }

  const openSignupModal = () => {
    setStartWithSignup(true)
    setIsProfileSwitching(false)
    if (!isConnected) {
      // Trigger ConnectKit instead
      setLoginIntended(true)
      setTimeout(() => {
        connectButtonRef.current?.click()
      }, 100)
    } else if (!isAuthenticated) {
      setIsLoginModalOpen(true)
    }
  }

  const openProfileSwitcher = () => {
    setIsProfileSwitching(true)
    setStartWithSignup(false)
    setIsLoginModalOpen(true)
  }

  const closeLoginModal = () => {
    setIsLoginModalOpen(false)
    setLoginIntended(false)
    setStartWithSignup(false)
    setIsProfileSwitching(false)
  }

  const requireAuth = (message: string = 'Login required'): boolean => {
    if (!isAuthenticated) {
      console.log('Auth required, user not authenticated')
      toast.error(message)
      openLoginModal()
      return false
    }
    return true
  }

  return (
    <LoginModalContext.Provider
      value={{
        requireAuth,
        openLoginModal,
        openSignupModal,
        openProfileSwitcher,
        closeLoginModal,
        isLoginModalOpen,
        startWithSignup,
        isProfileSwitching
      }}
    >
      {children}

      {/* Hidden ConnectKit button for triggering */}
      <div style={{ display: 'none' }}>
        <ConnectKitButton.Custom>
          {({ show }) => (
            <button ref={connectButtonRef} onClick={show || (() => {})} data-connectkit-button />
          )}
        </ConnectKitButton.Custom>
      </div>

      {/* Global Login Modal - High z-index to stay above all other modals */}
      <ModalWrapper
        open={isLoginModalOpen}
        title={isProfileSwitching ? "Switch Profile" : "Login"}
        Icon={<PersonIcon fontSize="small" />}
        onClose={closeLoginModal}
        onOpen={openLoginModal}
        classname="w-[450px]"
        zIndex={9999}
      >
        <LoginComponent
          onClose={closeLoginModal}
          startWithSignup={startWithSignup}
          isProfileSwitching={isProfileSwitching}
        />
      </ModalWrapper>
    </LoginModalContext.Provider>
  )
}
