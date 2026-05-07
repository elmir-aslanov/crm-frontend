import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiFetch } from "./http";

export type Id = string;

// ---- TYPES ----

export type Student = {
  id?: Id;
  _id?: Id;
  studentCode?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string | null;
  status?: string;
  isDeleted?: boolean;
  subgroup?: string | null;
  lessonFormat?: string | null;
};

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
};

export type Category = {
  _id?: Id;
  id?: Id;
  name: string;
  description?: string;
};

export type Course = {
  id?: Id;
  _id?: Id;
  name: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
  categoryId?: Category | string | null;
};

export type Group = {
  id?: Id;
  _id?: Id;
  code: string;
  courseId?: { _id: string; name: string } | null;
  teacherId?: { _id: string; firstName: string; lastName: string } | null;
  startDate?: string;
  endDate?: string;
  maxCapacity?: number;
  status?: string;
  room?: string;
};

export type Enrollment = {
  _id?: Id;
  id?: Id;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    studentCode?: string;
  };
  groupId?: Id;
  status?: string;
};

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Proposal Sent",
  "Won",
  "Lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type Lead = {
  id?: Id;
  _id?: Id;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  source?: string;
  status?: LeadStatus;
  courseInterest?: { _id: string; name: string } | string | null;
  assignedTo?: { _id: string; firstName: string; lastName: string } | string | null;
  utmSource?: string | null;
  createdAt?: string;
};

export type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused";

export type Attendance = {
  _id?: Id;
  id?: Id;
  enrollmentId?:
    | {
        _id: string;
        studentId?: {
          _id: string;
          firstName: string;
          lastName: string;
          studentCode?: string;
        };
      }
    | string;
  date?: string;
  status?: AttendanceStatus;
  markedBy?: { firstName: string; lastName: string } | string;
  note?: string;
};

export type PaymentStatus = "Pending" | "Paid" | "Overdue" | "Cancelled";

export type Payment = {
  _id?: Id;
  id?: Id;
  amount?: number;
  dueDate?: string;
  paidDate?: string;
  status?: PaymentStatus;
  paymentMethod?: string;
  receiptNumber?: string;
  paymentPlanId?:
    | {
        enrollmentId?: {
          studentId?: {
            firstName: string;
            lastName: string;
            studentCode?: string;
          };
          groupId?: {
            code: string;
            courseId?: { name: string };
          };
        };
      }
    | string;
};

export type DashboardStats = {
  newLeadsThisMonth: number;
  conversionRate: number;
  activeStudents: number;
  totalStudents: number;
  collectedPaymentsThisMonth: number;
  overdueAmount: number;
  courseDistribution: { name: string; value: number }[];
};

export type Settings = {
  companyName: string;
  supportEmail: string;
};

export type ReportSummary = {
  activeGroups: number;
  attendanceRate: number;
  monthlyRevenue: number;
  currency?: string;
};

export type ListResponse<T> = {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

// ---- HELPERS ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeList<T extends { id?: string; _id?: string }>(
  data: any
): ListResponse<T> {
  const unwrapped =
    data !== null &&
    typeof data === "object" &&
    "success" in data &&
    "data" in data
      ? data.data
      : data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arr: any[] = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray(unwrapped?.items)
      ? unwrapped.items
      : Array.isArray(unwrapped?.leads)
        ? unwrapped.leads
        : Array.isArray(unwrapped?.users)
          ? unwrapped.users
          : Array.isArray(unwrapped?.courses)
            ? unwrapped.courses
            : Array.isArray(unwrapped?.groups)
              ? unwrapped.groups
              : Array.isArray(unwrapped?.students)
                ? unwrapped.students
                : Array.isArray(unwrapped?.data)
                  ? unwrapped.data
                  : [];

  const pagination = unwrapped?.pagination ?? {};

  return {
    items: arr.map((item: any) => ({
      ...item,
      id: item.id ?? item._id,
    })) as T[],
    total: unwrapped?.total ?? pagination?.total ?? arr.length,
    page: unwrapped?.page ?? pagination?.page,
    limit: unwrapped?.limit ?? pagination?.limit,
    totalPages:
      unwrapped?.pages ?? unwrapped?.totalPages ?? pagination?.totalPages,
  };
}

// ---- AUTH ----

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  success: boolean;
  message?: string;
  data: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  };
};

export function useLogin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
        _skipRefresh: true,
      }),
    onSuccess: (res) => {
      const { accessToken, refreshToken, ...user } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      qc.invalidateQueries();
    },
  });
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}

// ---- STUDENTS ----

export function useStudents(search?: string) {
  return useQuery({
    queryKey: ["students", search ?? ""],
    queryFn: async () => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await apiFetch<unknown>(`/students${qs}`);
      return normalizeList<Student>(data);
    },
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Student, "id" | "_id">) =>
      apiFetch<unknown>("/students", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Student> & { id: Id }) =>
      apiFetch<unknown>(`/students/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: Id) =>
      apiFetch<unknown>(`/students/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

// ---- USERS ----

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await apiFetch<unknown>("/users");
      return normalizeList<User>(data).items;
    },
  });
}

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
};

