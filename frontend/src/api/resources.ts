import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./http";

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

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Interested"
  | "Trial"
  | "Enrolled"
  | "Lost";

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
          studentId?: { firstName: string; lastName: string; studentCode?: string };
          groupId?: { code: string; courseId?: { name: string } };
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
function normalizeList<T extends { id?: string; _id?: string }>(data: any): ListResponse<T> {
  const unwrapped =
    data !== null && typeof data === "object" && "success" in data && "data" in data
      ? data.data
      : data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arr: any[] = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray(unwrapped?.items)   ? unwrapped.items
    : Array.isArray(unwrapped?.leads)   ? unwrapped.leads
    : Array.isArray(unwrapped?.users)   ? unwrapped.users
    : Array.isArray(unwrapped?.courses) ? unwrapped.courses
    : Array.isArray(unwrapped?.groups)  ? unwrapped.groups
    : Array.isArray(unwrapped?.students)? unwrapped.students
    : Array.isArray(unwrapped?.data)    ? unwrapped.data
    : [];

  const pagination = unwrapped?.pagination ?? {};

  return {
    items: arr.map((item: any) => ({ ...item, id: item.id ?? item._id })) as T[],
    total: unwrapped?.total ?? pagination?.total ?? arr.length,
    page: unwrapped?.page ?? pagination?.page,
    limit: unwrapped?.limit ?? pagination?.limit,
    totalPages: unwrapped?.pages ?? unwrapped?.totalPages ?? pagination?.totalPages,
  };
}

// ---- AUTH ----

export type LoginPayload = { email: string; password: string };

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
  };
};

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: (res) => {
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data));
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
      apiFetch<unknown>("/students", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Student> & { id: Id }) =>
      apiFetch<unknown>(`/students/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: Id) =>
      apiFetch<unknown>(`/students/${encodeURIComponent(id)}`, { method: "DELETE" }),
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
      apiFetch<unknown>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
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
      return { ...list, items: list.items.filter((c) => c.isActive !== false) };
    },
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Course, "id" | "_id">) =>
      apiFetch<unknown>("/courses", { method: "POST", body: JSON.stringify(payload) }),
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

export function useOpenGroups(params: { search?: string; courseId?: string } = {}) {
  return useQuery({
    queryKey: ["groups", "open", params],
    queryFn: async () => {
      const data = await apiFetch<unknown>("/groups");
      return normalizeList<Group>(data);
    },
  });
}

export function useGroupStudents(groupId?: Id) {
  return useQuery({
    queryKey: ["groups", groupId, "students"],
    queryFn: async () => {
      const data = await apiFetch<unknown>(`/groups/${encodeURIComponent(groupId!)}/students`);
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
      const qs = params.status ? `?status=${encodeURIComponent(params.status)}` : "";
      const data = await apiFetch<unknown>(`/leads${qs}`);
      return normalizeList<Lead>(data);
    },
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Lead, "id" | "_id">) =>
      apiFetch<unknown>("/leads", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, comment }: { id: Id; status: string; comment?: string }) =>
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
      const data = await apiFetch<unknown>(`/attendance/group/${encodeURIComponent(groupId!)}`);
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
      records: { enrollmentId: Id; status: string; note?: string }[];
    }) =>
      apiFetch<unknown>("/attendance/bulk", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["attendance", "group", vars.groupId] });
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
      id, status, paidDate, paymentMethod, receiptNumber,
    }: { id: Id; status: string; paidDate?: string; paymentMethod?: string; receiptNumber?: string }) =>
      apiFetch<unknown>(`/payments/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({ status, paidDate, paymentMethod, receiptNumber }),
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
      const stats = await apiFetch<DashboardStats>("/dashboard/stats");
      return {
        activeGroups: stats.activeStudents,
        attendanceRate: 0,
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
