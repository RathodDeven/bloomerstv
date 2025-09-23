'use client'
import { MenuItem, Select } from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import clsx from 'clsx'
import dayjs, { type Dayjs } from 'dayjs'
import React, { memo, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  useMyStreamQuery,
  useUpdateMyStreamMutation,
  ViewType
} from '../../../../graphql/generated'
import { CATEGORIES_LIST } from '../../../../utils/categories'
import useSession from '../../../../utils/hooks/useSession'
import Timer from '../../../common/Timer'
import { useMyPreferences } from '../../../store/useMyPreferences'
import StartLoadingPage from '../../loading/StartLoadingPage'
import LiveVideoComponent from './LiveVideoComponent'
import MyStreamEditButton from './MyStreamEditButton'
// import { stringToLength } from '../../../../utils/stringToLength'
import StreamHealth from './StreamHealth'
import StreamKey from './StreamKey'

// import Link from 'next/link'
const LiveStreamEditor = () => {
  const [startedStreaming, setStartedStreaming] = React.useState<boolean>(false)
  const [streamFromBrowser, setStreamFromBrowser] = React.useState(false)

  const [updateMyStream] = useUpdateMyStreamMutation()

  const { isAuthenticated } = useSession()
  const { data, error, refetch, loading } = useMyStreamQuery({
    pollInterval: 60000,
    fetchPolicy: 'no-cache'
  })

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)

  useEffect(() => {
    if (data?.myStream?.nextStreamTime) {
      setSelectedDate(dayjs(data?.myStream?.nextStreamTime))
    }
  }, [data?.myStream])

  const { category, setCategory, setStreamReplayViewType, streamReplayViewType } = useMyPreferences(
    state => {
      return {
        streamReplayViewType: state.streamReplayViewType,
        setStreamReplayViewType: state.setStreamReplayViewType,
        category: state.category,
        setCategory: state.setCategory
      }
    }
  )

  useEffect(() => {
    refetch()
  }, [startedStreaming])

  useEffect(() => {
    if (!error) return
    toast.error(error?.message)
  }, [error])

  const myStream = data?.myStream

  if (!isAuthenticated) {
    return <div>You must be logged in to stream.</div>
  }

  if (loading && !myStream) {
    return <StartLoadingPage />
  }

  if (!myStream) {
    return <div>You can't stream right now.</div>
  }

  return (
    <div className="p-4 2xl:p-6 w-full flex flex-col">
      <div className="bg-s-bg shadow-sm rounded-xl overflow-hidden flex flex-col w-full">
        <div className="flex flex-row">
          <LiveVideoComponent
            myStream={myStream}
            refreshMyStream={refetch}
            setStartedStreaming={setStartedStreaming}
            startedStreaming={startedStreaming}
            streamFromBrowser={streamFromBrowser}
            setStreamFromBrowser={setStreamFromBrowser}
          />
          <div className="flex flex-row justify-between items-start px-4 pt-4 w-full">
            <div className="space-y-1.5 2xl:space-y-2.5 w-full">
              <div className="between-row gap-x-1 w-full">
                <div className="">
                  <div className="text-s-text font-bold text-md">Title</div>
                  <div className="text-p-text font-semibold text-sm 2xl:text-base">
                    {myStream?.streamName}
                  </div>
                </div>
                <MyStreamEditButton refreshStreamInfo={refetch} myStream={myStream} />
              </div>

              {/* <div className="space-y-1">
                <div className="text-s-text font-bold text-md">
                  Collect Preview
                </div>
                <CollectSettingButton />
              </div> */}

              {/* select stream replay view type and set */}

              <div className="flex flex-row gap-x-6">
                <div className="flex flex-row gap-x-8">
                  <div className="space-y-1">
                    <div className="text-s-text font-bold text-md">Replay Visibility</div>
                    <Select
                      value={streamReplayViewType}
                      onChange={e => {
                        if (!e.target.value) return
                        setStreamReplayViewType(e.target.value as ViewType)
                      }}
                      variant="standard"
                      size="small"
                    >
                      <MenuItem
                        value={ViewType.Public}
                        title="Your stream replay will be visible on Home, Profile, and Post page"
                        className="text-p-text"
                      >
                        Public
                      </MenuItem>
                      <MenuItem
                        title="Your stream replay will be visible only on Post page"
                        value={ViewType.Unlisted}
                        className="text-p-text"
                      >
                        Unlisted
                      </MenuItem>

                      <MenuItem
                        title="Your stream replay will not be visible for anyone but you can find it in dashboard"
                        value={ViewType.Private}
                        className="text-p-text"
                      >
                        Private
                      </MenuItem>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-s-text font-bold text-md">Category</div>
                    <Select
                      value={category}
                      onChange={e => {
                        if (!e.target.value) return
                        setCategory(e.target.value as string)
                      }}
                      variant="standard"
                      size="small"
                    >
                      {CATEGORIES_LIST.map(category => (
                        <MenuItem value={category} key={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {/* Next Stream time */}
              <div className="pt-4">
                {/* <div className="text-s-text font-bold text-md start-center-row gap-x-1">
                  <>Next Stream </>
                  <Tooltip title="Stream countdown will be shown on homepage & profile page">
                    <HelpIcon fontSize="inherit" />
                  </Tooltip>
                </div> */}

                <div className="">
                  <DateTimePicker
                    label="Next Stream Date & Time"
                    // @ts-expect-error
                    value={selectedDate ?? null}
                    onChange={async newValue => {
                      // @ts-expect-error
                      if (newValue < new Date() && myStream?.nextStreamTime) {
                        // @ts-expect-error
                        toast.error('Next stream time removed. Select a future time to update.')
                      }

                      // @ts-expect-error
                      setSelectedDate(newValue)
                      // @ts-expect-error
                      const epochTime = new Date(newValue).getTime()

                      try {
                        const { data } = await updateMyStream({
                          variables: {
                            request: {
                              nextStreamTime: epochTime
                            }
                          }
                        })

                        if (data?.updateMyStream) {
                          // @ts-expect-error
                          toast.success('Next stream time updated')
                        }
                      } catch (error) {
                        setSelectedDate(null)
                        // @ts-expect-error
                        toast.error(error.message)
                      }
                    }}
                    sx={{
                      paddingY: 0
                    }}
                  />
                </div>
              </div>

              {/* {!myStream?.premium && (
                <div className="text-xs text-s-text">
                  Stream replay has been moved to Super Plan. Checkout{' '}
                  <Link
                    href={'/dashboard/subscription'}
                    className="text-brand no-underline"
                  >
                    subscription page
                  </Link>{' '}
                  to upgrade.
                </div>
              )} */}
            </div>
          </div>
        </div>
        <div className="px-4 py-3 start-center-row space-x-2">
          {/* dot that goes red when live and green when not */}
          <div
            className={clsx('w-4 h-4 rounded-full', startedStreaming ? 'bg-brand' : 'bg-s-text')}
          />

          {myStream?.isActive && startedStreaming && myStream?.latestSessionCreatedAt && (
            <div className="">
              <Timer
                targetDate={myStream?.latestSessionCreatedAt}
                renderer={({ hours, minutes, seconds }) => {
                  return (
                    <div className="text-brand">{`${hours ? `${hours}:` : ''}${minutes}:${seconds}`}</div>
                  )
                }}
              />
            </div>
          )}

          <div className="font-semibold ">
            {startedStreaming
              ? `You're live! ${
                  streamFromBrowser
                    ? 'You can Stop streaming by pressing stop button.'
                    : 'You can Stop streaming from your streaming software.'
                }`
              : 'Stream is offline. Stay on this page for post creation after stream starts. Use software for best quality.'}
          </div>
        </div>
      </div>

      <div className="mt-4 2xl:mt-6 p-6 bg-s-bg shadow-sm rounded-xl w-full overflow-hidden">
        <div className="flex flex-wrap gap-y-6 lg:flex-nowrap lg:gap-x-6 2xl:gap-x-12 w-full overflow-x-auto">
          <StreamKey myStream={myStream} />
          <StreamHealth isActive={startedStreaming && !!myStream.isActive} myStream={myStream} />
        </div>
      </div>
    </div>
  )
}

export default memo(LiveStreamEditor)
