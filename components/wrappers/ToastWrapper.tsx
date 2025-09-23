import type React from 'react'
import { Toaster } from 'react-hot-toast'
import useIsMobile from '../../utils/hooks/useIsMobile'

const ToastWrapper = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile()
  return (
    <>
      <Toaster
        position={isMobile ? 'top-center' : 'top-left'}
        containerStyle={{
          marginTop: isMobile ? undefined : '40px'
        }}
      />
      {children}
    </>
  )
}

export default ToastWrapper
