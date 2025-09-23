'use client'
import type React from 'react'
import { ModalProvider } from '../common/ModalContext'
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
                <ShowLoadingWrapper>
                  <ModalProvider>
                    <ToastWrapper>
                      <UILayout>{children}</UILayout>
                    </ToastWrapper>
                  </ModalProvider>
                </ShowLoadingWrapper>
              </AuthProvider>
            </ApolloWrapper>
          </WaitForMount>
        </WagmiWrapper>
      </MuiThemeWrapper>
    </ThemeProvider>
  )
}

export default MasterWrappers
