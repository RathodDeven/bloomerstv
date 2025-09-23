import { immutable, StorageClient } from '@lens-chain/storage-client'
import { lens, lensTestnet } from 'wagmi/chains'
import { isMainnet } from '../../config'

export const storageClient = StorageClient.create()

export const acl = immutable(isMainnet ? lens.id : lensTestnet.id)
