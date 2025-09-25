'use client'
import type React from 'react'
import { LoginModalProvider } from '../../contexts/LoginModalContext'
import ApolloWrapper from './ApolloWrapper'
import { AuthProvider } from './AuthContext'
import MuiThemeWrapper from './MuiThemeWrapper'
import ShowLoadingWrapper from './ShowLoadingWrapper'
import ThemeProvider from './TailwindThemeProvider'
import ToastWrapper from './ToastWrapper'
import UILayout from './UILayout'
import WagmiWrapper from './WagmiWrapper'
import WaitForMount from './WaitForMount'

const MasterWrappers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <MuiThemeWrapper>
        <WagmiWrapper>
          <WaitForMount>
            <ApolloWrapper>
              <AuthProvider>
                <LoginModalProvider>
                  <ShowLoadingWrapper>
                    <ToastWrapper>
                      <UILayout>{children}</UILayout>
                    </ToastWrapper>
                  </ShowLoadingWrapper>
                </LoginModalProvider>
              </AuthProvider>
            </ApolloWrapper>
          </WaitForMount>
        </WagmiWrapper>
      </MuiThemeWrapper>
    </ThemeProvider>
  )
}

export default MasterWrappers
