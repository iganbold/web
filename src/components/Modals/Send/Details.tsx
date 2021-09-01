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
import { useChainAdapters } from 'context/ChainAdaptersProvider/ChainAdaptersProvider'
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
  const [fieldName, setFieldName] = useState<'fiat.amount' | 'crypto.amount'>('fiat.amount')
  const { balances } = useBalances()
  const chainAdapter = useChainAdapters()

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
    const nextFieldName = fieldName === 'fiat.amount' ? 'crypto.amount' : 'fiat.amount'
    setFieldName(nextFieldName)
  }

  const onNext = () => {
    history.push('/send/confirm')
  }

  const adapter = chainAdapter.byChain(values?.asset.network)

  console.log('balances', balances)
  console.log('flattenedBalances', flattenedBalances)
  console.log('values?.asset?.contractAddress', values?.asset?.contractAddress)

  const assetBalance = flattenedBalances[values?.asset?.contractAddress]
  const accountBalances = useMemo(() => {
    const crypto = bnOrZero(assetBalance?.balance).div(`1e${assetBalance?.decimals}`)
    const fiat = crypto.times(values.asset.price)
    return {
      crypto,
      fiat
    }
  }, [assetBalance, values.asset])

  const fiatField = fieldName === 'fiat.amount'

  const handleInputChange = (inputValue: string) => {
    const key = !fiatField ? 'fiat.amount' : 'crypto.amount'
    const assetPrice = values.asset.price
    const amount = fiatField
      ? bnOrZero(inputValue).div(assetPrice).toString()
      : bnOrZero(inputValue).times(assetPrice).toString()
    setValue(key, amount)
  }

  const validateCryptoAmount = (value: string) => {
    const hasValidBalance = accountBalances.crypto.gte(value)
    return hasValidBalance || 'common.insufficientFunds'
  }

  const validateFiatAmount = (value: string) => {
    const hasValidBalance = accountBalances.fiat.gte(value)
    return hasValidBalance || 'common.insufficientFunds'
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
                    // const { valid } = adapter.validateAddress(value)
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
              {fiatField
                ? `${values.crypto.amount ?? 0} ${values.crypto.symbol}`
                : `${values.fiat.amount ?? 0} ${values.fiat.symbol}`}
            </FormHelperText>
          </Box>
          {fieldName === 'crypto.amount' && (
            <TokenRow
              control={control}
              fieldName='crypto.amount'
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
                  {getValues('crypto.symbol')}
                </Button>
              }
              inputRightElement={
                <Button h='1.75rem' size='sm' variant='ghost' colorScheme='blue'>
                  <Text translation='modals.send.sendForm.max' />
                </Button>
              }
              rules={{
                required: true,
                validate: { validateCryptoAmount }
              }}
            />
          )}
          {fieldName === 'fiat.amount' && (
            <TokenRow
              control={control}
              fieldName='fiat.amount'
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
                  {getValues('fiat.symbol')}
                </Button>
              }
              inputRightElement={
                <Button h='1.75rem' size='sm' variant='ghost' colorScheme='blue'>
                  <Text translation='modals.send.sendForm.max' />
                </Button>
              }
              rules={{
                required: true,
                validate: { validateFiatAmount }
              }}
            />
          )}
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
