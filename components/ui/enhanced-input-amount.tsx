import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InputAmountProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isDifferentPayment?: boolean;
  isCuotaVariable?: boolean;
}

const InputAmount = React.forwardRef<HTMLInputElement, InputAmountProps>(
  (
    {
      value,
      onChange,
      className,
      disabled,
      isDifferentPayment,
      isCuotaVariable,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    // Check if input should be editable
    const isEditable = isDifferentPayment || isCuotaVariable;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (isEditable) {
        setLocalValue('');
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: '',
          },
        };
        onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
      rest.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (!e.target.value) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: '0',
          },
        };
        onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
        setLocalValue('0');
      }
      rest.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (newValue === '') {
        setLocalValue('');
        onChange?.(e);
        return;
      }

      const regex = /^\d*\.?\d{0,2}$/;
      if (regex.test(newValue)) {
        setLocalValue(newValue);
        onChange?.(e);
      }
    };

    return (
      <Input
        {...rest}
        ref={ref}
        value={isFocused && isEditable ? localValue : value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(className)}
        style={{ appearance: 'textfield' }}
        inputMode='decimal'
        disabled={disabled}
      />
    );
  }
);

InputAmount.displayName = 'InputAmount';

export default InputAmount;
