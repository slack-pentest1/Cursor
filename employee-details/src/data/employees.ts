export type EmployeeStatus = 'Active' | 'On leave' | 'Contractor'

export type Employee = {
  id: string
  name: string
  email: string
  role: string
  department: string
  location: string
  startDate: string
  status: EmployeeStatus
  managerId: string | null
}

export type EmployeeTask = {
  id: string
  employeeId: string
  title: string
  notes: string
  createdAt: string
  status: 'Open' | 'Done'
}

export type EmployeeDraft = {
  name: string
  email: string
  role: string
  department: string
  location: string
  startDate: string
  status: EmployeeStatus
  managerId: string
}

export const emptyDraft = (): EmployeeDraft => ({
  name: '',
  email: '',
  role: '',
  department: '',
  location: '',
  startDate: new Date().toISOString().slice(0, 10),
  status: 'Active',
  managerId: '',
})

export const departments = [
  'Engineering',
  'Design',
  'People',
  'Analytics',
  'Operations',
] as const

export const initialEmployees: Employee[] = [
  {
    id: 'e2',
    name: 'Jordan Blake',
    email: 'jordan.blake@example.com',
    role: 'Engineering Manager',
    department: 'Engineering',
    location: 'Austin',
    startDate: '2021-09-01',
    status: 'Active',
    managerId: null,
  },
  {
    id: 'e1',
    name: 'Maya Chen',
    email: 'maya.chen@example.com',
    role: 'Product Designer',
    department: 'Design',
    location: 'San Francisco',
    startDate: '2023-04-12',
    status: 'Active',
    managerId: 'e2',
  },
  {
    id: 'e5',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    role: 'Frontend Engineer',
    department: 'Engineering',
    location: 'Austin',
    startDate: '2023-11-20',
    status: 'Active',
    managerId: 'e2',
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
    managerId: null,
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
    managerId: 'e3',
  },
  {
    id: 'e6',
    name: 'Casey Patel',
    email: 'casey.patel@example.com',
    role: 'Ops Lead',
    department: 'Operations',
    location: 'New York',
    startDate: '2020-03-09',
    status: 'Active',
    managerId: null,
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
  {
    id: 't3',
    employeeId: 'e5',
    title: 'Ship accessibility pass',
    notes: 'Cover keyboard nav and contrast on roster screens.',
    createdAt: '2026-08-10T16:00:00.000Z',
    status: 'Open',
  },
]

export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
