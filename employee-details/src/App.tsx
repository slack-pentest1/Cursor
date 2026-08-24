import { useMemo, useState, type FormEvent } from 'react'
import {
  departments,
  emptyDraft,
  initials,
  initialEmployees,
  initialTasks,
  type Employee,
  type EmployeeDraft,
  type EmployeeStatus,
  type EmployeeTask,
} from './data/employees'
import './App.css'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

type ViewMode = 'person' | 'team' | 'add'

function App() {
  const [people, setPeople] = useState<Employee[]>(initialEmployees)
  const [selectedId, setSelectedId] = useState(initialEmployees[0]?.id ?? '')
  const [tasks, setTasks] = useState<EmployeeTask[]>(initialTasks)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [query, setQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('person')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<EmployeeDraft>(emptyDraft())

  const selected = useMemo(
    () => people.find((e) => e.id === selectedId) ?? null,
    [people, selectedId],
  )

  const managerName = useMemo(() => {
    if (!selected?.managerId) return null
    return people.find((e) => e.id === selected.managerId)?.name ?? null
  }, [people, selected])

  const directReports = useMemo(
    () => people.filter((e) => e.managerId === selectedId),
    [people, selectedId],
  )

  const filteredEmployees = useMemo(() => {
    const q = query.trim().toLowerCase()
    return people.filter((e) => {
      const matchesDept =
        departmentFilter === 'All' || e.department === departmentFilter
      if (!matchesDept) return false
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      )
    })
  }, [people, query, departmentFilter])

  const teamOverview = useMemo(() => {
    const byDept = new Map<string, Employee[]>()
    for (const person of people) {
      const list = byDept.get(person.department) ?? []
      list.push(person)
      byDept.set(person.department, list)
    }
    return [...byDept.entries()]
      .map(([department, members]) => ({
        department,
        members: members.sort((a, b) => a.name.localeCompare(b.name)),
        active: members.filter((m) => m.status === 'Active').length,
        openTasks: tasks.filter(
          (t) =>
            t.status === 'Open' &&
            members.some((m) => m.id === t.employeeId),
        ).length,
      }))
      .sort((a, b) => a.department.localeCompare(b.department))
  }, [people, tasks])

  const employeeTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.employeeId === selectedId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [tasks, selectedId],
  )

  const managerOptions = useMemo(
    () =>
      people
        .filter((e) => e.id !== selectedId || view === 'add')
        .sort((a, b) => a.name.localeCompare(b.name)),
    [people, selectedId, view],
  )

  function selectEmployee(employee: Employee) {
    setSelectedId(employee.id)
    setJustCreatedId(null)
    setEditing(false)
    setView('person')
  }

  function openAddPerson() {
    setDraft(emptyDraft())
    setEditing(false)
    setView('add')
  }

  function openEditPerson() {
    if (!selected) return
    setDraft({
      name: selected.name,
      email: selected.email,
      role: selected.role,
      department: selected.department,
      location: selected.location,
      startDate: selected.startDate,
      status: selected.status,
      managerId: selected.managerId ?? '',
    })
    setEditing(true)
    setView('person')
  }

  function updateDraft<K extends keyof EmployeeDraft>(
    key: K,
    value: EmployeeDraft[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function handleSavePerson(event: FormEvent) {
    event.preventDefault()
    if (!draft.name.trim() || !draft.email.trim() || !draft.role.trim()) return

    if (view === 'add') {
      const person: Employee = {
        id: `e-${crypto.randomUUID()}`,
        name: draft.name.trim(),
        email: draft.email.trim(),
        role: draft.role.trim(),
        department: draft.department.trim() || 'Operations',
        location: draft.location.trim() || 'Remote',
        startDate: draft.startDate || new Date().toISOString().slice(0, 10),
        status: draft.status,
        managerId: draft.managerId || null,
      }
      setPeople((prev) => [...prev, person])
      setSelectedId(person.id)
      setView('person')
      setEditing(false)
      return
    }

    if (!selected) return
    setPeople((prev) =>
      prev.map((person) =>
        person.id === selected.id
          ? {
              ...person,
              name: draft.name.trim(),
              email: draft.email.trim(),
              role: draft.role.trim(),
              department: draft.department.trim() || person.department,
              location: draft.location.trim() || person.location,
              startDate: draft.startDate || person.startDate,
              status: draft.status,
              managerId:
                draft.managerId && draft.managerId !== person.id
                  ? draft.managerId
                  : null,
            }
          : person,
      ),
    )
    setEditing(false)
  }

  function handleCreateTask(event: FormEvent) {
    event.preventDefault()
    if (!selected || !title.trim()) return

    const task: EmployeeTask = {
      id: `t-${crypto.randomUUID()}`,
      employeeId: selected.id,
      title: title.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      status: 'Open',
    }

    setTasks((prev) => [task, ...prev])
    setJustCreatedId(task.id)
    setTitle('')
    setNotes('')
  }

  function toggleTask(taskId: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'Open' ? 'Done' : 'Open' }
          : t,
      ),
    )
  }

  function renderPersonForm(mode: 'add' | 'edit') {
    return (
      <form className="person-form" onSubmit={handleSavePerson}>
        <div className="section-head">
          <h2>{mode === 'add' ? 'Add teammate' : 'Edit details'}</h2>
          <p>
            {mode === 'add'
              ? 'Grow the roster with a new teammate'
              : `Update ${selected?.name.split(' ')[0] ?? 'this person'}`}
          </p>
        </div>
        <div className="form-grid">
          <label>
            <span>Full name</span>
            <input
              value={draft.name}
              onChange={(e) => updateDraft('name', e.target.value)}
              required
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={draft.email}
              onChange={(e) => updateDraft('email', e.target.value)}
              required
            />
          </label>
          <label>
            <span>Role</span>
            <input
              value={draft.role}
              onChange={(e) => updateDraft('role', e.target.value)}
              required
            />
          </label>
          <label>
            <span>Department</span>
            <select
              value={draft.department}
              onChange={(e) => updateDraft('department', e.target.value)}
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Location</span>
            <input
              value={draft.location}
              onChange={(e) => updateDraft('location', e.target.value)}
            />
          </label>
          <label>
            <span>Start date</span>
            <input
              type="date"
              value={draft.startDate}
              onChange={(e) => updateDraft('startDate', e.target.value)}
            />
          </label>
          <label>
            <span>Status</span>
            <select
              value={draft.status}
              onChange={(e) =>
                updateDraft('status', e.target.value as EmployeeStatus)
              }
            >
              <option value="Active">Active</option>
              <option value="On leave">On leave</option>
              <option value="Contractor">Contractor</option>
            </select>
          </label>
          <label>
            <span>Manager</span>
            <select
              value={draft.managerId}
              onChange={(e) => updateDraft('managerId', e.target.value)}
            >
              <option value="">No manager</option>
              {managerOptions.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} · {person.role}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" className="primary">
            {mode === 'add' ? 'Add to team' : 'Save changes'}
          </button>
          {mode === 'edit' ? (
            <button
              type="button"
              className="ghost"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              className="ghost"
              onClick={() => setView('person')}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    )
  }

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <p className="brand-name">Staffline</p>
            <p className="brand-tag">Team management for people leads</p>
          </div>
        </div>
        <div className="topbar-actions">
          <label className="search">
            <span className="sr-only">Search employees</span>
            <input
              type="search"
              placeholder="Search people, roles, teams…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button type="button" className="primary" onClick={openAddPerson}>
            Add person
          </button>
        </div>
      </header>

      <main className="layout layout-manage">
        <aside className="roster" aria-label="Employee roster">
          <div className="section-head">
            <h2>People</h2>
            <p>{filteredEmployees.length} on file</p>
          </div>

          <div className="roster-controls">
            <label>
              <span className="sr-only">Filter by department</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="All">All departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={`chip${view === 'team' ? ' is-active' : ''}`}
              onClick={() => setView('team')}
            >
              Team overview
            </button>
          </div>

          <ul className="roster-list">
            {filteredEmployees.map((employee, index) => {
              const active = employee.id === selectedId && view === 'person'
              return (
                <li
                  key={employee.id}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <button
                    type="button"
                    className={`roster-item${active ? ' is-active' : ''}`}
                    onClick={() => selectEmployee(employee)}
                    aria-current={active ? 'true' : undefined}
                  >
                    <span className="avatar" aria-hidden="true">
                      {initials(employee.name)}
                    </span>
                    <span className="roster-copy">
                      <span className="roster-name">{employee.name}</span>
                      <span className="roster-meta">
                        {employee.role} · {employee.department}
                      </span>
                    </span>
                    <span
                      className={`status status-${employee.status
                        .replace(' ', '-')
                        .toLowerCase()}`}
                    >
                      {employee.status}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <section className="detail" aria-live="polite">
          {view === 'team' ? (
            <div className="team-view">
              <div className="detail-hero">
                <p className="eyebrow">Team overview</p>
                <h1>Manage your teams</h1>
                <p className="lede">
                  {people.length} people across {teamOverview.length}{' '}
                  departments ·{' '}
                  {tasks.filter((t) => t.status === 'Open').length} open tasks
                </p>
              </div>
              <div className="team-grid">
                {teamOverview.map((team) => (
                  <article key={team.department} className="team-card">
                    <div className="section-head">
                      <h2>{team.department}</h2>
                      <p>
                        {team.active} active · {team.openTasks} open tasks
                      </p>
                    </div>
                    <ul className="team-members">
                      {team.members.map((member) => (
                        <li key={member.id}>
                          <button
                            type="button"
                            onClick={() => selectEmployee(member)}
                          >
                            <span className="avatar avatar-sm" aria-hidden="true">
                              {initials(member.name)}
                            </span>
                            <span>
                              <span className="roster-name">{member.name}</span>
                              <span className="roster-meta">{member.role}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          ) : view === 'add' ? (
            <div className="panel-pad">{renderPersonForm('add')}</div>
          ) : selected ? (
            <>
              <div className="detail-hero">
                <div className="detail-identity">
                  <span className="avatar avatar-lg" aria-hidden="true">
                    {initials(selected.name)}
                  </span>
                  <div>
                    <p className="eyebrow">Employee details</p>
                    <h1>{selected.name}</h1>
                    <p className="lede">
                      {selected.role} in {selected.department} ·{' '}
                      {selected.location}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ghost edit-btn"
                    onClick={openEditPerson}
                  >
                    Edit
                  </button>
                </div>
                <dl className="facts">
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${selected.email}`}>{selected.email}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>Start date</dt>
                    <dd>{formatDate(selected.startDate)}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{selected.status}</dd>
                  </div>
                  <div>
                    <dt>Department</dt>
                    <dd>{selected.department}</dd>
                  </div>
                  <div>
                    <dt>Manager</dt>
                    <dd>
                      {managerName ? (
                        <button
                          type="button"
                          className="linkish"
                          onClick={() => {
                            const manager = people.find(
                              (p) => p.id === selected.managerId,
                            )
                            if (manager) selectEmployee(manager)
                          }}
                        >
                          {managerName}
                        </button>
                      ) : (
                        'Unassigned'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Direct reports</dt>
                    <dd>
                      {directReports.length === 0
                        ? 'None'
                        : `${directReports.length} people`}
                    </dd>
                  </div>
                </dl>
              </div>

              {editing ? (
                <div className="panel-pad">{renderPersonForm('edit')}</div>
              ) : null}

              {directReports.length > 0 ? (
                <div className="task-panel reports-panel">
                  <div className="section-head">
                    <h2>Direct reports</h2>
                    <p>People managed by {selected.name.split(' ')[0]}</p>
                  </div>
                  <ul className="reports-list">
                    {directReports.map((report) => (
                      <li key={report.id}>
                        <button
                          type="button"
                          onClick={() => selectEmployee(report)}
                        >
                          <span className="avatar" aria-hidden="true">
                            {initials(report.name)}
                          </span>
                          <span>
                            <span className="roster-name">{report.name}</span>
                            <span className="roster-meta">
                              {report.role} · {report.status}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="task-panel">
                <div className="section-head">
                  <h2>Create a task</h2>
                  <p>
                    Attach follow-ups to {selected.name.split(' ')[0]}&apos;s
                    record
                  </p>
                </div>

                <form className="task-form" onSubmit={handleCreateTask}>
                  <label>
                    <span>Task title</span>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Complete equipment checklist"
                      required
                    />
                  </label>
                  <label>
                    <span>Notes</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional context for this task"
                      rows={3}
                    />
                  </label>
                  <button type="submit" className="primary">
                    Create task
                  </button>
                </form>

                <ul
                  className="task-list"
                  aria-label={`Tasks for ${selected.name}`}
                >
                  {employeeTasks.length === 0 ? (
                    <li className="empty">No tasks yet for this employee.</li>
                  ) : (
                    employeeTasks.map((task) => (
                      <li
                        key={task.id}
                        className={`task-item${
                          justCreatedId === task.id ? ' is-new' : ''
                        }${task.status === 'Done' ? ' is-done' : ''}`}
                      >
                        <button
                          type="button"
                          className="check"
                          onClick={() => toggleTask(task.id)}
                          aria-pressed={task.status === 'Done'}
                          aria-label={
                            task.status === 'Done'
                              ? `Mark "${task.title}" as open`
                              : `Mark "${task.title}" as done`
                          }
                        />
                        <div>
                          <p className="task-title">{task.title}</p>
                          {task.notes ? (
                            <p className="task-notes">{task.notes}</p>
                          ) : null}
                          <p className="task-meta">
                            {task.status} · {formatDate(task.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h1>Select an employee</h1>
              <p>
                Choose someone from the roster to view details and create
                tasks.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
