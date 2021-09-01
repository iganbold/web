import { Box, IconButton, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import { QRCode } from 'components/Icons/QRCode'
import { lazy, Suspense, useState } from 'react'
import { Controller, ControllerProps, useFormContext } from 'react-hook-form'

type AddressInputProps = {
  rules: ControllerProps['rules']
}

const QrReader = lazy(() => import('react-qr-reader'))

export const AddressInput = ({ rules }: AddressInputProps) => {
  const [showQrReader, setShowQrReader] = useState(false)
  const { control, setValue } = useFormContext()

  const handleQrClick = () => setShowQrReader(value => !value)

  const handleError = () => {
    /** @todo render error to user */
    setShowQrReader(false)
  }

  const handleScan = (value: string | null) => {
    if (value) {
      setValue('address', value)
      setShowQrReader(false)
    }
  }

  const renderQrReader = () => (
    <Suspense fallback={null}>
      <Box p={1} my={1} borderRadius='lg'>
        <QrReader delay={300} onError={handleError} onScan={handleScan} style={{ width: '100%' }} />
      </Box>
    </Suspense>
  )

  return (
    <>
      <InputGroup size='lg'>
        <Controller
          render={({ field: { onChange, value } }) => (
            <Input
              autoFocus // eslint-disable-line jsx-a11y/no-autofocus
              fontSize='sm'
              onChange={onChange}
              placeholder='Token Address'
              size='lg'
              value={value}
              variant='filled'
            />
          )}
          control={control}
          name='address'
          rules={rules}
        />
        <InputRightElement>
          <IconButton
            aria-label='Scan QR Code'
            icon={<QRCode />}
            onClick={handleQrClick}
            size='sm'
            variant='ghost'
          />
        </InputRightElement>
      </InputGroup>
      {showQrReader && renderQrReader()}
    </>
  )
}
