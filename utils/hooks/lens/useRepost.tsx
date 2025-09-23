import { repost } from '@lens-protocol/client/actions'
import {
  type CreateRepostRequest,
  type PostResult,
  type ResultAsync,
  type UnauthenticatedError,
  type UnexpectedError,
  useSessionClient
} from '@lens-protocol/react'
import { useState } from 'react'

interface UseRepostReturn {
  execute: (
    request: CreateRepostRequest
  ) => Promise<ResultAsync<PostResult, UnexpectedError | UnauthenticatedError>>
  loading: boolean
  data: PostResult | null
}

const useRepost = (): UseRepostReturn => {
  const { data: sessionClient } = useSessionClient()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PostResult | null>(null)

  const execute = async (
    request: CreateRepostRequest
  ): Promise<ResultAsync<PostResult, UnexpectedError | UnauthenticatedError>> => {
    setLoading(true)

    // @ts-expect-error - Handle potential type issues with sessionClient
    const result = await repost(sessionClient, request)

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

export default useRepost
