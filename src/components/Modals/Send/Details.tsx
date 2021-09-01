import { ArrowBackIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Stack
} from '@chakra-ui/react'
import { QRCode } from 'components/Icons/QRCode'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { TokenRow } from 'components/TokenRow/TokenRow'
import { useModal } from 'context/ModalProvider/ModalProvider'
import { useBalances } from 'hooks/useBalances/useBalances'
import { bnOrZero } from 'lib/bignumber'
import get from 'lodash/get'
import { useMemo, useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useTranslate } from 'react-polyglot'
import { useHistory } from 'react-router-dom'

import { TxFeeRadioGroup } from './TxFeeRadioGroup'

const flattenTokenBalances = (balances: any) =>
  Object.keys(balances).reduce((acc: any, key) => {
    const value = balances[key]
    acc[key] = value
    if (value.tokens) {
      value.tokens.forEach((token: any) => {
        acc[token.contract.toLowerCase()] = token
      })
    }
    return acc
  }, {})

export const Details = () => {
  const [fiatInput, setFiatInput] = useState<boolean>(true)
  // const [fieldName, setFieldName] = useState<'fiat.amount' | 'fiat.crypto'>('fiat.crypto')
  const { balances } = useBalances()
  const translate = useTranslate()
  const history = useHistory()
  const {
    control,
    getValues,
    setValue,
    formState: { isValid, errors }
  } = useFormContext()
  const modal = useModal()
  const flattenedBalances = flattenTokenBalances(balances)

  const values = useWatch({})

  const toggleCurrency = () => {
    setFiatInput(input => !input)
  }

  const onNext = () => {
    history.push('/send/confirm')
  }

  const assetBalance = flattenedBalances[values?.asset?.contractAddress]
  const accountBalances = useMemo(() => {
    const crypto = bnOrZero(assetBalance?.balance).div(`1e${assetBalance?.decimals}`)
    const fiat = crypto.times(values.asset.price)
    return {
      crypto,
      fiat
    }
  }, [assetBalance, values.asset])

  const handleInputChange = (inputValue: string) => {
    const value = Number(inputValue.replace(/[^0-9.-]+/g, ''))
    const key = !fiatInput ? 'fiat.amount' : 'crypto.amount'
    const assetPrice = values.asset.price
    const amount = fiatInput
      ? bnOrZero(value).div(assetPrice).toString()
      : bnOrZero(value).times(assetPrice).toString()
    setValue(key, amount)
  }

  // const fiatField = fieldName === 'fiat.amount'
  const validateCryptoAmount = (value: string) => {
    if (!fiatInput) {
      const hasValidBalance = accountBalances.crypto.gte(value.replace(/[^0-9.-]+/g, ''))
      return hasValidBalance || 'common.insufficientFunds'
    }
    return true
  }

  const validateFiatAmount = (value: string) => {
    if (fiatInput) {
      const hasValidBalance = accountBalances.fiat.gte(value.replace(/[^0-9.-]+/g, ''))
      return hasValidBalance || 'common.insufficientFunds'
    }
    return true
  }

  const cryptoError = get(errors, 'crypto.amount.message', null)
  const fiatError = get(errors, 'fiat.amount.message', null)
  const balanceError = cryptoError || fiatError

  return (
    <SlideTransition>
      <IconButton
        variant='ghost'
        icon={<ArrowBackIcon />}
        aria-label='Back'
        position='absolute'
        top={2}
        left={3}
        fontSize='xl'
        size='sm'
        isRound
        onClick={() => history.push('/send/select')}
      />
      <ModalHeader textAlign='center'>
        {translate('modals.send.sendForm.sendAsset', { asset: values.asset.name })}
      </ModalHeader>
      <ModalCloseButton borderRadius='full' />
      <ModalBody>
        <FormControl isRequired>
          <FormLabel color='gray.500' w='full'>
            {translate('modals.send.sendForm.sendTo')}
          </FormLabel>
          <InputGroup size='lg'>
            <Controller
              render={({ field: { onChange, value } }) => (
                <Input
                  autoFocus // eslint-disable-line jsx-a11y/no-autofocus
                  onChange={onChange}
                  placeholder='Token Address'
                  size='lg'
                  value={value}
                  variant='filled'
                />
              )}
              control={control}
              name='address'
              rules={{
                required: true,
                validate: {
                  validateAddress: (value: string) => {
                    return true
                  }
                }
              }}
            />
            <InputRightElement>
              <IconButton aria-label='Scan QR Code' size='sm' variant='ghost' icon={<QRCode />} />
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl mt={4}>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <FormLabel color='gray.500'>{translate('modals.send.sendForm.sendAmount')}</FormLabel>
            <FormHelperText
              mt={0}
              mr={3}
              mb={2}
              as='button'
              color='gray.500'
              onClick={toggleCurrency}
              textTransform='uppercase'
              _hover={{ color: 'white' }}
            >
              ≈{' '}
              {!fiatInput
                ? `${values.fiat.amount ?? 0} ${values.fiat.symbol}`
                : `${values.crypto.amount ?? 0} ${values.crypto.symbol}`}
            </FormHelperText>
          </Box>
          <TokenRow
            control={control}
            fieldName={fiatInput ? 'fiat.amount' : 'crypto.amount'}
            onInputChange={handleInputChange}
            inputLeftElement={
              <Button
                ml={1}
                size='sm'
                variant='ghost'
                textTransform='uppercase'
                onClick={toggleCurrency}
                width='full'
              >
                {fiatInput ? getValues('fiat.symbol') : getValues('crypto.symbol')}
              </Button>
            }
            inputRightElement={
              <Button h='1.75rem' size='sm' variant='ghost' colorScheme='blue'>
                <Text translation='modals.send.sendForm.max' />
              </Button>
            }
            rules={{
              required: true,
              validate: { validateCryptoAmount, validateFiatAmount }
            }}
          />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel color='gray.500' htmlFor='tx-fee'>
            {translate('modals.send.sendForm.transactionFee')}
          </FormLabel>
          <TxFeeRadioGroup />
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <Stack flex={1}>
          <Button
            isFullWidth
            isDisabled={!isValid}
            colorScheme={balanceError ? 'red' : 'blue'}
            size='lg'
            onClick={onNext}
          >
            <Text translation={balanceError || 'common.next'} />
          </Button>
          <Button isFullWidth variant='ghost' size='lg' mr={3} onClick={() => modal.close('send')}>
            <Text translation='common.cancel' />
          </Button>
        </Stack>
      </ModalFooter>
    </SlideTransition>
  )
}
