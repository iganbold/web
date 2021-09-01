import {
  Input,
  InputGroup,
  InputGroupProps,
  InputLeftElement,
  InputProps,
  InputRightElement
} from '@chakra-ui/react'
import { useLocaleFormatter } from 'hooks/useLocaleFormatter/useLocaleFormatter'
import { Control, Controller, ControllerProps, useWatch } from 'react-hook-form'
import NumberFormat from 'react-number-format'

const CryptoInput = (props: InputProps) => (
  <Input
    pr='4.5rem'
    pl='7.5rem'
    size='lg'
    type='number'
    variant='filled'
    placeholder='Enter amount'
    {...props}
  />
)

type TokenRowProps = {
  control: Control
  fieldName: string
  rules?: ControllerProps['rules']
  inputLeftElement?: React.ReactNode
  inputRightElement?: React.ReactNode
  onInputChange?: any
} & InputGroupProps

export const TokenRow = ({
  control,
  fieldName,
  rules,
  inputLeftElement,
  inputRightElement,
  onInputChange,
  ...rest
}: TokenRowProps) => {
  const {
    number: { localeParts }
  } = useLocaleFormatter({ fiatType: 'USD' })
  const values = useWatch({})
  const inputValue = fieldName === 'fiat.amount' ? values.fiat?.amount : values.crypto?.amount

  return (
    <InputGroup size='lg' {...rest}>
      {inputLeftElement && (
        <InputLeftElement ml={1} width='auto'>
          {inputLeftElement}
        </InputLeftElement>
      )}
      <Controller
        render={({ field: { onChange } }) => {
          return (
            <NumberFormat
              inputMode='decimal'
              thousandSeparator={localeParts.group}
              decimalSeparator={localeParts.decimal}
              value={inputValue}
              customInput={CryptoInput}
              onChange={e => {
                onChange(e.target.value)
                onInputChange && onInputChange(e.target.value)
              }}
            />
          )
        }}
        name={fieldName}
        control={control}
        rules={rules}
      />
      {inputRightElement && (
        <InputRightElement width='4.5rem'>{inputRightElement}</InputRightElement>
      )}
    </InputGroup>
  )
}
