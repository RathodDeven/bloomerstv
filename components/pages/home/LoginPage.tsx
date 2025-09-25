import { usePathname } from 'next/navigation'
import React from 'react'
import useSession from '../../../utils/hooks/useSession'
import LoginComponent from '../../common/LoginComponent'

const LoginPage = () => {
  const [loginAsGuest, setLoginAsGuest] = React.useState(false)
  const path = usePathname()
  const { isAuthenticated } = useSession()

  if (loginAsGuest || isAuthenticated || path !== '/') {
    return null
  }

  return (
    <div className="absolute z-[60] top-0 bottom-0 left-0 right-0 w-full h-dvh bg-p-bg p-8 overflow-auto no-scrollbar">
      <LoginComponent isFullPage={true} onContinueAsGuest={() => setLoginAsGuest(true)} />
    </div>
  )
}

export default LoginPage
