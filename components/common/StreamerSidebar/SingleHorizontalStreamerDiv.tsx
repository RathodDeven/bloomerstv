import type { Account } from '@lens-protocol/react'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LoadingButton from '@mui/lab/LoadingButton'
import Link from 'next/link'
import toast from 'react-hot-toast'
import useFollow from '../../../utils/hooks/lens/useFollow'
import useSession from '../../../utils/hooks/useSession'
import formatHandle from '../../../utils/lib/formatHandle'
import getAvatar from '../../../utils/lib/getAvatar'
import { stringToLength } from '../../../utils/stringToLength'
import LiveDiv from '../../ui/LiveDiv'
import LoadingImage from '../../ui/LoadingImage'
import VerifiedBadge from '../../ui/VerifiedBadge'

const SingleHorizontalStreamerDiv = ({
  account,
  premium,
  live = false
}: {
  account: Account
  live?: boolean
  premium?: boolean
}) => {
  const { isAuthenticated, isLensAuthenticated, authenticatedUser } = useSession()

  const { execute, loading: followLoading, data } = useFollow()

  const handleFollow = async (account: Account) => {
    try {
      if (!isAuthenticated) return
      const result = await execute({
        account: account?.address
      })

      if (result.isOk() && result?.value?.__typename === 'FollowResponse') {
        toast.success(`Following ${formatHandle(account)}`)
      } else if (result.isErr()) {
        toast.error(result.error.message)
      }
    } catch (e) {
      console.log(e)
      toast.error(String(e))
    }
  }
  return (
    <div className="centered-col gap-y-1">
      <div className="centered-col relative">
        <Link href={`/${formatHandle(account)}`}>
          <LoadingImage src={getAvatar(account)} className="w-14 h-14 rounded-full" />
        </Link>
        {live && (
          <div className="-mt-4 absolute bottom-0 z-40">
            <LiveDiv />
          </div>
        )}
        {!live &&
          isLensAuthenticated &&
          !account?.operations?.isFollowedByMe &&
          account?.address.toLowerCase() !== authenticatedUser?.address?.toLowerCase() &&
          (data?.__typename !== 'FollowResponse' || !data) && (
            <div className="-mt-4 absolute bottom-0 z-40">
              <LoadingButton
                startIcon={
                  <PersonAddIcon
                    fontSize="inherit"
                    sx={{
                      width: '10px',
                      height: '10px'
                    }}
                    className="-mr-1"
                  />
                }
                onClick={() => {
                  handleFollow(account)
                }}
                loading={followLoading}
                variant="contained"
                size="small"
                color="secondary"
                fullWidth={false}
                sx={{
                  borderRadius: '20px',
                  padding: '3px 0px',
                  width: '10px',
                  textTransform: 'none',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              >
                Follow
              </LoadingButton>
            </div>
          )}
      </div>
      <div className="flex flex-row items-center gap-x-0.5">
        <div className="text-s-text text-xs">{stringToLength(formatHandle(account), 9)}</div>
        {premium && (
          <VerifiedBadge
            sx={{
              width: '12px',
              height: '12px'
            }}
          />
        )}
      </div>
    </div>
  )
}

export default SingleHorizontalStreamerDiv
