// ── Core Domain Types ──────────────────────────────────────────

export type LaptopStatus = 'AVAILABLE' | 'ASSIGNED' | 'RETIRED';
export type LaptopCondition = 'FUNCTIONAL' | 'FAULTY';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  status: EmployeeStatus;
  created_at?: string;
  assigned_laptop?: Laptop | null;
}

export interface Laptop {
  id: string;
  asset_tag: string;
  brand: string;
  model: string;
  serial_number: string;
  status: LaptopStatus;
  purchase_date?: string | null;
  created_at?: string;
  current_assignee?: Employee | null;
}

export interface Assignment {
  id: string;
  laptop_id: string;
  employee_id: string;
  assigned_date: string;
  returned_date: string | null;
  employee?: Employee;
  laptop?: Laptop;
}
