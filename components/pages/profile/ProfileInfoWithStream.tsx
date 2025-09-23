import type { Account, Post } from '@lens-protocol/react'
import { type SingleStreamer, useIsVerifiedQuery } from '../../../graphql/generated'
import ProfileBar from './ProfileBar'

const ProfileInfoWithStream = ({
  account,
  streamer,
  post,
  premium
}: {
  account: Account
  streamer?: SingleStreamer
  post?: Post
  premium?: boolean | null
}) => {
  const { data } = useIsVerifiedQuery({
    variables: {
      accountAddresses: [account?.address]
    },
    skip: !account?.address || Boolean(streamer) || premium !== null
  })

  if (!account) return null

  return (
    <div className="w-full">
      <ProfileBar
        premium={premium ?? Boolean(data?.isVerified?.[0]?.isVerified)}
        account={account}
        streamer={streamer}
        post={post}
      />
    </div>
  )
}

export default ProfileInfoWithStream
