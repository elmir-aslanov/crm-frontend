import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./http";

export type Id = string;

export type Student = {
  id: Id;
  firstName: string;
  lastName: string;
  subgroup?: string | null;
  lessonFormat?: string | null;
};

export type Course = {
  id: Id;
  name: string;
  durationWeeks?: number | null;
  status?: "Aktiv" | "Planlandı" | "Passiv" | string;
};

export type Group = {
  id: Id;
  name: string;
  courseId?: Id | null;
  courseName?: string | null;
  teacherName?: string | null;
  studentsCount: number;
  capacity: number;
  status: "Aktiv" | "Gözləmədə" | "Bitib" | string;
};

export type ReportSummary = {
  activeGroups: number;
  attendanceRate: number; // 0..1
  monthlyRevenue: number;
  currency?: string;
};

export type Settings = {
  companyName: string;
  supportEmail: string;
};

export type ListResponse<T> = {
  items: T[];
  total?: number;
};

function normalizeList<T>(data: any): ListResponse<T> {
  if (Array.isArray(data)) return { items: data };
  if (data && Array.isArray(data.items)) return data;
  if (data && Array.isArray(data.data)) return { items: data.data, total: data.total };
  return { items: [] };
}

export function useStudents(search?: string) {
  return useQuery({
    queryKey: ["students", { search: search ?? "" }],
    queryFn: async () => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await apiFetch<ListResponse<Student> | Student[]>(`/students${qs}`);
      return normalizeList<Student>(data);
    },
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Student, "id">) => apiFetch<Student>("/students", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Student> & { id: Id }) =>
      apiFetch<Student>(`/students/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: Id) => apiFetch<{ ok: true } | void>(`/students/${encodeURIComponent(id)}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useCourses(search?: string) {
  return useQuery({
    queryKey: ["courses", { search: search ?? "" }],
    queryFn: async () => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await apiFetch<ListResponse<Course> | Course[]>(`/courses${qs}`);
      return normalizeList<Course>(data);
    },
  });
}

export function useFeaturedCourses() {
  return useQuery({
    queryKey: ["courses", "featured"],
    queryFn: async () => {
      // Convention: backend supports ?featured=true, but response can be array or {items}
      const data = await apiFetch<ListResponse<Course> | Course[]>(`/courses?featured=true`);
      return normalizeList<Course>(data);
    },
  });
}

export function useOpenGroups(params: { search?: string; courseId?: string } = {}) {
  return useQuery({
    queryKey: ["groups", "open", params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.set("status", "open");
      if (params.search) qs.set("search", params.search);
      if (params.courseId) qs.set("courseId", params.courseId);
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      const data = await apiFetch<ListResponse<Group> | Group[]>(`/groups${suffix}`);
      return normalizeList<Group>(data);
    },
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Course, "id">) => apiFetch<Course>("/courses", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: Id) => apiFetch<{ ok: true } | void>(`/courses/${encodeURIComponent(id)}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useReportSummary() {
  return useQuery({
    queryKey: ["reports", "summary"],
    queryFn: async () => apiFetch<ReportSummary>("/reports/summary"),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => apiFetch<Settings>("/settings"),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Settings>) =>
      apiFetch<Settings>("/settings", { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}

