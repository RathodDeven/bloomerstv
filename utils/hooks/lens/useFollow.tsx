import { follow } from '@lens-protocol/client/actions'
import {
  type CreateFollowRequest,
  type FollowResult,
  type ResultAsync,
  type UnauthenticatedError,
  type UnexpectedError,
  useSessionClient
} from '@lens-protocol/react'
import { useState } from 'react'

interface UseFollowReturn {
  execute: (
    createFollowRequest: CreateFollowRequest
  ) => Promise<ResultAsync<FollowResult, UnexpectedError | UnauthenticatedError>>
  loading: boolean
  data: FollowResult | null
}

const useFollow = (): UseFollowReturn => {
  const { data: sessionClient } = useSessionClient()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<FollowResult | null>(null)

  const execute = async (
    createFollowRequest: CreateFollowRequest
  ): Promise<ResultAsync<FollowResult, UnexpectedError | UnauthenticatedError>> => {
    setLoading(true)

    // @ts-expect-error - Handle potential type issues with sessionClient
    const result = await follow(sessionClient, createFollowRequest)

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

export default useFollow
