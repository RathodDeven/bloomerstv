import { addReaction } from '@lens-protocol/client/actions'
import {
  type AddReactionRequest,
  type AddReactionResult,
  type ResultAsync,
  type UnauthenticatedError,
  type UnexpectedError,
  useSessionClient
} from '@lens-protocol/react'
import { useState } from 'react'

interface UseAddReactionReturn {
  execute: (
    request: AddReactionRequest
  ) => Promise<ResultAsync<AddReactionResult, UnexpectedError | UnauthenticatedError>>
  loading: boolean
  data: AddReactionResult | null
}

const useAddReaction = (): UseAddReactionReturn => {
  const { data: sessionClient } = useSessionClient()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AddReactionResult | null>(null)

  const execute = async (
    request: AddReactionRequest
  ): Promise<ResultAsync<AddReactionResult, UnexpectedError | UnauthenticatedError>> => {
    setLoading(true)

    // @ts-expect-error - Handle potential type issues with sessionClient
    const result = await addReaction(sessionClient, request)

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

export default useAddReaction
