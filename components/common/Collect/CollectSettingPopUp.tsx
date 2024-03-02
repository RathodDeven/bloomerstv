import React, { useEffect } from 'react'
import { useCollectPreferences } from '../../store/useCollectPreferences'
import LayersIcon from '@mui/icons-material/Layers'
import { IOSSwitch } from '../../ui/IOSSwitch'
import { motion } from 'framer-motion'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'
import {
  Button,
  IconButton,
  MenuItem,
  Select,
  Slider,
  TextField
} from '@mui/material'
import GroupsIcon from '@mui/icons-material/Groups'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import {
  Amount,
  Erc20,
  RecipientWithSplit,
  SessionType,
  useSession
} from '@lens-protocol/react-web'
import { CURRENCIES, PROJECT_ADDRESS } from '../../../utils/config'
import PersonRemoveAlt1Icon from '@mui/icons-material/PersonRemoveAlt1'
import clsx from 'clsx'
interface SettingRecipientType {
  recipient?: string
  split?: number
}

const item = {
  open: {
    opacity: 1
  },
  closed: { opacity: 0 }
}

const itemWithHeightAndMt = {
  open: {
    height: 'auto',
    opacity: 1,
    marginTop: 16
  },
  closed: { height: 0, opacity: 0 }
}

const itemWithHeight = {
  open: {
    height: 'auto',
    opacity: 1
  },
  closed: { height: 0, opacity: 0 }
}

