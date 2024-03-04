import {
  Amount,
  Erc20,
  OpenActionKind,
  OpenActionModuleType,
  Post,
  SessionType,
  useApproveModule,
  useOpenAction,
  useSession
} from '@lens-protocol/react-web'
import React, { useEffect } from 'react'
import LayersIcon from '@mui/icons-material/Layers'
import { getRemainingTime } from '../../../utils/helpers'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'
import { defaultSponsored } from '../../../utils/config'
import toast from 'react-hot-toast'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import { useRef } from 'react'

const CollectButton = ({
  post,
  isFollowing
}: {
  post: Post
  isFollowing: boolean
}) => {
  const { data } = useSession()
  const { execute: approve } = useApproveModule()
  const { execute, error, loading } = useOpenAction({
    action: {
      kind: OpenActionKind.COLLECT
    }
  })
  const [hasCollected, setHasCollected] = React.useState(
    post?.operations?.hasCollected?.value
  )

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const controls = useAnimation()

  const handleMouseDown = () => {
    controls.start({ height: '100%' })
    timerRef.current = setTimeout(() => {
      handleCollect(post)
    }, 1000) // adjust this value as needed
  }

  const handleMouseUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (!loading) {
      controls.start({ height: '0%' })
    }
  }
  const approveCollectModuleFor = async (publication: Post) => {
    const result = await approve({ on: publication })

    if (result.isFailure()) {
      console.log(result.error.message)
      return
    }

    // try again the collect operation
    return handleCollect(publication)
  }

  useEffect(() => {
    if (!error) return
    handleMouseUp()
  }, [error])

  const handleCollect = async (post: Post) => {
    try {
      const result = await execute({
        publication: post,
        sponsored: defaultSponsored
      })

      if (result.isFailure()) {
        switch (result.error.name) {
          case 'BroadcastingError':
            console.log(
              'There was an error broadcasting the transaction',
              error?.message
            )
            toast.error(
              'There was an error broadcasting the transaction',
              // @ts-ignore
              String(error?.message)
            )
            break

          case 'PendingSigningRequestError':
            console.log(
              'There is a pending signing request in your wallet. ' +
                'Approve it or discard it and try again.'
            )
            toast.error(
              'There is a pending signing request in your wallet. ' +
                'Approve it or discard it and try again.'
            )
            break

          case 'InsufficientAllowanceError': {
            const requestedAmount = result.error.requestedAmount
            console.log(
              'You must approve the contract to spend at least: ' +
                `${requestedAmount.asset.symbol} ${requestedAmount.toSignificantDigits(6)}`
            )
            toast.error(
              'You must approve the contract to spend at least: ' +
                `${requestedAmount.asset.symbol} ${requestedAmount.toSignificantDigits(6)}`
            )
            return approveCollectModuleFor(post)
          }

          case 'InsufficientFundsError':
            const requestedAmount = result.error.requestedAmount
            console.log(
              'You do not have enough funds to pay for this collect fee: ' +
                `${requestedAmount.asset.symbol} ${requestedAmount.toSignificantDigits(6)}`
            )
            toast.error(
              'You do not have enough funds to pay for this collect fee: ' +
                `${requestedAmount.toSignificantDigits(6)} ${requestedAmount.asset.symbol}`
            )
            break

          case 'WalletConnectionError':
            console.log(
              'There was an error connecting to your wallet',
              // @ts-ignore
              error?.message
            )
            toast.error(
              'There was an error connecting to your wallet',
              // @ts-ignore
              String(error?.message)
            )
            break

          case 'UserRejectedError':
            // the user decided to not sign, usually this is silently ignored by UIs
            break
        }
        return
      }

      if (result.isSuccess()) {
        toast.success('Collect successful!')
        setHasCollected(true)
      }
    } catch (error) {
      // @ts-ignore
      toast.error(error?.message)
    }
  }

  if (
    data?.type !== SessionType.WithProfile ||
    !post?.openActionModules ||
    post?.openActionModules?.length === 0
  )
    return null

  const collectModule = post.openActionModules.find(
    (module) =>
      module.type === OpenActionModuleType.SimpleCollectOpenActionModule ||
      module.type ===
        OpenActionModuleType.MultirecipientFeeCollectOpenActionModule
  )

  if (
    !collectModule ||
    (collectModule?.type !==
      OpenActionModuleType.SimpleCollectOpenActionModule &&
      collectModule?.type !==
        OpenActionModuleType.MultirecipientFeeCollectOpenActionModule)
  )
    return null

  console.log('collectModule', collectModule)
  console.log('post?.operations?.canCollect', post?.operations?.canCollect)

  // @ts-ignore
  const amount = collectModule?.amount as Amount<Erc20> | undefined
  // @ts-ignore
  const collectLimit = collectModule?.collectLimit as number | undefined
  // @ts-ignore
  const referalFee = collectModule?.referalFee as number | undefined
  // @ts-ignore
  const timeRemaining = getRemainingTime(collectModule?.endsAt)

  // @ts-ignore
  const followerOnly = collectModule?.followerOnly

  // @ts-ignore
  if (collectModule?.endsAt || collectLimit) {
    // @ts-ignore
    if (!timeRemaining && collectModule?.endsAt) {
      return (
        <div className="centered-row px-3 text-p-text py-1 gap-x-1.5 cursor-pointer rounded-full bg-p-hover shrink-0">
          <LayersIcon fontSize="small" />
          <div className="start-col">
            <div className="font-semibold text-base leading-6">Expired</div>
          </div>
        </div>
      )
    }

    if (
      collectLimit &&
      post?.stats?.collects &&
      Number(collectLimit) - post?.stats?.collects <= 0
    ) {
      return (
        <div className="centered-row px-3 text-p-text py-1 gap-x-1.5 cursor-pointer rounded-full bg-p-hover shrink-0">
          <LayersIcon fontSize="small" />
          <div className="start-col">
            <div className="font-semibold text-base leading-6">
              Collect limit reached
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <AnimatePresence mode="wait">
      {!hasCollected ? (
        <motion.button
          onTapStart={
            () => {
              if (
                followerOnly &&
                !isFollowing &&
                post?.by?.id !== data?.profile?.id
              ) {
                return
              }
              handleMouseDown()
            }
            // start filling the background with black color from bottom
          }
          onTap={
            // if the background is filled with black color do nothing
            // else bring the black color that was filling down to the bottom
            handleMouseUp
          }
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative overflow-hidden outline-none border-none centered-row cursor-pointer text-white bg-brand rounded-full pl-1 pr-4 py-1 space-x-2 text-xs shrink-0"
        >
          <motion.div
            animate={controls}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '0%',
              zIndex: 1,
              backgroundColor: 'black',
              transition: 'height 0.5s ease-in' // adjust this value as needed
            }}
          />
          {loading ? (
            <motion.div
              animate={{ y: ['0%', '30%', '0%'] }}
              style={{ zIndex: 2 }}
              transition={{ duration: 0.5, loop: Infinity, ease: 'easeInOut' }}
            >
              <LayersIcon fontSize="small" style={{ zIndex: 2 }} />
            </motion.div>
          ) : (
            <LayersIcon fontSize="small" style={{ zIndex: 2 }} />
          )}

          <div className="centered-col" style={{ zIndex: 2 }}>
            <div className={'font-semibold text-base leading-6'}>
              {followerOnly &&
              !isFollowing &&
              post?.by?.id !== data?.profile?.id
                ? 'Follow to collect'
                : 'Hold to collect'}
            </div>

            <div className="start-center-row space-x-2">
              {/* @ts-ignore */}
              {amount?.value && amount?.value !== '0' && (
                // @ts-ignore
                <span>{`${amount?.value} ${amount.asset.symbol}`}</span>
              )}
              {collectLimit && (
                <span>{`${collectLimit - post?.stats?.collects}/${collectLimit} left`}</span>
              )}
              {referalFee && amount && (
                <span className="centered-row gap-x-0.5">
                  <CurrencyExchangeIcon fontSize="inherit" />
                  {`${referalFee}%`}
                </span>
              )}
              {timeRemaining && (
                <span className="centered-row gap-x-0.5">
                  <AccessTimeIcon fontSize="inherit" />
                  {`${timeRemaining}`}
                </span>
              )}
            </div>
          </div>
        </motion.button>
      ) : (
        <motion.div
          className="sm:block hidden px-3 text-brand py-1 cursor-pointer rounded-full bg-p-hover shrink-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="shrink-0 centered-row  gap-x-1.5">
            <LayersIcon fontSize="small" />
            <div className="start-col">
              <div className="font-semibold text-base leading-6">Collected</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CollectButton
