'use client'
import StreamerSidebar from '../../components/common/StreamerSidebar'
import MobileTopHeader from '../../components/pages/all/Header/MobileTopHeader'
import useIsMobile from '../../utils/hooks/useIsMobile'

const page = () => {
  const isMobile = useIsMobile()
  if (!isMobile) return null
  return (
    <div className="w-full overflow-x-hidden">
      {isMobile && <MobileTopHeader />}

      <StreamerSidebar />
    </div>
  )
}

export default page
