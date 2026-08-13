import { useMemo, useState, type FormEvent } from 'react'
import {
  employees,
  initialTasks,
  type Employee,
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

function App() {
  const [selectedId, setSelectedId] = useState(employees[0]?.id ?? '')
  const [tasks, setTasks] = useState<EmployeeTask[]>(initialTasks)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [query, setQuery] = useState('')
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null)

  const selected = useMemo(
    () => employees.find((e) => e.id === selectedId) ?? null,
    [selectedId],
  )

  const filteredEmployees = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return employees
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q),
    )
  }, [query])

  const employeeTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.employeeId === selectedId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [tasks, selectedId],
  )

  function selectEmployee(employee: Employee) {
    setSelectedId(employee.id)
    setJustCreatedId(null)
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

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <p className="brand-name">Staffline</p>
            <p className="brand-tag">Employee details &amp; tasks</p>
          </div>
        </div>
        <label className="search">
          <span className="sr-only">Search employees</span>
          <input
            type="search"
            placeholder="Search people, roles, teams…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </header>

      <main className="layout">
        <aside className="roster" aria-label="Employee roster">
          <div className="section-head">
            <h2>People</h2>
            <p>{filteredEmployees.length} on file</p>
          </div>
          <ul className="roster-list">
            {filteredEmployees.map((employee, index) => {
              const active = employee.id === selectedId
              return (
                <li key={employee.id} style={{ animationDelay: `${index * 40}ms` }}>
                  <button
                    type="button"
                    className={`roster-item${active ? ' is-active' : ''}`}
                    onClick={() => selectEmployee(employee)}
                    aria-current={active ? 'true' : undefined}
                  >
                    <span className="avatar" aria-hidden="true">
                      {employee.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                    <span className="roster-copy">
                      <span className="roster-name">{employee.name}</span>
                      <span className="roster-meta">
                        {employee.role} · {employee.department}
                      </span>
                    </span>
                    <span className={`status status-${employee.status.replace(' ', '-').toLowerCase()}`}>
                      {employee.status}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <section className="detail" aria-live="polite">
          {selected ? (
            <>
              <div className="detail-hero">
                <div className="detail-identity">
                  <span className="avatar avatar-lg" aria-hidden="true">
                    {selected.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                  <div>
                    <p className="eyebrow">Employee details</p>
                    <h1>{selected.name}</h1>
                    <p className="lede">
                      {selected.role} in {selected.department} · {selected.location}
                    </p>
                  </div>
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
                </dl>
              </div>

              <div className="task-panel">
                <div className="section-head">
                  <h2>Create a task</h2>
                  <p>Attach follow-ups to {selected.name.split(' ')[0]}&apos;s record</p>
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

                <ul className="task-list" aria-label={`Tasks for ${selected.name}`}>
                  {employeeTasks.length === 0 ? (
                    <li className="empty">No tasks yet for this employee.</li>
                  ) : (
                    employeeTasks.map((task) => (
                      <li
                        key={task.id}
                        className={`task-item${justCreatedId === task.id ? ' is-new' : ''}${
                          task.status === 'Done' ? ' is-done' : ''
                        }`}
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
                          {task.notes ? <p className="task-notes">{task.notes}</p> : null}
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
              <p>Choose someone from the roster to view details and create tasks.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
