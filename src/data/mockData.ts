import type {
  Employee, Laptop, Assignment, User,
  DashboardSummary, DashboardAlert
} from '../types';

// ── Mock HR Users ──────────────────────────────────────────────
export const mockUsers: User[] = [
  { id: 'u1', name: 'Amarachi Ordor', email: 'amarachi@company.com', created_at: '2024-01-15T08:00:00Z' },
  { id: 'u2', name: 'Tosan Williams', email: 'tosan@company.com', created_at: '2024-01-15T08:00:00Z' },
];

// ── Mock Employees ─────────────────────────────────────────────
export const mockEmployees: Employee[] = [
  { id: 'e1', first_name: 'James', last_name: 'Okafor', email: 'james@company.com', entity: 'LIMS Corp', location: 'Lagos', department: 'Engineering', job_title: 'Software Engineer', staff_type: 'FULL-TIME', seniority: 'Senior', status: 'ACTIVE', created_at: '2024-02-01T09:00:00Z' },
  { id: 'e2', first_name: 'Sade', last_name: 'Adeyemi', email: 'sade@company.com', entity: 'LIMS Corp', location: 'Lagos', department: 'Design', job_title: 'Product Designer', staff_type: 'FULL-TIME', seniority: 'Mid', status: 'ACTIVE', created_at: '2024-02-10T09:00:00Z' },
  { id: 'e3', first_name: 'Emeka', last_name: 'Nwosu', email: 'emeka@company.com', entity: 'LIMS Corp', location: 'Abuja', department: 'Product', job_title: 'Product Manager', staff_type: 'FULL-TIME', seniority: 'Senior', status: 'ACTIVE', created_at: '2024-03-05T09:00:00Z' },
  { id: 'e4', first_name: 'Ngozi', last_name: 'Iheme', email: 'ngozi@company.com', entity: 'LIMS Corp', location: 'Lagos', department: 'Finance', job_title: 'Accountant', staff_type: 'FULL-TIME', seniority: 'Senior', status: 'ACTIVE', created_at: '2024-03-12T09:00:00Z' },
  { id: 'e5', first_name: 'Chidi', last_name: 'Obi', email: 'chidi@company.com', entity: 'LIMS Corp', location: 'PH', department: 'Marketing', job_title: 'Digital Marketer', staff_type: 'CONTRACTOR', seniority: 'Mid', status: 'INACTIVE', created_at: '2024-01-20T09:00:00Z' },
  { id: 'e6', first_name: 'Kemi', last_name: 'Afolabi', email: 'kemi@company.com', entity: 'LIMS Corp', location: 'Lagos', department: 'HR', job_title: 'HR Manager', staff_type: 'FULL-TIME', seniority: 'Senior', status: 'ACTIVE', created_at: '2024-04-01T09:00:00Z' },
  { id: 'e7', first_name: 'Tobi', last_name: 'Adekunle', email: 'tobi@company.com', entity: 'LIMS Corp', location: 'Abuja', department: 'Engineering', job_title: 'Frontend Lead', staff_type: 'FULL-TIME', seniority: 'Lead', status: 'ACTIVE', created_at: '2024-04-15T09:00:00Z' },
  { id: 'e8', first_name: 'Funmi', last_name: 'Bello', email: 'funmi@company.com', entity: 'LIMS Corp', location: 'Lagos', department: 'Operations', job_title: 'Operations Analyst', staff_type: 'FULL-TIME', seniority: 'Mid', status: 'INACTIVE', created_at: '2024-02-28T09:00:00Z' },
  { id: 'e9', first_name: 'Uche', last_name: 'Eze', email: 'uche@company.com', entity: 'LIMS Corp', location: 'Lagos', department: 'Engineering', job_title: 'DevOps Engineer', staff_type: 'FULL-TIME', seniority: 'Mid', status: 'ACTIVE', created_at: '2024-05-01T09:00:00Z' },
  { id: 'e10', first_name: 'Amara', last_name: 'Chisom', email: 'amara@company.com', entity: 'LIMS Corp', location: 'Lagos', department: 'Sales', job_title: 'Account Executive', staff_type: 'FULL-TIME', seniority: 'Mid', status: 'ACTIVE', created_at: '2024-05-12T09:00:00Z' },
];

