import { unfollow } from '@lens-protocol/client/actions'
import {
  type CreateUnfollowRequest,
  type ResultAsync,
  type UnauthenticatedError,
  type UnexpectedError,
  type UnfollowResult,
  useSessionClient
} from '@lens-protocol/react'
import { useState } from 'react'

interface UseUnFollowReturn {
  execute: (
    request: CreateUnfollowRequest
  ) => Promise<ResultAsync<UnfollowResult, UnexpectedError | UnauthenticatedError>>
  loading: boolean
  data: UnfollowResult | null
}

const useUnFollow = (): UseUnFollowReturn => {
  const { data: sessionClient } = useSessionClient()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<UnfollowResult | null>(null)

  const execute = async (
    request: CreateUnfollowRequest
  ): Promise<ResultAsync<UnfollowResult, UnexpectedError | UnauthenticatedError>> => {
    setLoading(true)

    // @ts-expect-error - Handle potential type issues with sessionClient
    const result = await unfollow(sessionClient, request)

    setData(result?.isOk() ? result.value : null)
    setLoading(false)

    return result
  }

  return {
    execute,
    loading,
    data
  }
}

export default useUnFollow
