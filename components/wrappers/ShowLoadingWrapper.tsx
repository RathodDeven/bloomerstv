import { usePublicClient } from '@lens-protocol/react'
import type React from 'react'
import StartLoadingPage from '../pages/loading/StartLoadingPage'

const ShowLoadingWrapper = ({ children }: { children: React.ReactNode }) => {
  const { currentSession } = usePublicClient()

  if (!currentSession) {
    return (
      <div className="h-dvh">
        <StartLoadingPage />
      </div>
    )
  }
  return <>{children}</>
}

export default ShowLoadingWrapper
