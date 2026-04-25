// ── Core Domain Types ──────────────────────────────────────────

export type LaptopStatus = 'AVAILABLE' | 'ASSIGNED' | 'RETIRED';
export type LaptopCondition = 'FUNCTIONAL' | 'FAULTY';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  entity: string;
  location: string;
  department: string;
  job_title: string;
  staff_type: string;
  seniority: string;
  status: EmployeeStatus;
  created_at: string;
  // Derived
  assigned_laptop?: Laptop | null;
}

export interface Laptop {
  id: string;
  asset_tag: string;
  brand: string;
  model: string;
  serial_number: string;
  status: LaptopStatus;
  condition: LaptopCondition;
  purchase_date?: string | null;
  created_at: string;
  // Derived
  current_assignee?: Employee | null;
}

export interface Assignment {
  id: string;
  laptop_id: string;
  employee_id: string;
  assigned_date: string;
  returned_date: string | null;
  assigned_by: string;
  created_at: string;
  // Populated
  employee?: Employee;
  laptop?: Laptop;
  assigned_by_user?: User;
}

// ── API Payload Types ──────────────────────────────────────────

export interface CreateEmployeePayload {
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  entity?: string;
  location?: string;
  job_title?: string;
  staff_type?: string;
  seniority?: string;
}

export interface UpdateEmployeePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  department?: string;
  job_title?: string;
}

export interface CreateLaptopPayload {
  asset_tag: string;
  brand: string;
  model: string;
  serial_number: string;
  purchase_date?: string | null;
}

export interface UpdateLaptopPayload {
  asset_tag?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string | null;
}

export interface AssignPayload {
  laptop_id: string;
  employee_id: string;
}

export interface ReassignPayload {
  laptop_id: string;
  new_employee_id: string;
}

// ── Dashboard Types ────────────────────────────────────────────

export interface DashboardSummary {
  total: number;
  available: number;
  assigned: number;
  faulty: number;
  retired: number;
  active_employees: number;
  inactive_employees: number;
}

export interface DashboardAlert {
  employee: Employee;
  laptop: Laptop;
  assignment: Assignment;
}

// ── Auth Types ─────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ── Filter & Pagination ────────────────────────────────────────

export interface LaptopFilters {
  search?: string;
  status?: LaptopStatus | 'ALL';
}

export interface EmployeeFilters {
  search?: string;
  status?: EmployeeStatus | 'ALL';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
