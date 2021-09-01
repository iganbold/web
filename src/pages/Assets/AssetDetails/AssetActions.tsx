import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { AssetMarketData } from '@shapeshiftoss/market-service'
import { useModal } from 'context/ModalProvider/ModalProvider'

export const AssetActions = ({ asset }: { asset: AssetMarketData }) => {
  const { send, receive } = useModal()
  const { open: openSend } = send
  const { open: openReceive } = receive
  return (
    <ButtonGroup
      ml={{ base: 0, lg: 'auto' }}
      mt={{ base: 6, lg: 0 }}
      width={{ base: 'full', lg: 'auto' }}
    >
      <Button onClick={() => openSend()} isFullWidth leftIcon={<ArrowUpIcon />}>
        Send
      </Button>
      <Button onClick={() => openReceive({ asset })} isFullWidth leftIcon={<ArrowDownIcon />}>
        Receive
      </Button>
    </ButtonGroup>
  )
}