export function useCreateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      apiFetch<unknown>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

// ---- CATEGORIES ----

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await apiFetch<unknown>("/courses/categories");
      return (Array.isArray(data) ? data : []) as Category[];
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Category, "id" | "_id">) =>
      apiFetch<unknown>("/courses/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: Id) =>
      apiFetch<unknown>(`/courses/categories/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// ---- COURSES ----

export function useCourses(search?: string) {
  return useQuery({
    queryKey: ["courses", search ?? ""],
    queryFn: async () => {
      const data = await apiFetch<unknown>("/courses");
      const list = normalizeList<Course>(data);

      let items = list.items.filter((c) => c.isActive !== false);

      if (search) {
        const q = search.toLowerCase();
        items = items.filter((c) => c.name?.toLowerCase().includes(q));
      }

      return { ...list, items };
    },
  });
}

export function useFeaturedCourses() {
  return useQuery({
    queryKey: ["courses", "featured"],
    queryFn: async () => {
      const data = await apiFetch<unknown>("/courses");
      const list = normalizeList<Course>(data);

      return {
        ...list,
        items: list.items.filter((c) => c.isActive !== false),
      };
    },
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Course, "id" | "_id">) =>
      apiFetch<unknown>("/courses", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: Id) =>
      apiFetch<unknown>(`/courses/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: false }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

// ---- GROUPS ----

export function useGroups(params: { search?: string; courseId?: string } = {}) {
  return useQuery({
    queryKey: ["groups", params],
    queryFn: async () => {
      const data = await apiFetch<unknown>("/groups");
      return normalizeList<Group>(data);
    },
  });
}

export function useOpenGroups(
  params: { search?: string; courseId?: string } = {}
) {
  return useQuery({
    queryKey: ["groups", "open", params],
    queryFn: async () => {
      const data = await apiFetch<unknown>("/groups");
      const list = normalizeList<Group>(data);
      return {
        ...list,
        items: list.items.filter(
          (g) => g.status === "Forming" || g.status === "Active"
        ),
      };
    },
  });
}

export function useGroupStudents(groupId?: Id) {
  return useQuery({
    queryKey: ["groups", groupId, "students"],
    queryFn: async () => {
      const data = await apiFetch<unknown>(
        `/groups/${encodeURIComponent(groupId!)}/students`
      );
      return (Array.isArray(data) ? data : []) as Enrollment[];
    },
    enabled: !!groupId,
  });
}

// ---- LEADS ----

export function useLeads(params: { status?: string } = {}) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: async () => {
      const qs = params.status
        ? `?status=${encodeURIComponent(params.status)}`
        : "";
      const data = await apiFetch<unknown>(`/leads${qs}`);
      return normalizeList<Lead>(data);
    },
  });
}

export function useCreateLead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Lead, "id" | "_id">) =>
      apiFetch<unknown>("/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      comment,
    }: {
      id: Id;
      status: LeadStatus | string;
      comment?: string;
    }) =>
      apiFetch<unknown>(`/leads/${encodeURIComponent(id)}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, comment }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

// ---- ATTENDANCE ----

export function useAttendanceByGroup(groupId?: Id) {
  return useQuery({
    queryKey: ["attendance", "group", groupId],
    queryFn: async () => {
      const data = await apiFetch<unknown>(
        `/attendance/group/${encodeURIComponent(groupId!)}`
      );
      return (Array.isArray(data) ? data : []) as Attendance[];
    },
    enabled: !!groupId,
  });
}

export function useBulkMarkAttendance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      groupId: Id;
      date: string;
      records: {
        enrollmentId: Id;
        status: string;
        note?: string;
      }[];
    }) =>
      apiFetch<unknown>("/attendance/bulk", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["attendance", "group", vars.groupId],
      });
    },
  });
}

// ---- PAYMENTS ----

export function useOverduePayments() {
  return useQuery({
    queryKey: ["payments", "overdue"],
    queryFn: async () => {
      const data = await apiFetch<unknown>("/payments/overdue");
      return (Array.isArray(data) ? data : []) as Payment[];
    },
  });
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      paidDate,
      paymentMethod,
      receiptNumber,
    }: {
      id: Id;
      status: string;
      paidDate?: string;
      paymentMethod?: string;
      receiptNumber?: string;
    }) =>
      apiFetch<unknown>(`/payments/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          paidDate,
          paymentMethod,
          receiptNumber,
        }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

// ---- DASHBOARD ----

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiFetch<DashboardStats>("/dashboard/stats"),
  });
}

// ---- REPORTS ----

