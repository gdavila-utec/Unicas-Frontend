import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InputAmount = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { value, onChange, className, ...rest } = props;
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Clear the value if it's 0
    if (value === 0 || value === '0') {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: '',
        },
      };
      onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // If the field is empty, set it back to 0
    if (!e.target.value) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: '0',
        },
      };
      onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
    props.onBlur?.(e);
  };

  return (
    <Input
      {...rest}
      ref={ref}
      value={isFocused && value === 0 ? '' : value}
      onChange={onChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(className)}
      style={{ appearance: 'textfield' }}
      inputMode='numeric'
      pattern='[0-9]*'
    />
  );
});

InputAmount.displayName = 'InputAmount';

export default InputAmount;
