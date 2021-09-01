import {
  Box,
  Button,
  Flex,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  useColorModeValue
} from '@chakra-ui/react'
import { Amount } from 'components/Amount/Amount'
import { HelperToolTip } from 'components/HelperTooltip'
import { Row } from 'components/Row'
import { SlideTransition } from 'components/SlideTransition'
import { RawText, Text } from 'components/Text'
import { useFormContext, useWatch } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

export const Confirm = () => {
  const history = useHistory()
  const { control, getValues } = useFormContext()
  const { address, asset, crypto, fiat, ...rest } = useWatch({ control })
  console.log('asset', asset)
  console.log('asset', rest)

  return (
    <SlideTransition>
      <ModalHeader textAlign='center'>
        <Text translation={'modals.send.confirm.send'} />
      </ModalHeader>
      <ModalBody>
        <Flex flexDir='column' alignItems='center' mb={8}>
          <Amount.Crypto
            fontSize='4xl'
            fontWeight='bold'
            lineHeight='shorter'
            textTransform='uppercase'
            symbol={crypto.symbol}
            value={crypto.amount}
          />
          <Amount.Fiat color='gray.500' fontSize='xl' lineHeight='short' value={fiat.amount} />
        </Flex>
        <Stack spacing={4} mb={4}>
          <Row>
            <Row.Label>
              <Text translation={['modals.send.confirm.sendAssetTo', { asset: asset.name }]} />
            </Row.Label>
            <Row.Value>
              <RawText>{address}</RawText>
            </Row.Value>
          </Row>
          <Row>
            <Row.Label>
              <Text translation={'modals.send.confirm.transactionFee'} />
              <HelperToolTip label='This is the TX fee' flexProps={{ color: 'blue.500' }}>
                <Text translation={['modals.send.confirm.fees', { feeType: getValues('fee') }]} />
              </HelperToolTip>
            </Row.Label>
            <Row.Value>
              <Amount.Fiat value={'10'} />
            </Row.Value>
          </Row>
          <Button width='full' onClick={() => history.push('/send/details')}>
            <Text translation={'modals.send.confirm.edit'} />
          </Button>
        </Stack>
      </ModalBody>
      <ModalFooter
        flexDir='column'
        borderTopWidth={1}
        borderColor={useColorModeValue('gray.100', 'gray.750')}
      >
        <Row>
          <Box>
            <Row.Label color='inherit' fontWeight='bold'>
              <Text translation='modals.send.confirm.total' />
            </Row.Label>
            <Row.Label flexDir='row' display='flex'>
              <Text translation='modals.send.confirm.amount' />
              <RawText mx={1}>+</RawText>
              <Text translation='modals.send.confirm.transactionFee' />
            </Row.Label>
          </Box>
          <Box textAlign='right'>
            <Row.Value>
              <RawText>0.004 BTC</RawText>
            </Row.Value>
            <Row.Label>
              <RawText>$110.00</RawText>
            </Row.Label>
          </Box>
        </Row>
        <Button colorScheme='blue' size='lg' width='full' mt={6} type='submit'>
          <Text translation='common.confirm' />
        </Button>
      </ModalFooter>
    </SlideTransition>
  )
}
