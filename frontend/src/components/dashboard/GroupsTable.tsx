import { cn } from "@/lib/utils";
import { useOpenGroups } from "@/api/resources";

function CapacityBadge({ students, capacity }: { students: number; capacity: number }) {
  const ratio = students / capacity;
  const tone =
    ratio >= 1 ? "bg-course-red/10 text-course-red"
    : ratio >= 0.8 ? "bg-course-orange/10 text-course-orange"
    : "bg-course-green/10 text-course-green";
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold", tone)}>
      {students}/{capacity}
    </span>
  );
}

function StatusBadge({ status }: { status: Group["status"] }) {
  const map = {
    Aktiv: "bg-course-green/10 text-course-green",
    Gözləmədə: "bg-course-yellow/15 text-course-orange",
    Bitib: "bg-muted text-muted-foreground",
  } as const;
  const cls = (map as Record<string, string>)[status] ?? "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cls)}>
      {status}
    </span>
  );
}

type Group = {
  id: string;
  name: string;
  courseName?: string | null;
  teacherName?: string | null;
  studentsCount: number;
  capacity: number;
  status: "Aktiv" | "Gözləmədə" | "Bitib" | string;
};

export function GroupsTable({
  search,
  courseId,
}: {
  search?: string;
  courseId?: string;
}) {
  const q = useOpenGroups({ search, courseId });

  return (
    <section className="mt-10" aria-labelledby="groups-title">
      <div className="mb-5">
        <h2 id="groups-title" className="font-display text-xl font-bold text-foreground">
          Açıq Qruplar
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Hazırda dərs keçən qrupların siyahısı</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Qrup</th>
                <th className="px-4 py-3 text-left font-semibold">Kurs</th>
                <th className="px-4 py-3 text-left font-semibold">Müəllim</th>
                <th className="px-4 py-3 text-left font-semibold">Tutum</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {q.isLoading && (
                <tr>
                  <td className="px-4 py-4 text-muted-foreground" colSpan={5}>
                    Yüklənir...
                  </td>
                </tr>
              )}
              {q.isError && (
                <tr>
                  <td className="px-4 py-4 text-destructive" colSpan={5}>
                    Data alınmadı: {(q.error as any)?.message ?? "Xəta"}
                  </td>
                </tr>
              )}
              {!q.isLoading && !q.isError && (q.data?.items?.length ?? 0) === 0 && (
                <tr>
                  <td className="px-4 py-4 text-muted-foreground" colSpan={5}>
                    Nəticə tapılmadı.
                  </td>
                </tr>
              )}
              {(q.data?.items as unknown as Group[] | undefined)?.map((g) => (
                <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{g.name}</div>
                    <div className="text-xs text-muted-foreground">{g.id}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{g.courseName ?? "-"}</td>
                  <td className="px-4 py-3 text-foreground">{g.teacherName ?? "-"}</td>
                  <td className="px-4 py-3">
                    <CapacityBadge students={g.studentsCount} capacity={g.capacity} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={g.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