export function useReportSummary() {
  return useQuery({
    queryKey: ["reports", "summary"],
    queryFn: async (): Promise<ReportSummary> => {
      const [stats, attendance] = await Promise.all([
        apiFetch<DashboardStats>("/dashboard/stats"),
        apiFetch<{ total: number; present: number; absent: number; rate: number }>("/reports/attendance").catch(() => null),
      ]);

      return {
        activeGroups: stats.activeStudents,
        attendanceRate: attendance?.rate ?? 0,
        monthlyRevenue: stats.collectedPaymentsThisMonth,
        currency: "AZN",
      };
    },
  });
}

// ---- SETTINGS ----

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<Settings> => ({
      companyName: "Kometa",
      supportEmail: "support@example.com",
    }),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Settings>): Promise<Settings> => ({
      companyName: payload.companyName ?? "Kometa",
      supportEmail: payload.supportEmail ?? "support@example.com",
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}

// ---- PIPELINE ----

export type PipelineStage = {
  status: LeadStatus;
  count: number;
  leads: Pick<Lead, "_id" | "id" | "firstName" | "lastName" | "phone" | "source" | "assignedTo">[];
  transitions: LeadStatus[];
};

export function usePipeline() {
  return useQuery({
    queryKey: ["leads", "pipeline"],
    queryFn: () => apiFetch<PipelineStage[]>("/leads/pipeline"),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Lead> & { id: Id }) =>
      apiFetch<unknown>(`/leads/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

// ---- INTERACTIONS ----

export type InteractionType = "Call" | "Email" | "Meeting" | "Note";
export type InteractionDirection = "Inbound" | "Outbound";
export type InteractionOutcome = "Positive" | "Neutral" | "Negative";

export type Interaction = {
  _id?: Id;
  id?: Id;
  leadId?: Id;
  type: InteractionType;
  direction?: InteractionDirection;
  summary: string;
  duration?: number;
  scheduledAt?: string | null;
  completedAt?: string | null;
  outcome?: InteractionOutcome;
  createdBy?: { _id: string; firstName: string; lastName: string; role?: string } | string;
  createdAt?: string;
};

export function useInteractions(leadId?: Id) {
  return useQuery({
    queryKey: ["interactions", leadId],
    queryFn: async () => {
      const data = await apiFetch<unknown>(
        `/leads/${encodeURIComponent(leadId!)}/interactions`
      );
      const list = normalizeList<Interaction>(data);
      return list.items;
    },
    enabled: !!leadId,
  });
}

export function useCreateInteraction(leadId?: Id) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Interaction, "_id" | "id" | "leadId" | "createdAt" | "createdBy">) =>
      apiFetch<Interaction>(`/leads/${encodeURIComponent(leadId!)}/interactions`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interactions", leadId] });
    },
  });
}

// ---- TASKS ----

export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Overdue" | "Cancelled";
export type TaskPriority = "Low" | "Medium" | "High";

export type Task = {
  _id?: Id;
  id?: Id;
  title: string;
  description?: string | null;
  leadId?: { _id: string; firstName: string; lastName: string; phone?: string } | string | null;
  assignedTo?: { _id: string; firstName: string; lastName: string; role?: string } | string;
  createdBy?: { _id: string; firstName: string; lastName: string } | string;
  dueDate: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  reminderSentAt?: string | null;
  createdAt?: string;
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  leadId?: Id | null;
  assignedTo: Id;
  dueDate: string;
  priority?: TaskPriority;
};

export function useTasks(params: {
  status?: string;
  priority?: string;
  assignedTo?: Id;
  leadId?: Id;
  dueBefore?: string;
  dueAfter?: string;
  page?: number;
} = {}) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") qs.set(k, String(v));
      });
      const data = await apiFetch<unknown>(`/tasks?${qs.toString()}`);
      return normalizeList<Task>(data);
    },
  });
}

export function useMyTasks() {
  return useQuery({
    queryKey: ["tasks", "me"],
    queryFn: async () => {
      const data = await apiFetch<unknown>("/tasks/me");
      return (Array.isArray(data) ? data : []) as Task[];
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) =>
      apiFetch<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Task> & { id: Id }) =>
      apiFetch<Task>(`/tasks/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// ---- AUDIT TRAIL ----

export type AuditLogEntry = {
  _id?: Id;
  entityType: string;
  entityId: Id;
  action: "create" | "update" | "delete";
  changedBy?: { _id: string; firstName: string; lastName: string; email: string; role?: string } | null;
  changes: { field: string; oldValue: unknown; newValue: unknown }[];
  ip?: string;
  createdAt?: string;
};

export function useLeadAuditTrail(leadId?: Id) {
  return useQuery({
    queryKey: ["leads", leadId, "audit"],
    queryFn: () =>
      apiFetch<AuditLogEntry[]>(`/leads/${encodeURIComponent(leadId!)}/audit`),
    enabled: !!leadId,
  });
}