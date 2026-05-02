import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./http";

export type Id = string;

export type Student = {
  id: Id;
  _id?: Id;
  firstName: string;
  lastName: string;
  subgroup?: string | null;
  lessonFormat?: string | null;
};

export type Course = {
  id: Id;
  _id?: Id;
  name: string;
  durationWeeks?: number | null;
  status?: "Aktiv" | "Planlandı" | "Passiv" | string;
};

export type Group = {
  id: Id;
  _id?: Id;
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
  attendanceRate: number;
  monthlyRevenue: number;
  currency?: string;
};

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
};

export type Settings = {
  companyName: string;
  supportEmail: string;
};

export type ListResponse<T> = {
  items: T[];
  total?: number;
};

function normalizeList<T extends { id?: string; _id?: string }>(data: any): ListResponse<T> {
  let items: T[] = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (data && Array.isArray(data.items)) {
    items = data.items;
  } else if (data && Array.isArray(data.data)) {
    items = data.data;
  }

  return {
    items: items.map((item: any) => ({
      ...item,
      id: item.id ?? item._id,
    })),
    total: data?.total ?? items.length,
  };
}


export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch<User[]>("/api/users"),
  });
}



export function useStudents(search?: string) {
  return useQuery({
    queryKey: ["students", { search: search ?? "" }],
    queryFn: async () => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await apiFetch<ListResponse<Student> | Student[]>(
        `/api/students${qs}`
      );
      return normalizeList<Student>(data);
    },
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Student, "id" | "_id">) =>
      apiFetch<Student>("/api/students", {
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
      apiFetch<Student>(`/api/students/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: Id) =>
      apiFetch<{ ok: true } | void>(`/api/students/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}


export function useCourses(search?: string) {
  return useQuery({
    queryKey: ["courses", { search: search ?? "" }],
    queryFn: async () => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await apiFetch<ListResponse<Course> | Course[]>(
        `/api/courses${qs}`
      );
      return normalizeList<Course>(data);
    },
  });
}

export function useFeaturedCourses() {
  return useQuery({
    queryKey: ["courses", "featured"],
    queryFn: async () => {
      const data = await apiFetch<ListResponse<Course> | Course[]>(
        "/api/courses?featured=true"
      );
      return normalizeList<Course>(data);
    },
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Course, "id" | "_id">) =>
      apiFetch<Course>("/api/courses", {
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
      apiFetch<{ ok: true } | void>(`/api/courses/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
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
      const data = await apiFetch<ListResponse<Group> | Group[]>(
        `/api/groups${suffix}`
      );

      return normalizeList<Group>(data);
    },
  });
}


export function useReportSummary() {
  return useQuery({
    queryKey: ["reports", "summary"],
    queryFn: async () => apiFetch<ReportSummary>("/api/reports/summary"),
  });
}


export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<Settings> => ({
      companyName: "CRM System",
      supportEmail: "support@example.com",
    }),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Settings>): Promise<Settings> => ({
      companyName: payload.companyName ?? "CRM System",
      supportEmail: payload.supportEmail ?? "support@example.com",
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}