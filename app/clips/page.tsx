'use client'

import MobileTopHeader from '../../components/pages/all/Header/MobileTopHeader'
import ClipsFeed from '../../components/pages/home/ClipsFeed'
import useIsMobile from '../../utils/hooks/useIsMobile'

const page = () => {
  const isMobile = useIsMobile()

  return (
    <div className="w-full overflow-x-hidden">
      {isMobile && <MobileTopHeader />}
      <div className="mt-4">
        <ClipsFeed />
      </div>
    </div>
  )
}

export default page
