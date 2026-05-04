import * as React from "react";
import { CalendarDays, Plus, Search } from "lucide-react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "@/hooks/use-toast";
import { Modal } from "@/components/Modal";
import {
  useBulkMarkAttendance,
  useCourses,
  useCreateCourse,
  useCreateLead,
  useCreateStudent,
  useDashboardStats,
  useDeleteCourse,
  useDeleteStudent,
  useGroupStudents,
  useGroups,
  useLeads,
  useOverduePayments,
  useSettings,
  useStudents,
  useUpdateLeadStatus,
  useUpdatePaymentStatus,
  useUpdateSettings,
  useUsers,
  useCategories,
} from "@/api/resources";

type LeadStatus = "New" | "Contacted" | "Interested" | "Trial" | "Enrolled" | "Lost";
type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// ---- USERS ----

export function UsersPage() {
  const users = useUsers();

  return (
    <PageShell>
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h1 className="mb-4 font-display text-2xl font-bold">İstifadəçilər</h1>
        {users.isLoading && <p className="text-sm text-muted-foreground">Yüklənir...</p>}
        {users.isError && (
          <p className="text-sm text-destructive">
            İstifadəçilər alınmadı: {(users.error as Error)?.message ?? "Xəta"}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.data?.map((user) => {
            const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

            return (
              <article key={user._id} className="rounded-xl border border-border bg-background p-4 shadow-sm">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {initials || "U"}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-bold">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-xs text-muted-foreground">{user.role ?? "user"}</p>
                  </div>
                </div>

                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="truncate font-medium">{user.email}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Telefon</dt>
                    <dd className="font-medium">{user.phone || "-"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        user.isActive === false
                          ? "bg-destructive/10 text-destructive"
                          : "bg-green-500/10 text-green-600"
                      }`}
                    >
                      {user.isActive === false ? "Deaktiv" : "Aktiv"}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}

// ---- CRM ----

const LEAD_STATUSES: { key: LeadStatus; label: string }[] = [
  { key: "New", label: "Yeni" },
  { key: "Contacted", label: "Əlaqə" },
  { key: "Interested", label: "Maraqlı" },
  { key: "Trial", label: "Sınaq" },
  { key: "Enrolled", label: "Qeydiyyat" },
  { key: "Lost", label: "İtirildi" },
];

const NEXT_STATUS: Record<LeadStatus, LeadStatus> = {
  New: "Contacted",
  Contacted: "Interested",
  Interested: "Trial",
  Trial: "Enrolled",
  Enrolled: "Enrolled",
  Lost: "New",
};

export function CrmPage() {
  const [search, setSearch] = React.useState("");
  const [showCreate, setShowCreate] = React.useState(false);
  const [newFirst, setNewFirst] = React.useState("");
  const [newLast, setNewLast] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newSource, setNewSource] = React.useState("Phone");
  const [newCourseId, setNewCourseId] = React.useState("");
  const [newAssignedId, setNewAssignedId] = React.useState("");
  const [newUtmSource, setNewUtmSource] = React.useState("");

  const leadsQ = useLeads();
  const coursesQ = useCourses();
  const usersQ = useUsers();
  const createLead = useCreateLead();
  const updateStatus = useUpdateLeadStatus();

  const leads = leadsQ.data?.items ?? [];

  const filtered = search
    ? leads.filter((l) =>
        `${l.firstName} ${l.lastName}`.toLowerCase().includes(search.toLowerCase())
      )
    : leads;

  const byStatus = LEAD_STATUSES.reduce<Record<string, typeof filtered>>((acc, s) => {
    acc[s.key] = filtered.filter((l) => l.status === s.key);
    return acc;
  }, {});

  return (
    <PageShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
          <Plus className="mr-1 h-4 w-4" /> Yeni lead
        </Button>
      </div>

      {showCreate && (
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Yeni Lead Əlavə et">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Ad" value={newFirst} onChange={(e) => setNewFirst(e.target.value)} />
            <Input placeholder="Soyad" value={newLast} onChange={(e) => setNewLast(e.target.value)} />
            <Input placeholder="Telefon" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            <Input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />

            <select
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
            >
              <option value="Website">Website</option>
              <option value="Phone">Telefon</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Referral</option>
              <option value="Walk-in">Walk-in</option>
            </select>

            <select
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={newCourseId}
              onChange={(e) => setNewCourseId(e.target.value)}
            >
              <option value="">Kurs seçin</option>
              {(coursesQ.data?.items ?? []).map((course) => (
                <option key={course.id ?? course._id} value={course.id ?? course._id}>
                  {course.name}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={newAssignedId}
              onChange={(e) => setNewAssignedId(e.target.value)}
            >
              <option value="">Təyin edin</option>
              {usersQ.data?.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>

            <Input
              placeholder="UTM Source"
              value={newUtmSource}
              onChange={(e) => setNewUtmSource(e.target.value)}
            />

            <div className="flex gap-2 sm:col-span-2">
              <Button
                size="sm"
                disabled={createLead.isPending}
                onClick={async () => {
                  try {
                    if (!newFirst.trim() || !newLast.trim() || !newPhone.trim()) {
                      toast({
                        title: "Xəta",
                        description: "Ad, soyad və telefon tələb olunur.",
                        variant: "destructive",
                      });
                      return;
                    }

                    await createLead.mutateAsync({
                      firstName: newFirst.trim(),
                      lastName: newLast.trim(),
                      phone: newPhone.trim(),
                      email: newEmail.trim() || undefined,
                      source: newSource,
                      status: "New",
                      courseInterest: newCourseId || null,
                      assignedTo: newAssignedId || null,
                      utmSource: newUtmSource.trim() || null,
                    });

                    setNewFirst("");
                    setNewLast("");
                    setNewPhone("");
                    setNewEmail("");
                    setNewSource("Phone");
                    setNewCourseId("");
                    setNewAssignedId("");
                    setNewUtmSource("");
                    setShowCreate(false);

                    toast({ title: "Uğurlu", description: "Lead əlavə edildi." });
                  } catch (e: unknown) {
                    toast({
                      title: "Xəta",
                      description: (e as Error)?.message ?? "Xəta baş verdi.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Əlavə et
              </Button>

              <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>
                Ləğv et
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {leadsQ.isLoading && <p className="text-sm text-muted-foreground">Yüklənir...</p>}
      {leadsQ.isError && (
        <p className="text-sm text-destructive">
          Data alınmadı: {(leadsQ.error as Error)?.message}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {LEAD_STATUSES.map((s) => (
          <section key={s.key} className="rounded-xl border border-border bg-card p-3 shadow-card">
            <h2 className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>{s.label}</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-primary">
                {byStatus[s.key]?.length ?? 0}
              </span>
            </h2>

            <div className="space-y-2">
              {byStatus[s.key]?.map((lead) => (
                <article key={lead.id} className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm font-medium">
                    {lead.firstName} {lead.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{lead.phone}</p>

                  {s.key !== "Enrolled" && s.key !== "Lost" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 px-2 text-xs text-primary"
                      disabled={updateStatus.isPending}
                      onClick={async () => {
                        try {
                          await updateStatus.mutateAsync({
                            id: lead.id!,
                            status: NEXT_STATUS[s.key],
                          });
                          toast({ title: "Status dəyişdi." });
                        } catch (e: unknown) {
                          toast({
                            title: "Xəta",
                            description: (e as Error)?.message,
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      → {LEAD_STATUSES.find((x) => x.key === NEXT_STATUS[s.key])?.label}
                    </Button>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

// ---- GROUPS ----

export function RoomsPage() {
  const groups = useGroups();

  return (
    <PageShell>
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h1 className="mb-4 font-display text-2xl font-bold">Qruplar</h1>

        {groups.isLoading && <p className="text-sm text-muted-foreground">Yüklənir...</p>}
        {groups.isError && (
          <p className="text-sm text-destructive">
            Data alınmadı: {(groups.error as Error)?.message}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Kod</th>
                <th className="px-3 py-2 text-left">Kurs</th>
                <th className="px-3 py-2 text-left">Müəllim</th>
                <th className="px-3 py-2 text-left">Başlama</th>
                <th className="px-3 py-2 text-left">Bitim</th>
                <th className="px-3 py-2 text-left">Otaq</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {groups.data?.items?.map((g) => (
                <tr key={g.id}>
                  <td className="px-3 py-2 font-medium">{g.code}</td>
                  <td className="px-3 py-2">
                    {typeof g.courseId === "object" ? g.courseId?.name : "-"}
                  </td>
                  <td className="px-3 py-2">
                    {typeof g.teacherId === "object"
                      ? `${g.teacherId?.firstName ?? ""} ${g.teacherId?.lastName ?? ""}`.trim() || "-"
                      : "-"}
                  </td>
                  <td className="px-3 py-2">
                    {g.startDate ? new Date(g.startDate).toLocaleDateString("az-AZ") : "-"}
                  </td>
                  <td className="px-3 py-2">
                    {g.endDate ? new Date(g.endDate).toLocaleDateString("az-AZ") : "-"}
                  </td>
                  <td className="px-3 py-2">{g.room ?? "-"}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {g.status ?? "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}

// ---- CLASSES ----

export function ClassesPage() {
  const students = ["Nigar", "Emil", "Tural", "Teymur", "Aysan", "Davud"];

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-4 font-display text-lg font-bold">Siniflər</h2>
          <div className="space-y-3">
            <Input placeholder="Tədris proqramı" />
            <Input placeholder="Otaq" />
            <Input placeholder="Qrup müəllimi" />
            <Input placeholder="Başlama tarixi" />
            <Input placeholder="Bitmə tarixi" />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Tələbələr</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Qrupu bitir
              </Button>
              <Button size="sm">Şagirdlər</Button>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Ad</th>
                <th className="px-3 py-2 text-left">Soyad</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {students.map((name) => (
                <tr key={name}>
                  <td className="px-3 py-2">{name}</td>
                  <td className="px-3 py-2">Məmmədov</td>
                  <td className="px-3 py-2">Campus</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </PageShell>
  );
}

// ---- SCHEDULE ----

export function SchedulePage() {
  const days = ["13 B.e", "14 Ç.a", "15 Ç", "16 C.a", "17 C", "18 Ş", "19 B."];

  return (
    <PageShell>
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Sinif Agendası</h1>
          <Button size="sm">Yeni qrup</Button>
        </div>

        <div className="mb-5 flex items-center justify-center gap-3 text-sm font-semibold">
          <button className="rounded-full border border-border p-1">◀</button>
          <div className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            13 Aprel - 19 Aprel, 2026
          </div>
          <button className="rounded-full border border-border p-1">▶</button>
        </div>

        <div className="grid gap-3 md:grid-cols-7">
          {days.map((day) => (
            <article key={day} className="min-h-40 rounded-lg border border-border p-3">
              <h3 className="text-xs font-semibold text-muted-foreground">{day}</h3>
              {day.startsWith("16") && (
                <div className="mt-3 rounded-md bg-primary/10 p-2 text-xs text-primary">
                  12:30 - Java
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

// ---- STUDENTS ----

export function StudentsPage() {
  const [search, setSearch] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [subgroup, setSubgroup] = React.useState("");
  const [lessonFormat, setLessonFormat] = React.useState("");

  const list = useStudents(search);
  const create = useCreateStudent();
  const del = useDeleteStudent();

  return (
    <PageShell>
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Tələbələr</h1>

          <Button
            size="sm"
            disabled={create.isPending}
            onClick={async () => {
              try {
                if (!firstName.trim() || !lastName.trim()) {
                  toast({
                    title: "Xəta",
                    description: "Ad və soyad doldurulmalıdır.",
                    variant: "destructive",
                  });
                  return;
                }

                await create.mutateAsync({
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  subgroup: subgroup.trim() || null,
                  lessonFormat: lessonFormat.trim() || null,
                });

                setFirstName("");
                setLastName("");
                setSubgroup("");
                setLessonFormat("");

                toast({ title: "Uğurlu", description: "Tələbə əlavə edildi." });
              } catch (e: unknown) {
                toast({
                  title: "Xəta",
                  description: (e as Error)?.message ?? "Əlavə etmək alınmadı.",
                  variant: "destructive",
                });
              }
            }}
          >
            Yeni tələbə
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad / soyad axtar..."
          />
          <Input value={subgroup} onChange={(e) => setSubgroup(e.target.value)} placeholder="Alt qrup" />
          <Input
            value={lessonFormat}
            onChange={(e) => setLessonFormat(e.target.value)}
            placeholder="Dərs formatı (Campus/Online)"
          />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ad" />
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Soyad" />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Ad</th>
                <th className="px-3 py-2 text-left">Soyad</th>
                <th className="px-3 py-2 text-left">Alt qrup</th>
                <th className="px-3 py-2 text-left">Dərs formatı</th>
                <th className="px-3 py-2 text-right">Əməliyyat</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {list.isLoading && (
                <tr>
                  <td className="px-3 py-3 text-muted-foreground" colSpan={5}>
                    Yüklənir...
                  </td>
                </tr>
              )}

              {list.isError && (
                <tr>
                  <td className="px-3 py-3 text-destructive" colSpan={5}>
                    Data alınmadı: {(list.error as Error)?.message ?? "Xəta"}
                  </td>
                </tr>
              )}

              {list.data?.items?.map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-2">{s.firstName}</td>
                  <td className="px-3 py-2">{s.lastName}</td>
                  <td className="px-3 py-2">{s.subgroup ?? "-"}</td>
                  <td className="px-3 py-2">{s.lessonFormat ?? "-"}</td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={del.isPending}
                      onClick={async () => {
                        try {
                          await del.mutateAsync(s.id!);
                          toast({ title: "Silindi", description: "Tələbə silindi." });
                        } catch (e: unknown) {
                          toast({
                            title: "Xəta",
                            description: (e as Error)?.message ?? "Silmək alınmadı.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Sil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}

// ---- COURSES ----

export function CoursesPage() {
  const [search, setSearch] = React.useState("");
  const [showCreate, setShowCreate] = React.useState(false);
  const [name, setName] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const list = useCourses(search);
  const categories = useCategories();
  const create = useCreateCourse();
  const del = useDeleteCourse();

  return (
    <PageShell>
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Kurslar</h1>

          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Yeni kurs
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Axtar..." />
        </div>

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Yeni Kurs Əlavə et">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kurs adı *" />
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Müddət (ay) *"
              type="number"
            />
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Qiymət (AZN) *"
              type="number"
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Təsvir (istəyə görə)"
            />

            <select
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Kateqoriya seçin</option>
              {(categories.data ?? []).map((cat) => (
                <option key={cat.id ?? cat._id} value={cat.id ?? cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="flex items-center rounded-lg border border-input bg-background px-3 py-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border border-input"
              />
              <label htmlFor="isActive" className="ml-2 cursor-pointer text-sm">
                Aktiv
              </label>
            </div>

            <div className="flex gap-2 sm:col-span-2">
              <Button
                size="sm"
                disabled={create.isPending}
                onClick={async () => {
                  try {
                    if (!name.trim()) {
                      toast({
                        title: "Xəta",
                        description: "Kurs adı boş ola bilməz.",
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!duration) {
                      toast({
                        title: "Xəta",
                        description: "Müddət tələb olunur.",
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!price) {
                      toast({
                        title: "Xəta",
                        description: "Qiymət tələb olunur.",
                        variant: "destructive",
                      });
                      return;
                    }

                    await create.mutateAsync({
                      name: name.trim(),
                      description: description.trim() || undefined,
                      duration: Number(duration),
                      price: Number(price),
                      isActive,
                      categoryId: categoryId || undefined,
                    });

                    setName("");
                    setDuration("");
                    setPrice("");
                    setDescription("");
                    setCategoryId("");
                    setIsActive(true);
                    setShowCreate(false);

                    toast({ title: "Uğurlu", description: "Kurs əlavə edildi." });
                  } catch (e: unknown) {
                    toast({
                      title: "Xəta",
                      description: (e as Error)?.message ?? "Əlavə etmək alınmadı.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Əlavə et
              </Button>

              <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>
                Ləğv et
              </Button>
            </div>
          </div>
        </Modal>

        <div className="mt-4 space-y-3">
          {list.isLoading && <p className="text-sm text-muted-foreground">Yüklənir...</p>}
          {list.isError && (
            <p className="text-sm text-destructive">
              Data alınmadı: {(list.error as Error)?.message ?? "Xəta"}
            </p>
          )}

          {list.data?.items?.map((course) => (
            <article
              key={course.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{course.name}</p>
                <p className="text-xs text-muted-foreground">
                  {course.duration ? `${course.duration} ay` : "Müddət yoxdur"}
                  {course.price ? ` · ${course.price} AZN` : ""}
                </p>
                {course.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{course.description}</p>
                )}
              </div>

              <Button
                variant="destructive"
                size="sm"
                disabled={del.isPending}
                onClick={async () => {
                  try {
                    await del.mutateAsync(course.id!);
                    toast({ title: "Deaktiv edildi", description: "Kurs deaktiv edildi." });
                  } catch (e: unknown) {
                    toast({
                      title: "Xəta",
                      description: (e as Error)?.message ?? "Xəta baş verdi.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Sil
              </Button>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}


// ---- CATEGORIES ----

export function CategoriesPage() {
  const categories = useCategories();

  const items = (categories.data ?? []) as Array<{
    id?: string;
    _id?: string;
    name?: string;
    description?: string;
    isActive?: boolean;
  }>;

  return (
    <PageShell>
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Kateqoriyalar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kurs kateqoriyalarının siyahısı
            </p>
          </div>
        </div>

        {categories.isLoading && (
          <p className="text-sm text-muted-foreground">Yüklənir...</p>
        )}

        {categories.isError && (
          <p className="text-sm text-destructive">
            Kateqoriyalar alınmadı: {(categories.error as Error)?.message ?? "Xəta"}
          </p>
        )}

        {!categories.isLoading && !categories.isError && items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Hələ kateqoriya yoxdur.
          </p>
        )}

        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Ad</th>
                  <th className="px-3 py-2 text-left">Təsvir</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {items.map((category) => (
                  <tr key={category.id ?? category._id ?? category.name}>
                    <td className="px-3 py-2 font-medium">
                      {category.name ?? "-"}
                    </td>

                    <td className="px-3 py-2 text-muted-foreground">
                      {category.description ?? "-"}
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          category.isActive === false
                            ? "bg-destructive/10 text-destructive"
                            : "bg-green-500/10 text-green-600"
                        }`}
                      >
                        {category.isActive === false ? "Deaktiv" : "Aktiv"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}

// ---- REPORTS ----

function StatCard({
  label,
  value,
  isLoading,
}: {
  label: string;
  value?: string | number;
  isLoading?: boolean;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-foreground">
        {isLoading ? "..." : value ?? "-"}
      </p>
    </section>
  );
}

export function ReportsPage() {
  const stats = useDashboardStats();

  return (
    <PageShell>
      {stats.isError && (
        <p className="mb-4 text-sm text-destructive">
          Hesabat alınmadı: {(stats.error as Error)?.message ?? "Xəta"}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Yeni leadlar (bu ay)" value={stats.data?.newLeadsThisMonth} isLoading={stats.isLoading} />
        <StatCard label="Aktiv tələbələr" value={stats.data?.activeStudents} isLoading={stats.isLoading} />
        <StatCard
          label="Toplanan ödənişlər (AZN)"
          value={stats.data ? stats.data.collectedPaymentsThisMonth.toFixed(2) : undefined}
          isLoading={stats.isLoading}
        />
        <StatCard
          label="Gecikmiş ödəniş (AZN)"
          value={stats.data ? stats.data.overdueAmount.toFixed(2) : undefined}
          isLoading={stats.isLoading}
        />
      </div>

      {stats.data?.courseDistribution && stats.data.courseDistribution.length > 0 && (
        <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-4 font-display text-lg font-bold">Kurs üzrə tələbə statistikası</h2>

          <div className="space-y-3">
            {stats.data.courseDistribution.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-32 truncate text-sm">{c.name}</span>
                <div className="h-3 flex-1 rounded-full bg-muted">
                  <div
                    className="h-3 rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min((c.value / (stats.data!.activeStudents || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-sm font-medium">{c.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}

// ---- SETTINGS ----

export function SettingsPage() {
  const q = useSettings();
  const save = useUpdateSettings();
  const [companyName, setCompanyName] = React.useState("");
  const [supportEmail, setSupportEmail] = React.useState("");

  React.useEffect(() => {
    if (q.data) {
      setCompanyName(q.data.companyName ?? "");
      setSupportEmail(q.data.supportEmail ?? "");
    }
  }, [q.data]);

  return (
    <PageShell>
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h1 className="font-display text-2xl font-bold">Ayarlar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sistem parametrlərini buradan idarə edə bilərsiniz.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Şirkət adı"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={q.isLoading || save.isPending}
          />
          <Input
            placeholder="Dəstək e-poçtu"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            disabled={q.isLoading || save.isPending}
          />

          <Button
            className="justify-self-start md:col-span-2"
            disabled={q.isLoading || save.isPending}
            onClick={async () => {
              try {
                await save.mutateAsync({ companyName, supportEmail });
                toast({ title: "Uğurlu", description: "Ayarlar yadda saxlanıldı." });
              } catch (e: unknown) {
                toast({
                  title: "Xəta",
                  description: (e as Error)?.message ?? "Yadda saxlamaq alınmadı.",
                  variant: "destructive",
                });
              }
            }}
          >
            Yadda saxla
          </Button>
        </div>

        {q.isError && (
          <p className="mt-4 text-sm text-destructive">
            Ayarlar alınmadı: {(q.error as Error)?.message ?? "Xəta"}
          </p>
        )}
      </section>
    </PageShell>
  );
}

// ---- ATTENDANCE ----

const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "Present", label: "İştirak etdi" },
  { value: "Absent", label: "Gəlmədi" },
  { value: "Late", label: "Gecikdi" },
  { value: "Excused", label: "Üzrlü" },
];

export function AttendancePage() {
  const [selectedGroupId, setSelectedGroupId] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = React.useState<Record<string, AttendanceStatus>>({});

  const groups = useGroups();
  const enrollments = useGroupStudents(selectedGroupId || undefined);
  const bulkMark = useBulkMarkAttendance();

  React.useEffect(() => {
    if (enrollments.data) {
      const init: Record<string, AttendanceStatus> = {};
      enrollments.data.forEach((e) => {
        init[e._id!] = "Present";
      });
      setStatuses(init);
    }
  }, [enrollments.data]);

  const handleSave = async () => {
    if (!selectedGroupId || !enrollments.data?.length) return;

    const records = enrollments.data.map((e) => ({
      enrollmentId: e._id!,
      status: statuses[e._id!] ?? "Present",
    }));

    try {
      await bulkMark.mutateAsync({ groupId: selectedGroupId, date, records });
      toast({ title: "Uğurlu", description: "Davamiyyət qeydə alındı." });
    } catch (e: unknown) {
      toast({
        title: "Xəta",
        description: (e as Error)?.message,
        variant: "destructive",
      });
    }
  };

  return (
    <PageShell>
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Davamiyyət</h1>
          <Button
            onClick={handleSave}
            disabled={bulkMark.isPending || !selectedGroupId || !enrollments.data?.length}
          >
            {bulkMark.isPending ? "Saxlanır..." : "Yadda saxla"}
          </Button>
        </div>

        <div className="mb-5 flex flex-wrap gap-3">
          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
          >
            <option value="">Qrup seçin...</option>
            {groups.data?.items?.map((g) => (
              <option key={g.id} value={g.id}>
                {g.code}
                {typeof g.courseId === "object" && g.courseId?.name ? ` — ${g.courseId.name}` : ""}
              </option>
            ))}
          </select>

          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
        </div>

        {enrollments.isLoading && <p className="text-sm text-muted-foreground">Tələbələr yüklənir...</p>}

        {selectedGroupId && !enrollments.isLoading && !enrollments.data?.length && (
          <p className="text-sm text-muted-foreground">Bu qrupda tələbə yoxdur.</p>
        )}

        {enrollments.data && enrollments.data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Tələbə</th>
                  <th className="px-3 py-2 text-left">Kod</th>
                  {ATTENDANCE_OPTIONS.map((o) => (
                    <th key={o.value} className="px-3 py-2 text-center">
                      {o.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {enrollments.data.map((e) => (
                  <tr key={e._id}>
                    <td className="px-3 py-2 font-medium">
                      {e.studentId.firstName} {e.studentId.lastName}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {e.studentId.studentCode ?? "-"}
                    </td>

                    {ATTENDANCE_OPTIONS.map((o) => (
                      <td key={o.value} className="px-3 py-2 text-center">
                        <input
                          type="radio"
                          name={`att-${e._id}`}
                          value={o.value}
                          checked={statuses[e._id!] === o.value}
                          onChange={() =>
                            setStatuses((prev) => ({
                              ...prev,
                              [e._id!]: o.value,
                            }))
                          }
                          className="cursor-pointer accent-primary"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}

// ---- PAYMENTS ----

export function PaymentsPage() {
  const overdueQ = useOverduePayments();
  const updateStatus = useUpdatePaymentStatus();

  return (
    <PageShell>
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h1 className="mb-1 font-display text-2xl font-bold">Ödənişlər</h1>
        <h2 className="mb-4 text-base font-semibold text-destructive">Gecikmiş ödənişlər</h2>

        {overdueQ.isLoading && <p className="text-sm text-muted-foreground">Yüklənir...</p>}
        {overdueQ.isError && (
          <p className="text-sm text-destructive">
            Data alınmadı: {(overdueQ.error as Error)?.message}
          </p>
        )}

        {overdueQ.data && overdueQ.data.length === 0 && (
          <p className="text-sm text-muted-foreground">Gecikmiş ödəniş yoxdur.</p>
        )}

        {overdueQ.data && overdueQ.data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Tələbə</th>
                  <th className="px-3 py-2 text-left">Qrup</th>
                  <th className="px-3 py-2 text-left">Məbləğ</th>
                  <th className="px-3 py-2 text-left">Son tarix</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Əməliyyat</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {overdueQ.data.map((p) => {
                  const plan = typeof p.paymentPlanId === "object" ? p.paymentPlanId : null;
                  const student = plan?.enrollmentId?.studentId;
                  const group = plan?.enrollmentId?.groupId;

                  return (
                    <tr key={p._id}>
                      <td className="px-3 py-2">
                        {student ? `${student.firstName} ${student.lastName}` : "-"}
                      </td>
                      <td className="px-3 py-2">{group?.code ?? "-"}</td>
                      <td className="px-3 py-2 font-medium">{p.amount?.toFixed(2) ?? "-"} AZN</td>
                      <td className="px-3 py-2">
                        {p.dueDate ? new Date(p.dueDate).toLocaleDateString("az-AZ") : "-"}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          size="sm"
                          disabled={updateStatus.isPending}
                          onClick={async () => {
                            try {
                              await updateStatus.mutateAsync({
                                id: p._id!,
                                status: "Paid",
                                paidDate: new Date().toISOString(),
                                paymentMethod: "Cash",
                              });
                              toast({ title: "Ödənildi", description: "Ödəniş qeyd edildi." });
                            } catch (e: unknown) {
                              toast({
                                title: "Xəta",
                                description: (e as Error)?.message,
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Ödənildi
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}