import { useState, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { formatDate } from '@/lib/utils/conversation';

interface DateRangeFilterProps {
  onDateRangeChange: (range: { from: number | null; to: number | null }) => void;
}

export function DateRangeFilter({ onDateRangeChange }: DateRangeFilterProps) {
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const handleSelect = useCallback((range: { from: Date; to: Date }) => {
    setDate(range);
    onDateRangeChange({
      from: range.from ? Math.floor(range.from.getTime() / 1000) : null,
      to: range.to ? Math.floor(range.to.getTime() / 1000) : null,
    });
  }, [onDateRangeChange]);

  const clearDates = useCallback(() => {
    setDate({ from: undefined, to: undefined });
    onDateRangeChange({ from: null, to: null });
  }, [onDateRangeChange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={date.from ? 'text-primary' : ''}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date.from ? (
            <>
              {formatDate(Math.floor(date.from.getTime() / 1000))}
              {date.to && ` - ${formatDate(Math.floor(date.to.getTime() / 1000))}`}
            </>
          ) : (
            'Date Range'
          )}
          {date.from && (
            <X
              className="ml-2 h-4 w-4 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                clearDates();
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date.from}
          selected={{ from: date.from, to: date.to }}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}