// ── Mock Laptops ───────────────────────────────────────────────
export const mockLaptops: Laptop[] = [
  { id: 'l1', asset_tag: 'COMP-001', brand: 'Dell', model: 'Latitude 5540', serial_number: 'SN-DL001-2024', status: 'ASSIGNED', condition: 'FUNCTIONAL', purchase_date: '2024-01-10', created_at: '2024-01-15T08:00:00Z' },
  { id: 'l2', asset_tag: 'COMP-002', brand: 'Apple', model: 'MacBook Pro 14"', serial_number: 'SN-AP002-2024', status: 'ASSIGNED', condition: 'FUNCTIONAL', purchase_date: '2024-01-10', created_at: '2024-01-15T08:00:00Z' },
  { id: 'l3', asset_tag: 'COMP-003', brand: 'HP', model: 'EliteBook 840 G10', serial_number: 'SN-HP003-2024', status: 'AVAILABLE', condition: 'FUNCTIONAL', purchase_date: '2024-02-20', created_at: '2024-02-22T08:00:00Z' },
  { id: 'l4', asset_tag: 'COMP-004', brand: 'Lenovo', model: 'ThinkPad X1 Carbon', serial_number: 'SN-LV004-2024', status: 'ASSIGNED', condition: 'FUNCTIONAL', purchase_date: '2024-02-20', created_at: '2024-02-22T08:00:00Z' },
  { id: 'l5', asset_tag: 'COMP-005', brand: 'Dell', model: 'XPS 15', serial_number: 'SN-DL005-2024', status: 'AVAILABLE', condition: 'FAULTY', purchase_date: '2023-11-15', created_at: '2023-11-20T08:00:00Z' },
  { id: 'l6', asset_tag: 'COMP-006', brand: 'Apple', model: 'MacBook Air M2', serial_number: 'SN-AP006-2024', status: 'ASSIGNED', condition: 'FUNCTIONAL', purchase_date: '2024-03-01', created_at: '2024-03-05T08:00:00Z' },
  { id: 'l7', asset_tag: 'COMP-007', brand: 'Microsoft', model: 'Surface Laptop 5', serial_number: 'SN-MS007-2023', status: 'RETIRED', condition: 'FUNCTIONAL', purchase_date: '2021-06-10', created_at: '2021-06-15T08:00:00Z' },
  { id: 'l8', asset_tag: 'COMP-008', brand: 'HP', model: 'ProBook 450 G9', serial_number: 'SN-HP008-2024', status: 'AVAILABLE', condition: 'FUNCTIONAL', purchase_date: '2024-04-01', created_at: '2024-04-05T08:00:00Z' },
  { id: 'l9', asset_tag: 'COMP-009', brand: 'Lenovo', model: 'IdeaPad Slim 5', serial_number: 'SN-LV009-2024', status: 'ASSIGNED', condition: 'FUNCTIONAL', purchase_date: '2024-04-15', created_at: '2024-04-18T08:00:00Z' },
  { id: 'l10', asset_tag: 'COMP-010', brand: 'Dell', model: 'Inspiron 16', serial_number: 'SN-DL010-2024', status: 'AVAILABLE', condition: 'FUNCTIONAL', purchase_date: '2024-05-01', created_at: '2024-05-03T08:00:00Z' },
];

