import { blockAccount } from '@lens-protocol/client/actions'
import {
  type BlockRequest,
  type BlockResult,
  type ResultAsync,
  type UnauthenticatedError,
  type UnexpectedError,
  useSessionClient
} from '@lens-protocol/react'
import { useState } from 'react'

interface UseBlockAccountReturn {
  execute: (
    blockRequest: BlockRequest
  ) => Promise<ResultAsync<BlockResult, UnexpectedError | UnauthenticatedError>>
  loading: boolean
  data: BlockResult | null
}

const useBlockAccount = (): UseBlockAccountReturn => {
  const { data: sessionClient } = useSessionClient()

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<BlockResult | null>(null)

  const execute = async (
    blockRequest: BlockRequest
  ): Promise<ResultAsync<BlockResult, UnexpectedError | UnauthenticatedError>> => {
    setLoading(true)

    // @ts-expect-error - Handle potential type issues with sessionClient
    const result = await blockAccount(sessionClient, blockRequest)

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

export default useBlockAccount
