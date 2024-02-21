'use client'
import React, { useEffect, useState } from 'react'
import RainbowKitWrapper from './RainbowKitWrapper'
import UILayout from './UILayout'
import { useOnlyPWAOnMobile } from '../../utils/config'
import AddPWAPage from '../pages/home/AddPWAPage'
import LensWrapper from './LensWrapper'
import ThemeProvider from './TailwindThemeProvider'
import MuiThemeWrapper from './MuiThemeWrapper'
import ApolloWrapper from './ApolloWrapper'
import ShowLoadingWrapper from './ShowLoadingWrapper'
import ToastWrapper from './ToastWrapper'

const WrappersWithOnlyPwa = ({ children }: { children: React.ReactNode }) => {
  const [isPWA, setIsPWA] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (
      window.navigator.standalone ||
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      setIsPWA(true)
    }

    setIsMobile(window.matchMedia('(max-width: 767px)').matches)
  }, [])

  return (
    <ThemeProvider>
      <MuiThemeWrapper>
        <>
          {!isPWA && isMobile && useOnlyPWAOnMobile ? (
            <AddPWAPage />
          ) : (
            <>
              <RainbowKitWrapper>
                <LensWrapper>
                  <ApolloWrapper>
                    <ShowLoadingWrapper>
                      <ToastWrapper>
                        <UILayout>{children}</UILayout>
                      </ToastWrapper>
                    </ShowLoadingWrapper>
                  </ApolloWrapper>
                </LensWrapper>
              </RainbowKitWrapper>
            </>
          )}
        </>
      </MuiThemeWrapper>
    </ThemeProvider>
  )
}

export default WrappersWithOnlyPwa
