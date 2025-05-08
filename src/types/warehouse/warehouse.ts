export type Warehouse = {
    id: number;
    name: string;
    address: string | null;
    responsible: string | null;
    maximum_capacity: number | null;
    created_at: Date;
    updated_at: Date;
  }