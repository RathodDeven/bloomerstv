'use client'
import useSession from '../../../../utils/hooks/useSession'
import LiveChat from '../../../common/LiveChat/LiveChat'
import LiveStreamEditor from './LiveStreamEditor'

const GoLivePage = () => {
  const { account } = useSession()

  return (
    <div className="flex flex-row h-full w-full">
      <div className="overflow-auto h-full min-w-0 flex-grow">
        <LiveStreamEditor />
      </div>
      <div className="w-[280px] 2xl:w-[350px] flex-none h-full shrink-0">
        {/* {createdPublicationId ? ( */}
        {account?.address && (
          <LiveChat accountAddress={account?.address} showPopOutChat showLiveCount />
        )}
        {/* // ) : (
        //   <div className="flex bg-s-bg flex-col gap-y-8 items-center justify-center h-full">
        //     <CircularProgress color="secondary" />
        //     <div className="text-s-text font-semibold">
        //       Chat will be available after post is created
        //     </div>
        //   </div>
        // )} */}
      </div>
    </div>
  )
}

export default GoLivePage
