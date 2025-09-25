'use client'
import { Button } from '@mui/material'
import { useLoginModal } from '../../../../contexts/LoginModalContext'
import useSession from '../../../../utils/hooks/useSession'
import AvatarWithOptions from './AvatarWithOptions'

const LoginButton = () => {
  const { isAuthenticated } = useSession()
  const { openLoginModal, openSignupModal } = useLoginModal()

  return (
    <div className="centered-row space-x-3">
      {!isAuthenticated && (
        <>
          <Button
            variant="outlined"
            onClick={openLoginModal}
            size="small"
            sx={{
              borderRadius: '12px',
              textTransform: 'none'
            }}
          >
            Log In
          </Button>
          <Button
            variant="contained"
            onClick={openSignupModal}
            size="small"
            sx={{
              borderRadius: '12px',
              textTransform: 'none'
            }}
          >
            Sign Up
          </Button>
        </>
      )}
      <AvatarWithOptions />
    </div>
  )
}

export default LoginButton
