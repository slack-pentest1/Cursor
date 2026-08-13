export type Employee = {
  id: string
  name: string
  email: string
  role: string
  department: string
  location: string
  startDate: string
  status: 'Active' | 'On leave' | 'Contractor'
}

export type EmployeeTask = {
  id: string
  employeeId: string
  title: string
  notes: string
  createdAt: string
  status: 'Open' | 'Done'
}

export const employees: Employee[] = [
  {
    id: 'e1',
    name: 'Maya Chen',
    email: 'maya.chen@example.com',
    role: 'Product Designer',
    department: 'Design',
    location: 'San Francisco',
    startDate: '2023-04-12',
    status: 'Active',
  },
  {
    id: 'e2',
    name: 'Jordan Blake',
    email: 'jordan.blake@example.com',
    role: 'Engineering Manager',
    department: 'Engineering',
    location: 'Austin',
    startDate: '2021-09-01',
    status: 'Active',
  },
  {
    id: 'e3',
    name: 'Sam Okonkwo',
    email: 'sam.okonkwo@example.com',
    role: 'People Partner',
    department: 'People',
    location: 'Remote',
    startDate: '2022-01-18',
    status: 'On leave',
  },
  {
    id: 'e4',
    name: 'Riley Navarro',
    email: 'riley.navarro@example.com',
    role: 'Data Analyst',
    department: 'Analytics',
    location: 'Chicago',
    startDate: '2024-06-03',
    status: 'Contractor',
  },
]

export const initialTasks: EmployeeTask[] = [
  {
    id: 't1',
    employeeId: 'e1',
    title: 'Refresh portfolio case studies',
    notes: 'Update Q2 work samples before design review.',
    createdAt: '2026-08-01T14:00:00.000Z',
    status: 'Open',
  },
  {
    id: 't2',
    employeeId: 'e2',
    title: 'Schedule 1:1 skip-levels',
    notes: 'Book time with each direct report this month.',
    createdAt: '2026-08-05T09:30:00.000Z',
    status: 'Open',
  },
]
