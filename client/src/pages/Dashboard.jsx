import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Plus,
  Send,
  Trash2,
  UserPlus,
  UserMinus,
  UsersRound,
} from "lucide-react";

import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  IconButton,
  Panel,
  SelectInput,
  TextareaInput,
  TextInput,
} from "../components/ui";
import { cn } from "../utils/cn";

const API_URL = "http://localhost:5000/api";
const OVERDUE_CUTOFF = Date.now();

const emptyProjectForm = {
  title: "",
  description: "",
};

const emptyTaskForm = {
  title: "",
  description: "",
  project: "",
  assignedTo: "",
  priority: "Medium",
  dueDate: "",
};

const priorityTone = {
  High: "red",
  Medium: "amber",
  Low: "green",
};

const statusTone = {
  Done: "green",
  "In Progress": "blue",
  "To Do": "slate",
};

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) return "No due date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isSameUser(left, right) {
  if (!left || !right) return false;
  return String(left) === String(right);
}

function getProjectAdminId(project) {
  return project.admin?._id || project.admin;
}

function StatCard({ title, value, icon: Icon, tone = "slate" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{value ?? 0}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md",
            toneClasses[tone]
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

function Sidebar({ user, onLogout }) {
  const navItems = [
    { icon: LayoutDashboard, label: "Overview", active: true },
    { icon: FolderKanban, label: "Projects" },
    { icon: ClipboardList, label: "Tasks" },
  ];

  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-6 lg:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-950 text-white">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-950">TaskFlow</p>
          <p className="text-xs font-medium uppercase text-slate-500">
            Workspace
          </p>
        </div>
      </div>

      <nav className="mt-9 space-y-1">
        {navItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition",
              active
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
            type="button"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">
              {user?.name || "User"}
            </p>
            <p className="capitalize text-xs font-medium text-slate-500">
              {user?.role || "member"}
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          icon={LogOut}
          className="mt-4 w-full"
          onClick={onLogout}
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}

function ProjectCard({
  project,
  canManageMembers,
  emailValue,
  onEmailChange,
  onAddMember,
  onRemoveMember,
}) {
  const members = project.members || [];
  const adminId = getProjectAdminId(project);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-950">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Admin: {project.admin?.name || "Owner"}
          </p>
        </div>
        <Badge tone="blue">Active</Badge>
      </div>

      <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">
        {project.description || "No description added."}
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-600">
        <UsersRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
        {members.length} {members.length === 1 ? "member" : "members"}
      </div>

      <div className="mt-3 space-y-2">
        {members.slice(0, 4).map((member) => (
          <div
            key={member._id}
            className="flex items-center gap-3 rounded-md bg-slate-50 px-3 py-2"
          >
            <Avatar name={member.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {member.name}
              </p>
              <p className="truncate text-xs text-slate-500">{member.email}</p>
            </div>

            {canManageMembers && !isSameUser(member._id, adminId) && (
              <IconButton
                label={`Remove ${member.name}`}
                icon={UserMinus}
                variant="ghost"
                className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                onClick={() => onRemoveMember(member._id)}
              />
            )}
          </div>
        ))}
      </div>

      {canManageMembers && (
        <div className="mt-4 flex gap-2">
          <input
            type="email"
            placeholder="Member email"
            className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            value={emailValue}
            onChange={(e) => onEmailChange(e.target.value)}
          />
          <IconButton
            label="Add member"
            icon={UserPlus}
            onClick={onAddMember}
            disabled={!emailValue.trim()}
          />
        </div>
      )}
    </article>
  );
}

function TaskCard({ task, canDelete, canUpdateStatus, onStatusChange, onDelete }) {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate).getTime() < OVERDUE_CUTOFF &&
    task.status !== "Done";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-950">{task.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {task.project?.title || "No project"}
          </p>
        </div>
        <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
      </div>

      <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">
        {task.description || "No description added."}
      </p>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="flex items-center gap-2 text-slate-500">
            <UsersRound className="h-4 w-4" aria-hidden="true" />
            Assigned
          </dt>
          <dd className="font-semibold text-slate-800">
            {task.assignedTo?.name || "Unassigned"}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4">
          <dt className="flex items-center gap-2 text-slate-500">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Due
          </dt>
          <dd
            className={cn(
              "font-semibold",
              isOverdue ? "text-rose-600" : "text-slate-800"
            )}
          >
            {formatDate(task.dueDate)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Badge tone={statusTone[task.status]}>{task.status}</Badge>

        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-100"
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value)}
            disabled={!canUpdateStatus}
            title={
              canUpdateStatus
                ? "Update status"
                : "Only the assigned user can update status"
            }
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          {canDelete && (
            <IconButton
              label="Delete task"
              icon={Trash2}
              variant="danger"
              onClick={onDelete}
            />
          )}
        </div>
      </div>
    </article>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = useMemo(() => getStoredUser(), []);

  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [memberEmails, setMemberEmails] = useState({});
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const showNotice = useCallback((type, message) => {
    setNotice({ type, message });
  }, []);

  const showApiError = useCallback((error, fallback) => {
    setNotice({
      type: "error",
      message: error.response?.data?.message || fallback,
    });
  }, []);

  const fetchDashboard = useCallback(async () => {
    const res = await axios.get(`${API_URL}/dashboard`, authConfig);
    setDashboardData(res.data);
  }, [authConfig]);

  const fetchProjects = useCallback(async () => {
    const res = await axios.get(`${API_URL}/projects`, authConfig);
    setProjects(res.data);
  }, [authConfig]);

  const fetchTasks = useCallback(async () => {
    const res = await axios.get(`${API_URL}/tasks`, authConfig);
    setTasks(res.data);
  }, [authConfig]);

  const fetchUsers = useCallback(async () => {
    const res = await axios.get(`${API_URL}/users`, authConfig);
    setUsers(res.data);
  }, [authConfig]);

  const fetchWorkspace = useCallback(async () => {
    try {
      await Promise.all([
        fetchDashboard(),
        fetchProjects(),
        fetchTasks(),
        fetchUsers(),
      ]);
    } catch (error) {
      showApiError(error, "Unable to load the dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchDashboard, fetchProjects, fetchTasks, fetchUsers, showApiError]);

  useEffect(() => {
    // Dashboard data is loaded from the API when the protected route mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWorkspace();
  }, [fetchWorkspace]);

  const refreshTasksAndStats = useCallback(async () => {
    try {
      await Promise.all([fetchTasks(), fetchDashboard()]);
    } catch (error) {
      showApiError(error, "Unable to refresh tasks.");
    }
  }, [fetchDashboard, fetchTasks, showApiError]);

  const createProject = async (e) => {
    e.preventDefault();
    setIsCreatingProject(true);

    try {
      await axios.post(`${API_URL}/projects`, projectForm, authConfig);

      setProjectForm(emptyProjectForm);
      showNotice("success", "Project created.");
      await fetchProjects();
    } catch (error) {
      showApiError(error, "Unable to create project.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    setIsCreatingTask(true);

    try {
      await axios.post(`${API_URL}/tasks`, taskForm, authConfig);

      setTaskForm(emptyTaskForm);
      showNotice("success", "Task created.");
      await refreshTasksAndStats();
    } catch (error) {
      showApiError(error, "Unable to create task.");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await axios.put(`${API_URL}/tasks/${taskId}/status`, { status }, authConfig);

      showNotice("success", "Task status updated.");
      await refreshTasksAndStats();
    } catch (error) {
      showApiError(error, "Unable to update task status.");
    }
  };

  const removeMember = async (projectId, userId) => {
    const shouldRemove = window.confirm("Remove this member from the project?");

    if (!shouldRemove) return;

    try {
      await axios.put(
        `${API_URL}/projects/${projectId}/remove-member`,
        {
          userId,
        },
        authConfig
      );

      setTaskForm((current) => {
        if (current.project !== projectId || current.assignedTo !== userId) {
          return current;
        }

        return {
          ...current,
          assignedTo: "",
        };
      });
      showNotice("success", "Member removed from project.");
      await fetchProjects();
    } catch (error) {
      showApiError(error, "Unable to remove member.");
    }
  };

  const deleteTask = async (taskId) => {
    const shouldDelete = window.confirm("Delete this task?");

    if (!shouldDelete) return;

    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`, authConfig);

      showNotice("success", "Task deleted.");
      await refreshTasksAndStats();
    } catch (error) {
      showApiError(error, "Unable to delete task.");
    }
  };

  const addMember = async (projectId) => {
    const email = (memberEmails[projectId] || "").trim().toLowerCase();
    const foundUser = users.find((candidate) => {
      return candidate.email?.toLowerCase() === email;
    });

    if (!foundUser) {
      showNotice("error", "User not found.");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/projects/${projectId}/add-member`,
        {
          userId: foundUser._id,
        },
        authConfig
      );

      setMemberEmails((current) => ({
        ...current,
        [projectId]: "",
      }));
      showNotice("success", "Member added.");
      await fetchProjects();
    } catch (error) {
      showApiError(error, "Unable to add member.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const stats = [
    {
      title: "Total Tasks",
      value: dashboardData?.totalTasks,
      icon: ClipboardList,
      tone: "slate",
    },
    {
      title: "To Do",
      value: dashboardData?.todoTasks,
      icon: CircleDashed,
      tone: "amber",
    },
    {
      title: "In Progress",
      value: dashboardData?.inProgressTasks,
      icon: Clock3,
      tone: "blue",
    },
    {
      title: "Done",
      value: dashboardData?.doneTasks,
      icon: CheckCircle2,
      tone: "green",
    },
    {
      title: "Overdue",
      value: dashboardData?.overdueTasks,
      icon: Activity,
      tone: "red",
    },
  ];

  const selectedProject = projects.find((project) => {
    return project._id === taskForm.project;
  });
  const assignableMembers = selectedProject?.members || [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 lg:flex">
      <Sidebar user={user} onLogout={logout} />

      <main className="min-w-0 flex-1">
        <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-slate-500">
                Team Task Manager
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-950">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <Avatar name={user?.name} />
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {user?.name || "User"}
                  </p>
                  <p className="capitalize text-xs font-medium text-slate-500">
                    {user?.role || "member"}
                  </p>
                </div>
              </div>

              <IconButton
                label="Logout"
                icon={LogOut}
                onClick={logout}
                className="lg:hidden"
              />
            </div>
          </div>
        </header>

        <div className="px-5 py-6 sm:px-8">
          {notice && (
            <div
              className={cn(
                "mb-6 rounded-lg border px-4 py-3 text-sm font-medium",
                notice.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              )}
              role={notice.type === "error" ? "alert" : "status"}
            >
              {notice.message}
            </div>
          )}

          {isLoading && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
              Loading workspace...
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Panel title="Create Project" eyebrow="Projects">
              <form onSubmit={createProject} className="space-y-4">
                <TextInput
                  label="Project title"
                  type="text"
                  placeholder="Website launch"
                  value={projectForm.title}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      title: e.target.value,
                    })
                  }
                  required
                />

                <TextareaInput
                  label="Description"
                  placeholder="Scope, goals, or useful context"
                  rows="4"
                  value={projectForm.description}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      description: e.target.value,
                    })
                  }
                />

                <Button
                  type="submit"
                  icon={Plus}
                  disabled={isCreatingProject}
                >
                  {isCreatingProject ? "Creating" : "Create Project"}
                </Button>
              </form>
            </Panel>

            <Panel title="Create Task" eyebrow="Tasks">
              <form onSubmit={createTask} className="space-y-4">
                <TextInput
                  label="Task title"
                  type="text"
                  placeholder="Prepare sprint notes"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      title: e.target.value,
                    })
                  }
                  required
                />

                <TextareaInput
                  label="Description"
                  placeholder="Acceptance criteria or key details"
                  rows="3"
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      description: e.target.value,
                    })
                  }
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectInput
                    label="Project"
                    value={taskForm.project}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        project: e.target.value,
                        assignedTo: "",
                      })
                    }
                    required
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                      </option>
                    ))}
                  </SelectInput>

                  <SelectInput
                    label="Assignee"
                    value={taskForm.assignedTo}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        assignedTo: e.target.value,
                      })
                    }
                    required
                    disabled={!taskForm.project}
                    hint={
                      taskForm.project
                        ? "Only project members are shown."
                        : "Select a project first."
                    }
                  >
                    <option value="">Assign user</option>
                    {assignableMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </SelectInput>

                  <SelectInput
                    label="Priority"
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value,
                      })
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </SelectInput>

                  <TextInput
                    label="Due date"
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        dueDate: e.target.value,
                      })
                    }
                  />
                </div>

                <Button type="submit" icon={Send} disabled={isCreatingTask}>
                  {isCreatingTask ? "Creating" : "Create Task"}
                </Button>
              </form>
            </Panel>
          </section>

          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase text-slate-500">
                  Portfolio
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Projects
                </h2>
              </div>
              <Badge tone="blue">{projects.length} total</Badge>
            </div>

            {projects.length === 0 ? (
              <EmptyState icon={FolderKanban} title="No projects yet">
                Create your first project to start grouping team work.
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => {
                  const canManageMembers = isSameUser(
                    getProjectAdminId(project),
                    user?._id
                  );

                  return (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      canManageMembers={canManageMembers}
                      emailValue={memberEmails[project._id] || ""}
                      onEmailChange={(value) =>
                        setMemberEmails((current) => ({
                          ...current,
                          [project._id]: value,
                        }))
                      }
                      onAddMember={() => addMember(project._id)}
                      onRemoveMember={(userId) => removeMember(project._id, userId)}
                    />
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase text-slate-500">
                  Work queue
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Tasks</h2>
              </div>
              <Badge tone="slate">{tasks.length} total</Badge>
            </div>

            {tasks.length === 0 ? (
              <EmptyState icon={ListTodo} title="No tasks yet">
                Create a task and assign it to a project member.
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {tasks.map((task) => {
                  const assignedToId = task.assignedTo?._id || task.assignedTo;
                  const canUpdateStatus = isSameUser(assignedToId, user?._id);

                  return (
                    <TaskCard
                      key={task._id}
                      task={task}
                      canDelete={user?.role === "admin"}
                      canUpdateStatus={canUpdateStatus}
                      onStatusChange={(status) => updateStatus(task._id, status)}
                      onDelete={() => deleteTask(task._id)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