const CollectSettingPopUp = () => {
  const {
    amount,
    disableCollect,
    collectLimit,
    referalFee,
    numberOfDays,
    followerOnly,
    recipients,
    setAmount,
    setDisableCollect,
    setCollectLimit,
    setReferalFee,
    setNumberOfDays,
    setFollowerOnly,
    setRecipients
  } = useCollectPreferences((state) => state)

  const [isCollectLimit, setIsCollectLimit] = React.useState(false)
  const [isTimeLimit, setIsTimeLimit] = React.useState(false)
  const [isReferalFee, setIsReferalFee] = React.useState(false)
  const [isPaid, setIsPaid] = React.useState(false)
  const [amountValue, setAmountValue] = React.useState<number | undefined>()
  const [amountCurrency, setAmountCurrency] = React.useState<
    String | undefined
  >()
  const [settingRecipients, setSettingRecipients] = React.useState<
    SettingRecipientType[]
  >([])
  const [recipientError, setRecipientError] = React.useState<
    | "Split doesn't add up to 100%"
    | 'There is a recipient with invalid address'
    | 'There is a recipient with empty address'
    | 'There are duplicate recipient addresses'
    | 'Split % can not be 0'
    | undefined
  >(undefined)

  const { data } = useSession()

  useEffect(() => {
    if (collectLimit) {
      setIsCollectLimit(true)
    }

    if (numberOfDays) {
      setIsTimeLimit(true)
    }

    if (referalFee) {
      setIsReferalFee(true)
    }

    if (amount) {
      setIsPaid(true)
      // @ts-ignore
      setAmountValue(amount?.value)
      setAmountCurrency(amount?.asset?.symbol)
    }

    if (settingRecipients.length === 0 && recipients) {
      // @ts-ignore
      setSettingRecipients(recipients)
    }
  }, [collectLimit, amount, referalFee, numberOfDays, recipients])

  useEffect(() => {
    if (data?.type === SessionType.WithProfile && !recipients) {
      setRecipients([
        {
          recipient: PROJECT_ADDRESS,
          split: 5
        },
        {
          recipient: data?.address,
          split: 95
        }
      ])
    }
  }, [recipients, data?.type])

  useEffect(() => {
    if (!settingRecipients) return
    // check if the split adds up to 100
    const total = settingRecipients.reduce((acc, recipient) => {
      // @ts-ignore
      return acc + recipient?.split || 0
    }, 0)

    // split can not be 0

    const zeroSplit = settingRecipients.find((recipient) => {
      // @ts-ignore
      return recipient?.split <= 0 || !recipient?.split
    })

    if (zeroSplit) {
      setRecipientError('Split % can not be 0')
      return
    }

    if (total !== 100) {
      setRecipientError("Split doesn't add up to 100%")
      return
    }

    // check if there is an invalid address
    const nullRecipient = settingRecipients.find((recipient) => {
      return !recipient.recipient
    })

    if (nullRecipient) {
      setRecipientError('There is a recipient with empty address')
      return
    }

    // check if there is an invalid evm address
    const invalidRecipient = settingRecipients.find((recipient) => {
      return !recipient?.recipient?.match(/^0x[a-fA-F0-9]{40}$/)
    })

    if (invalidRecipient) {
      setRecipientError('There is a recipient with invalid address')
      return
    }

    // check if there are duplicate addresses

    const uniqueRecipients = new Set(
      settingRecipients.map((recipient) => recipient.recipient)
    )

    if (uniqueRecipients.size !== settingRecipients.length) {
      setRecipientError('There are duplicate recipient addresses')
      return
    }

    setRecipientError(undefined)

    setRecipients(settingRecipients as RecipientWithSplit[])
  }, [settingRecipients])

  useEffect(() => {
    if (amountValue && amountCurrency) {
      // find the currency object
      const currency = CURRENCIES.find(
        (currency) => currency?.symbol === amountCurrency
      )
      // @ts-ignore
      setAmount(Amount.erc20(currency as Erc20, amountValue))
    }
  }, [amountValue, amountCurrency])

  return (
    <div className="w-full space-y-8 font-bold sm:px-0 px-2">
      <div className="start-row w-full space-x-3">
        <LayersIcon className="text-brand" />
        <div className="between-row w-full">
          <div className="-mt-1">
            <div>Enable Collect</div>
            <div className="text-s-text text-sm font-normal">
              Post will be onchain and allows users to collect it
            </div>
          </div>
          <IOSSwitch
            checked={!disableCollect}
            onChange={() => setDisableCollect(!disableCollect)}
          />
        </div>
      </div>
      <motion.div
        className="w-full space-y-8"
        initial="closed"
        animate={disableCollect ? 'closed' : 'open'}
        style={{
          listStyle: 'none',
          overflow: 'hidden'
        }}
        variants={{
          open: {
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.2
            },
            height: 'auto'
          },
          closed: {
            transition: {
              staggerChildren: 0.05,
              staggerDirection: -1
            },
            height: 0
          }
        }}
      >
        <motion.div className="" variants={item}>
          <div className="start-row w-full space-x-3">
            <StarBorderIcon className="text-brand" />
            <div className="w-full">
              <div className="between-row w-full">
                <div className="-mt-1">
                  <div>Set Collect Limit</div>
                  <div className="text-s-text text-sm font-normal">
                    Limit the number of times your content can be collected
                  </div>
                </div>
                <IOSSwitch
                  checked={isCollectLimit}
                  onChange={() => {
                    if (isCollectLimit) {
                      setCollectLimit(undefined)
                    } else {
                      setCollectLimit(1)
                    }
                    setIsCollectLimit(!isCollectLimit)
                  }}
                />
              </div>
              <motion.div
                variants={itemWithHeightAndMt}
                animate={isCollectLimit ? 'open' : 'closed'}
                className="w-full"
              >
                <TextField
                  type="number"
                  label="Number of Collects"
                  value={collectLimit}
                  onChange={(e) => setCollectLimit(Number(e.target.value))}
                  className="text-right w-full"
                  size="small"
                  focused={isCollectLimit}
                  inputProps={{
                    min: 1
                  }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div className="" variants={item}>
          <div className="start-row w-full space-x-3">
            <AccessTimeIcon className="text-brand" />
            <div className="w-full">
              <div className="between-row w-full">
                <div className="-mt-1">
                  <div>Set Time Limit</div>
                  <div className="text-s-text text-sm font-normal">
                    Number of days until your content can be collected
                  </div>
                </div>
                <IOSSwitch
                  checked={isTimeLimit}
                  onChange={() => {
                    if (isTimeLimit) {
                      setNumberOfDays(undefined)
                    } else {
                      setNumberOfDays(7)
                    }
                    setIsTimeLimit(!isTimeLimit)
                  }}
                />
              </div>

              <motion.div
                variants={itemWithHeightAndMt}
                animate={isTimeLimit ? 'open' : 'closed'}
                className="w-full pr-8"
              >
                <Slider
                  defaultValue={7}
                  min={1}
                  max={30}
                  step={1}
                  value={numberOfDays || 7}
                  aria-label="Time Limit in Days"
                  valueLabelDisplay="auto"
                  onChange={(e, value) => {
                    if (!value) return
                    setNumberOfDays(value as number)
                  }}
                  marks={[
                    { value: 1, label: '1 day' },
                    { value: 7, label: '7 days' },
                    { value: 14, label: '14 days' },
                    { value: 30, label: '30 days' }
                  ]}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="start-row w-full space-x-3">
            <GroupsIcon className="text-brand" />
            <div className="between-row w-full">
              <div className="-mt-1">
                <div>Only Followers can collect</div>
                <div className="text-s-text text-sm font-normal">
                  Only those who follow you can collect your content
                </div>
              </div>
              <IOSSwitch
                checked={followerOnly}
                onChange={() => setFollowerOnly(!followerOnly)}
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="flex flex-row w-full space-x-3">
            <AttachMoneyIcon className="text-brand" />

            <div className="space-y-3 w-full">
              <div className="between-row w-full">
                <div className="-mt-1">
                  <div>Monetize</div>
                  <div className="text-s-text text-sm font-normal">
                    Set price for collecting your content
                  </div>
                </div>
                <IOSSwitch
                  checked={isPaid}
                  onChange={() => {
                    if (isPaid) {
                      setAmount(undefined)
                    } else if (!amountValue) {
                      setAmountValue(1)
                      setAmountCurrency(CURRENCIES[0]?.symbol)
                    }
                    setIsPaid(!isPaid)
                  }}
                />
              </div>
              <motion.div
                variants={{
                  open: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.1
                    },
                    height: 'auto'
                  },
                  closed: {
                    transition: {
                      staggerChildren: 0.05,
                      staggerDirection: -1
                    },
                    height: 0
                  }
                }}
                className="w-full"
                animate={isPaid ? 'open' : 'closed'}
              >
                {/* amount & currency selection */}
                <motion.div
                  variants={itemWithHeight}
                  className="w-full shrink-0 space-x-2 flex flex-row items-center"
                >
                  <TextField
                    type="number"
                    label="Amount"
                    value={amountValue}
                    onChange={(e) => {
                      if (e.target.value) {
                        setAmountValue(Number(e.target.value))
                      }
                    }}
                    className="text-right w-full "
                    size="small"
                    focused={isPaid}
                    inputProps={{
                      min: 1
                    }}
                  />

                  <Select
                    className=" w-full"
                    defaultValue={CURRENCIES[0]?.symbol}
                    value={String(amountCurrency)}
                    onChange={(e) => {
                      if (!e.target.value) return
                      setAmountCurrency(e.target.value)
                    }}
                    size="small"
                  >
                    {CURRENCIES.map((currency) => {
                      return (
                        <MenuItem
                          value={currency?.symbol}
                          key={currency?.symbol}
                          className="text-p-text"
                        >
                          {currency?.symbol}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </motion.div>

                {/* MULTIRECIPIENT_COLLECT */}
                <motion.div variants={itemWithHeightAndMt} className="w-full">
                  <div className="text-sm font-semibold">Revenue Split</div>
                  <div className="text-xs text-s-text font-normal">
                    5% share is allocated for maintain this open source project
                  </div>
                </motion.div>
                {settingRecipients.map((recipient, index) => {
                  return (
                    <motion.div
                      variants={itemWithHeightAndMt}
                      key={index}
                      className="flex flex-row items-center space-x-2"
                    >
                      <TextField
                        type="text"
                        label="Recipient"
                        value={recipient.recipient}
                        onChange={(e) => {
                          const newRecipients = [...settingRecipients]
                          newRecipients[index].recipient = e.target.value
                          setSettingRecipients(newRecipients)
                        }}
                        disabled={index === 0}
                        className="w-full"
                        size="small"
                      />
                      <TextField
                        type="number"
                        label="Split %"
                        value={recipient.split}
                        disabled={index === 0}
                        onChange={(e) => {
                          const newRecipients = [...settingRecipients]
                          newRecipients[index].split = Number(e.target.value)
                          setSettingRecipients(newRecipients)
                        }}
                        className="w-full"
                        size="small"
                        inputProps={{
                          max: 90,
                          min: 1
                        }}
                      />

                      <IconButton
                        onClick={() => {
                          const newRecipients = [...settingRecipients]
                          newRecipients.splice(index, 1)
                          setSettingRecipients(newRecipients)
                        }}
                        disabled={index === 0 || index === 1}
                        className={clsx(
                          (index === 0 || index === 1) &&
                            'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <PersonRemoveAlt1Icon className="text-s-text" />
                      </IconButton>
                    </motion.div>
                  )
                })}

                {recipientError && (
                  <div className="text-xs font-semibold mt-2 text-red-500">
                    {recipientError}
                  </div>
                )}

                {/* add recipient button */}
                {settingRecipients.length < 5 && (
                  <motion.div variants={itemWithHeightAndMt} className="w-full">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSettingRecipients([
                          ...settingRecipients,
                          { recipient: '', split: 0 }
                        ])
                      }}
                      className="text-sm text-brand font-bold"
                    >
                      + Add Recipient
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="closed"
          animate={isPaid ? 'open' : 'closed'}
          variants={{
            open: {
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.3
              },
              height: 'auto'
            },
            closed: {
              transition: {
                staggerChildren: 0.05,
                staggerDirection: -1
              },
              height: 0
            }
          }}
        >
          <motion.div animate={isPaid ? 'open' : 'closed'} variants={item}>
            <div className="start-row w-full space-x-3">
              <CurrencyExchangeIcon className="text-brand" />
              <div className="w-full">
                <div className="between-row w-full">
                  <div className="-mt-1">
                    <div>Mirror reward</div>
                    <div className="text-s-text text-sm font-normal">
                      Share your fee with people who mirror your content
                    </div>
                  </div>

                  <IOSSwitch
                    checked={isReferalFee}
                    onChange={() => {
                      if (isReferalFee) {
                        setReferalFee(undefined)
                      } else {
                        setReferalFee(5)
                      }
                      setIsReferalFee(!isReferalFee)
                    }}
                  />
                </div>
                <motion.div
                  variants={itemWithHeightAndMt}
                  animate={isReferalFee ? 'open' : 'closed'}
                  className="w-full"
                >
                  <TextField
                    type="number"
                    label="Referral Fee %"
                    value={referalFee}
                    onChange={(e) => setReferalFee(Number(e.target.value))}
                    className="text-right w-full"
                    size="small"
                    focused={isReferalFee}
                    inputProps={{
                      max: 90,
                      min: 1
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default React.memo(CollectSettingPopUp)
