import {
  TableHead,
  TableHeader as ShadcnTableHeader,
  TableRow,
} from '@/components/ui/table';
export interface ColumnDef {
  id: string;
  label: string;
  path: string;
  defaultVisible: boolean;
}
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