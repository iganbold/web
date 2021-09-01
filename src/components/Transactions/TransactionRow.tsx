import { PhoneIcon } from '@chakra-ui/icons'
import { Box, Center, Collapse, Flex, Heading, useColorModeValue } from '@chakra-ui/react'
import { RawText, Text } from 'components/Text'
import { FormatTransactionType, TransactionStatusEnum } from 'hooks/useTransactions/useTransactions'
import { useState } from 'react'

export const TransactionRow = ({ tx }: { tx: FormatTransactionType }) => {
  const [isOpen, setIsOpen] = useState(false)
  const toggleOpen = () => setIsOpen(!isOpen)
  return (
    <Box
      as='button'
      onClick={toggleOpen}
      width='full'
      py={4}
      pl={3}
      pr={4}
      rounded='lg'
      _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.100') }}
    >
      <Flex alignItems='center' flex={1} justifyContent='space-between'>
        <Flex alignItems='center'>
          <Center w='10' h='10' bg={'whiteAlpha.200'} rounded='full' mr='3'>
            <PhoneIcon />
          </Center>
          <Text
            translation={
              tx.type === TransactionStatusEnum.Sent
                ? 'transactionRow.sent'
                : 'transactionRow.received'
            }
          />
          <RawText ml={2}>{`${tx.amount} ${tx.symbol}`}</RawText>
        </Flex>
        <RawText>{`${tx.date}`}</RawText>
      </Flex>
      <Collapse in={isOpen}>
        <Heading>
          <Text translation={'transactionRow.moreDetails'} />
        </Heading>
      </Collapse>
    </Box>
  )
}
