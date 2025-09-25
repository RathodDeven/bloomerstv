import { type AnyPost, PostReactionType } from '@lens-protocol/react'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Button, Tooltip } from '@mui/material'
import React, { useEffect } from 'react'
import { AnimatedCounter } from 'react-animated-counter'
import toast from 'react-hot-toast'
import { useLoginModal } from '../../../contexts/LoginModalContext'
import useAddReaction from '../../../utils/hooks/lens/useAddReaction'
import useUndoReaction from '../../../utils/hooks/lens/useUndoReaction'
import { useTheme } from '../../wrappers/TailwindThemeProvider'

const LikeButton = ({ post, likeCount }: { post: AnyPost; likeCount: number }) => {
  const { theme } = useTheme()
  const [liked, setLiked] = React.useState(false)
  const { requireAuth } = useLoginModal()
  const [newLikeCount, setNewLikeCount] = React.useState(likeCount)

  const { execute: addReaction } = useAddReaction()
  const { execute: undoReaction } = useUndoReaction()

  const handleLike = async () => {
    try {
      if (!requireAuth('Login required to like posts')) return

      if (liked) {
        setNewLikeCount(newLikeCount - 1)
        setLiked(false)
        await undoReaction({
          post: post?.id,
          reaction: PostReactionType.Upvote
        })
      } else {
        setNewLikeCount(newLikeCount + 1)
        setLiked(true)
        await addReaction({
          post: post?.id,
          reaction: PostReactionType.Upvote
        })
      }
    } catch (error) {
      console.log(error)
      // @ts-expect-error
      toast.error(error?.message ?? error)
    }
  }

  useEffect(() => {
    setNewLikeCount(likeCount)
  }, [likeCount])

  useEffect(() => {
    if (post?.__typename !== 'Repost') {
      setLiked(!!post?.operations?.hasUpvoted)
    }
  }, [post?.__typename !== 'Repost' && post])

  return (
    <>
      <Tooltip title="Like" arrow>
        <Button
          size="small"
          color="secondary"
          variant="contained"
          onClick={handleLike}
          startIcon={
            liked ? (
              <FavoriteIcon fontSize="small" className="text-brand" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )
          }
          sx={{
            boxShadow: 'none',
            borderRadius: '20px',
            paddingLeft: '14px'
          }}
        >
          <AnimatedCounter
            key={`like-counter-${theme}`} // Add key to force re-render on theme change
            value={newLikeCount}
            includeDecimals={false}
            includeCommas={true}
            incrementColor="#1976d2"
            fontSize="15px"
            containerStyles={{
              marginTop: '4px',
              marginBottom: '4px'
            }}
            color={theme === 'dark' ? '#ceced3' : '#1f1f23'}
          />
        </Button>
      </Tooltip>
    </>
  )
}

export default LikeButton
