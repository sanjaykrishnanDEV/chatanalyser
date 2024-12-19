import { DateRangeFilter } from './DateRangeFilter';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnSelector } from './ColumnSelector';
import type { FilterState } from '@/types';

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  columns: any[];
  visibleColumns: Set<string>;
  onColumnToggle: (columnId: string) => void;
}

export function Filters({
  filters,
  onFiltersChange,
  columns,
  visibleColumns,
  onColumnToggle,
}: FiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search in all fields..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="flex-1"
        />
        <Select
          value={filters.messageCount}
          onValueChange={(value) => onFiltersChange({ messageCount: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Message count" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="0-5">0-5 messages</SelectItem>
            <SelectItem value="6-10">6-10 messages</SelectItem>
            <SelectItem value="11-20">11-20 messages</SelectItem>
            <SelectItem value="21">21+ messages</SelectItem>
          </SelectContent>
        </Select>
        <DateRangeFilter
          onDateRangeChange={(range) => onFiltersChange({ dateRange: range })}
        />
        <ColumnSelector
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnToggle={onColumnToggle}
        />
      </div>
    </div>
  );
}