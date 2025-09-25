import { account as accountMetadata } from '@lens-protocol/metadata'
import { Role, useCanCreateUsername } from '@lens-protocol/react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import LoadingButton from '@mui/lab/LoadingButton'
import { Avatar, Button, CircularProgress, IconButton, TextField } from '@mui/material'
import React from 'react'
import toast from 'react-hot-toast'
import useCreateAccount from '../../../utils/hooks/lens/useCreateAccount'
import useSession from '../../../utils/hooks/useSession'
import { acl, storageClient } from '../../../utils/lib/lens/storageClient'
import { stringToLength } from '../../../utils/stringToLength'

interface AccountCreationProps {
  onBack?: () => void
  onSuccess?: () => void
  isFullPage?: boolean
  hasExistingProfiles?: boolean
}

const AccountCreation: React.FC<AccountCreationProps> = ({
  onBack,
  onSuccess,
  isFullPage = false,
  hasExistingProfiles = false
}) => {
  const [localName, setLocalName] = React.useState('')
  const [displayName, setDisplayName] = React.useState('')
  const [bio, setBio] = React.useState('')
  const [profilePicture, setProfilePicture] = React.useState<File | null>(null)
  const [profilePictureUrl, setProfilePictureUrl] = React.useState<string>('')
  const [usernameError, setUsernameError] = React.useState<string>('')
  const [checkingAvailability, setCheckingAvailability] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  const { authenticatedUser } = useSession()
  const { execute: createAccount, loading: creating } = useCreateAccount()
  const { execute: checkCanCreateUsername, loading: checkingUsername } = useCanCreateUsername()

  const checkUsernameAvailability = React.useCallback(
    async (value: string) => {
      if (!value || authenticatedUser?.role !== Role.OnboardingUser) return

      // Don't start a new check if one is already in progress
      if (checkingUsername || checkingAvailability) return

      setCheckingAvailability(true)
      try {
        const result = await checkCanCreateUsername({
          localName: value
        })

        if (result.isErr()) {
          console.error('Username validation error:', result.error)
          setUsernameError('Username validation failed')
        } else {
          // Handle the validation result based on its type
          switch (result.value.__typename) {
            case 'UsernameTaken':
              setUsernameError('Username is already taken')
              break
            case 'NamespaceOperationValidationFailed':
              setUsernameError(result.value.reason || 'Username does not meet requirements')
              break
            case 'NamespaceOperationValidationUnknown':
              setUsernameError('Unable to validate username. Please try a different one.')
              break
            case 'NamespaceOperationValidationPassed':
              // Username is available and valid - clear any error
              setUsernameError('')
              break
          }
        }
      } catch (err) {
        console.error('Username check error:', err)
        setUsernameError('Failed to check username availability')
      } finally {
        setCheckingAvailability(false)
      }
    },
    [authenticatedUser?.role, checkCanCreateUsername, checkingUsername, checkingAvailability]
  )

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim()
    setLocalName(value)

    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!value) return

    // Debounce the username check by 500ms
    debounceTimerRef.current = setTimeout(() => {
      checkUsernameAvailability(value)
    }, 500)
  }

  // Cleanup debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePictureUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateAccount = async () => {
    try {
      // Validate username one more time before creating
      if (usernameError) {
        toast.error(usernameError)
        return
      }

      // Upload profile picture if provided
      let pictureUri: string | undefined
      if (profilePicture) {
        try {
          const pictureResponse = await storageClient.uploadFile(profilePicture, {
            acl: acl
          })
          pictureUri = pictureResponse?.uri
        } catch (uploadErr) {
          console.error('Profile picture upload failed:', uploadErr)
          // Continue without picture rather than failing completely
        }
      }

      // Create metadata with all fields
      const metadata = accountMetadata({
        name: displayName || localName,
        bio: bio || undefined,
        picture: pictureUri || undefined
      })

      const response = await storageClient.uploadAsJson(metadata, {
        acl: acl
      })

      await createAccount({
        username: {
          localName: localName
        },
        metadataUri: response?.uri
      })

      toast.success('Profile created successfully!')
      onSuccess?.()
    } catch (e: any) {
      console.error('Account creation error:', e)

      // Parse error message for better user feedback
      let errorMessage = 'Failed to create profile'
      if (e?.message?.includes('username')) {
        errorMessage = 'Username validation failed. Please choose a different username.'
      } else if (e?.message?.includes('namespace')) {
        errorMessage = 'Username does not meet requirements. Please check the format.'
      } else if (e?.message) {
        errorMessage = stringToLength(e.message, 100)
      }

      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setLocalName('')
    setDisplayName('')
    setBio('')
    setProfilePicture(null)
    setProfilePictureUrl('')
    setUsernameError('')
  }

  return (
    <div className={isFullPage ? 'w-full max-w-md mx-auto' : 'w-full'}>
      <div className={isFullPage ? 'font-bold text-4xl mb-8' : 'text-2xl font-bold mb-4'}>
        Create your account
      </div>
      <div className="text-s-text font-semibold text-sm mb-6">
        Set up your profile with a unique username
      </div>

      <div className="space-y-4">
        {/* Profile Picture Upload */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Avatar
              src={profilePictureUrl}
              sx={{ width: 100, height: 100 }}
              className="border-4 border-p-border"
            />
            <IconButton
              className="absolute bottom-0 right-0 bg-brand hover:bg-brand-hover"
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={creating}
            >
              <PhotoCameraIcon fontSize="small" className="text-white" />
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Username Field */}
        <TextField
          className="w-full"
          label="Username (required)"
          variant="outlined"
          value={localName}
          onChange={handleUsernameChange}
          disabled={creating}
          error={Boolean(usernameError)}
          helperText={usernameError}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px'
            }
          }}
          size="medium"
          autoFocus
        />

        {/* Username availability status */}
        {localName && !usernameError && (
          <div className="mb-4">
            {(checkingUsername || checkingAvailability) && (
              <div className="flex items-center gap-2 text-s-text text-sm">
                <CircularProgress size={16} />
                <span>Checking availability...</span>
              </div>
            )}
            {!checkingUsername && !checkingAvailability && localName && !usernameError && (
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <CheckCircleIcon fontSize="small" />
                <span>Username available!</span>
              </div>
            )}
          </div>
        )}

        {/* Display Name Field */}
        <TextField
          className="w-full"
          label="Display Name (optional)"
          variant="outlined"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          disabled={creating}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px'
            }
          }}
          size="medium"
        />

        {/* Bio Field */}
        <TextField
          className="w-full"
          label="Bio (optional)"
          variant="outlined"
          value={bio}
          onChange={e => setBio(e.target.value)}
          disabled={creating}
          multiline
          rows={3}
          inputProps={{ maxLength: 200 }}
          helperText={`${bio.length}/200 characters`}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px'
            }
          }}
          size="medium"
        />

        <div className="flex gap-3">
          {hasExistingProfiles && onBack && (
            <Button
              variant="outlined"
              onClick={() => {
                resetForm()
                onBack()
              }}
              disabled={creating}
              fullWidth
              sx={{
                borderRadius: '24px',
                padding: '12px 0'
              }}
            >
              Back
            </Button>
          )}
          <LoadingButton
            variant="contained"
            onClick={handleCreateAccount}
            loading={checkingUsername || checkingAvailability || creating}
            disabled={
              checkingUsername ||
              checkingAvailability ||
              creating ||
              !localName ||
              Boolean(usernameError)
            }
            fullWidth
            startIcon={<PersonAddIcon />}
            sx={{
              borderRadius: '24px',
              padding: '12px 0'
            }}
          >
            {creating ? 'Creating Profile...' : 'Create Profile'}
          </LoadingButton>
        </div>
      </div>
    </div>
  )
}

export default AccountCreation
