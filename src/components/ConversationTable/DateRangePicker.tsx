import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { formatDate } from '@/lib/utils/conversation';

interface DateRangePickerProps {
  dateRange: {
    from?: Date | undefined;
    to?: Date | undefined;
  };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const clearDateRange = () => {
    onDateRangeChange({ from: undefined, to: undefined });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={dateRange.from ? 'text-primary' : ''}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange.from ? (
            <>
              {formatDate(Math.floor(dateRange.from.getTime() / 1000))}
              {dateRange.to && ` - ${formatDate(Math.floor(dateRange.to.getTime() / 1000))}`}
            </>
          ) : (
            'Select Dates'
          )}
          {dateRange.from && (
            <X
              className="ml-2 h-4 w-4 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                clearDateRange();
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange.from}
          selected={{ from: dateRange.from, to: dateRange.to }}
          onSelect={(range: any) => onDateRangeChange(range)}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}