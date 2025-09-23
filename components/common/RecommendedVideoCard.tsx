import type { Post } from '@lens-protocol/react'
import useIsMobile from '../../utils/hooks/useIsMobile'
import getPublicationData from '../../utils/lib/getPublicationData'
import HomeVideoCard from './HomeVideoCard'
import RecommendedCardLayout from './RecommendedCardLayout'

const RecommendedVideoCard = ({ post }: { post: Post }) => {
  const isMobile = useIsMobile()

  const asset = getPublicationData(post?.metadata)?.asset

  if (isMobile) {
    return <HomeVideoCard post={post} />
  }

  return (
    <RecommendedCardLayout
      // @ts-expect-error
      title={post?.metadata?.title}
      postLink={`/watch/${post?.slug}`}
      coverUrl={asset?.cover}
      account={post?.author}
      stats={post?.stats}
      createdAt={post?.timestamp}
      duration={
        post?.metadata?.__typename === 'VideoMetadata'
          ? (post?.metadata?.video?.duration ?? undefined)
          : undefined
      }
    />
  )
}

export default RecommendedVideoCard
