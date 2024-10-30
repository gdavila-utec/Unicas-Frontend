import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

// Define proper types
interface DaySelectProps {
  field: {
    value: number;
    onChange: (value: number) => void;
  };
}

const DaySelect = ({ field }: DaySelectProps) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Convert number to string for Select component
  const handleChange = (value: string) => {
    field.onChange(Number(value));
  };

  return (
    <FormItem className='flex flex-col'>
      <FormLabel>Seleccione el día de asamblea</FormLabel>
      <Select
        onValueChange={handleChange}
        value={field.value?.toString()}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder='Seleccionar día' />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {days.map((day) => (
            <SelectItem
              key={day}
              value={day.toString()}
            >
              {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};

export default DaySelect;
