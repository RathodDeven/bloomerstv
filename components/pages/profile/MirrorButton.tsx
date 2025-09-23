import type { AnyPost } from '@lens-protocol/react'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { Button, Tooltip } from '@mui/material'
import clsx from 'clsx'
import React, { useEffect } from 'react'
import { AnimatedCounter } from 'react-animated-counter'
import toast from 'react-hot-toast'
import useRepost from '../../../utils/hooks/lens/useRepost'
import useSession from '../../../utils/hooks/useSession'
import { useModal } from '../../common/ModalContext'
import { useTheme } from '../../wrappers/TailwindThemeProvider'

const MirrorButton = ({ post, repostsCount }: { post: AnyPost; repostsCount: number }) => {
  const { theme } = useTheme()
  const { isAuthenticated } = useSession()
  const { openModal } = useModal()
  const [isMirrored, setIsMirrored] = React.useState(false)
  const [newMirrorsCount, setNewMirrorsCount] = React.useState(repostsCount)

  const { execute: createRepost } = useRepost()

  const mustLogin = (infoMsg: string = 'Must Login'): boolean => {
    if (!isAuthenticated) {
      openModal('login')
      toast.error(infoMsg)
      return false
    }
    return true
  }

  const handleMirror = async () => {
    try {
      if (!mustLogin('Must Login to mirror')) return
      if (isMirrored) return
      setNewMirrorsCount(newMirrorsCount + 1)
      setIsMirrored(true)
      const result = await createRepost({
        post: post?.id
      })

      if (result.isErr()) {
        toast.error(result?.error?.message)
      }
    } catch (error) {
      console.log(error)
      // @ts-expect-error
      toast.error(error?.message ?? error)
    }
  }

  useEffect(() => {
    setNewMirrorsCount(repostsCount)
  }, [repostsCount])

  useEffect(() => {
    if (post?.__typename === 'Repost') return
    setIsMirrored(
      !!post?.operations?.hasReposted?.optimistic || !!post?.operations?.hasReposted?.onChain
    )
  }, [post?.id])

  return (
    <Tooltip title="Mirror" arrow>
      <Button
        size="small"
        color="secondary"
        variant="contained"
        onClick={handleMirror}
        startIcon={<AutorenewIcon className={clsx(isMirrored && 'text-brand')} />}
        sx={{
          boxShadow: 'none',
          borderRadius: '20px',
          paddingLeft: '14px'
        }}
      >
        <AnimatedCounter
          key={`mirror-counter-${theme}`} // Add key to force re-render on theme change
          value={newMirrorsCount}
          includeDecimals={false}
          includeCommas={true}
          color={theme === 'dark' ? '#ceced3' : '#1f1f23'}
          incrementColor="#1976d2"
          fontSize="15px"
          containerStyles={{
            marginTop: '4px',
            marginBottom: '4px'
          }}
        />
      </Button>
    </Tooltip>
  )
}

export default MirrorButton
