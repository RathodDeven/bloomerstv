'use client'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { LensProvider, mainnet, PublicClient, testnet } from '@lens-protocol/react'
import { MiniAppProvider } from '@neynar/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, getDefaultConfig, getDefaultConnectors } from 'connectkit'
import React from 'react'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { base, lens, lensTestnet } from 'wagmi/chains'
// import { alchemyProvider } from 'wagmi/providers/alchemy'
import { APP_DESCRIPTION, APP_ICON_LINK, APP_LINK, APP_NAME, isMainnet } from '@/utils/config'
import { cookieStorage } from '../../utils/lib/lens/storage'

const defaultChains = isMainnet ? [lens, base] : [lensTestnet, base]

const defaultTransports = {
  [lens.id]: http(),
  [lensTestnet.id]: http(),
  [base.id]: http()
}

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    // @ts-expect-error
    chains: defaultChains,
    transports: defaultTransports,
    // Include both default connectors (for QR code) and farcasterMiniApp (for in-app)
    connectors: [
      ...getDefaultConnectors({
        app: {
          name: APP_NAME,
          description: APP_DESCRIPTION,
          url: APP_LINK,
          icon: APP_ICON_LINK
        },
        enableFamily: true,
        walletConnectProjectId: process.env.NEXT_PUBLIC_RAINBOW_KIT_PROJECT_ID!
      }),
      farcasterMiniApp()
      // Default connectors will be added automatically by getDefaultConfig
    ],
    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_RAINBOW_KIT_PROJECT_ID!,

    // Required App Info
    appName: APP_NAME,

    // Optional App Info
    appDescription: APP_DESCRIPTION,
    appUrl: APP_LINK, // your app's url
    appIcon: APP_ICON_LINK // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
)

const queryClient = new QueryClient()

const WagmiWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const client = PublicClient.create({
    environment: isMainnet ? mainnet : testnet,
    storage: typeof window !== 'undefined' ? localStorage : cookieStorage
  })

  // Return null or a loading state on server-side
  if (!mounted) {
    return null // Or a loading spinner
  }
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme={'auto'} mode={'dark'}>
          <LensProvider client={client}>
            <MiniAppProvider analyticsEnabled={true} backButtonEnabled={true}>
              {children}
            </MiniAppProvider>
          </LensProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default WagmiWrapper