// ── Mock Assignments ───────────────────────────────────────────
export const mockAssignments: Assignment[] = [
  // Active assignments
  { id: 'a1', laptop_id: 'l1', employee_id: 'e1', assigned_date: '2024-02-01T09:00:00Z', returned_date: null, assigned_by: 'u1', created_at: '2024-02-01T09:00:00Z' },
  { id: 'a2', laptop_id: 'l2', employee_id: 'e2', assigned_date: '2024-02-10T09:00:00Z', returned_date: null, assigned_by: 'u1', created_at: '2024-02-10T09:00:00Z' },
  { id: 'a3', laptop_id: 'l4', employee_id: 'e3', assigned_date: '2024-03-05T09:00:00Z', returned_date: null, assigned_by: 'u2', created_at: '2024-03-05T09:00:00Z' },
  { id: 'a4', laptop_id: 'l6', employee_id: 'e4', assigned_date: '2024-03-12T09:00:00Z', returned_date: null, assigned_by: 'u2', created_at: '2024-03-12T09:00:00Z' },
  { id: 'a6', laptop_id: 'l9', employee_id: 'e6', assigned_date: '2024-04-18T09:00:00Z', returned_date: null, assigned_by: 'u1', created_at: '2024-04-18T09:00:00Z' },
  // Historical (closed) assignments
  { id: 'a8', laptop_id: 'l1', employee_id: 'e5', assigned_date: '2024-01-17T09:00:00Z', returned_date: '2024-02-01T09:00:00Z', assigned_by: 'u1', created_at: '2024-01-17T09:00:00Z' },
  { id: 'a9', laptop_id: 'l2', employee_id: 'e7', assigned_date: '2024-01-20T09:00:00Z', returned_date: '2024-02-10T09:00:00Z', assigned_by: 'u2', created_at: '2024-01-20T09:00:00Z' },
];

// ── Computed Helpers ───────────────────────────────────────────

export function getLaptopWithAssignee(laptopId: string): Laptop & { current_assignee?: Employee | null } {
  const laptop = mockLaptops.find(l => l.id === laptopId);
  if (!laptop) throw new Error('Laptop not found');
  const activeAssignment = mockAssignments.find(a => a.laptop_id === laptopId && !a.returned_date);
  const assignee = activeAssignment ? mockEmployees.find(e => e.id === activeAssignment.employee_id) : null;
  return { ...laptop, current_assignee: assignee ?? null };
}

export function getEmployeeWithLaptop(employeeId: string): Employee & { assigned_laptop?: Laptop | null } {
  const emp = mockEmployees.find(e => e.id === employeeId);
  if (!emp) throw new Error('Employee not found');
  const activeAssignment = mockAssignments.find(a => a.employee_id === employeeId && !a.returned_date);
  const laptop = activeAssignment ? mockLaptops.find(l => l.id === activeAssignment.laptop_id) : null;
  return { ...emp, assigned_laptop: laptop ?? null };
}

export function getLaptopHistory(laptopId: string): Array<Assignment & { employee?: Employee; assigned_by_user?: User }> {
  return mockAssignments
    .filter(a => a.laptop_id === laptopId)
    .sort((a, b) => new Date(b.assigned_date).getTime() - new Date(a.assigned_date).getTime())
    .map(a => ({
      ...a,
      employee: mockEmployees.find(e => e.id === a.employee_id),
      assigned_by_user: mockUsers.find(u => u.id === a.assigned_by),
    }));
}

export function getMockDashboardSummary(): DashboardSummary {
  return {
    total: mockLaptops.length,
    available: mockLaptops.filter(l => l.status === 'AVAILABLE').length,
    assigned: mockLaptops.filter(l => l.status === 'ASSIGNED').length,
    faulty: mockLaptops.filter(l => l.condition === 'FAULTY').length,
    retired: mockLaptops.filter(l => l.status === 'RETIRED').length,
    active_employees: mockEmployees.filter(e => e.status === 'ACTIVE').length,
    inactive_employees: mockEmployees.filter(e => e.status === 'INACTIVE').length,
  };
}

export function getMockAlerts(): DashboardAlert[] {
  const result: DashboardAlert[] = [];
  const inactiveEmployees = mockEmployees.filter(e => e.status === 'INACTIVE');
  for (const emp of inactiveEmployees) {
    const activeAssignment = mockAssignments.find(a => a.employee_id === emp.id && !a.returned_date);
    if (activeAssignment) {
      const laptop = mockLaptops.find(l => l.id === activeAssignment.laptop_id);
      if (laptop) result.push({ employee: emp, laptop, assignment: activeAssignment });
    }
  }
  return result;
}
