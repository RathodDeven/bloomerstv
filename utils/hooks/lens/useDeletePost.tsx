import { deletePost } from '@lens-protocol/client/actions'
import {
  type DeletePostRequest,
  type DeletePostResult,
  type ResultAsync,
  type UnauthenticatedError,
  type UnexpectedError,
  useSessionClient
} from '@lens-protocol/react'
import { useState } from 'react'

interface UseHidePublicationReturn {
  execute: (
    request: DeletePostRequest
  ) => Promise<ResultAsync<DeletePostResult, UnexpectedError | UnauthenticatedError>>
  loading: boolean
  data: DeletePostResult | null
}

const useDeletePost = (): UseHidePublicationReturn => {
  const { data: sessionClient } = useSessionClient()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DeletePostResult | null>(null)

  const execute = async (
    request: DeletePostRequest
  ): Promise<ResultAsync<DeletePostResult, UnexpectedError | UnauthenticatedError>> => {
    setLoading(true)

    // @ts-expect-error - Handle potential type issues with sessionClient
    const result = await deletePost(sessionClient, request)

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

export default useDeletePost
