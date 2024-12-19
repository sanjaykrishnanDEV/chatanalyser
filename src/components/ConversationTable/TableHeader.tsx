import {
  TableHead,
  TableHeader as ShadcnTableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ColumnDef } from '@/types';

interface TableHeaderProps {
  columns: ColumnDef[];
}

export function TableHeader({ columns }: TableHeaderProps) {
  return (
    <ShadcnTableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead key={column.id}>{column.label}</TableHead>
        ))}
      </TableRow>
    </ShadcnTableHeader>
  );
}