  import * as React from "react";
  import { CalendarDays, Plus, Search } from "lucide-react";
  import { AppSidebar } from "@/components/dashboard/AppSidebar";
  import { TopBar } from "@/components/dashboard/TopBar";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { SidebarProvider } from "@/components/ui/sidebar";
  import { toast } from "@/hooks/use-toast";
  import {
    useCourses,
    useCreateCourse,
    useCreateStudent,
    useDeleteCourse,
    useDeleteStudent,
    useReportSummary,
    useSettings,
    useStudents,
    useUpdateSettings,
    useUsers,
  } from "@/api/resources";

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

  export function UsersPage() {
    const users = useUsers();

    return (
      <PageShell>
        <section className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h1 className="mb-4 font-display text-2xl font-bold">İstifadəçilər</h1>

          {users.isLoading && (
            <p className="text-sm text-muted-foreground">Yüklənir...</p>
          )}

          {users.isError && (
            <p className="text-sm text-destructive">
              İstifadəçilər alınmadı: {(users.error as any)?.message ?? "Xəta"}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.data?.map((user) => {
              const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

              return (
                <article
                  key={user._id}
                  className="rounded-xl border border-border bg-background p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {initials || "U"}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate font-display text-lg font-bold">
                        {user.firstName} {user.lastName}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {user.role ?? "user"}
                      </p>
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
                      <dd className="rounded-full bg-course-green/10 px-2 py-0.5 text-xs font-semibold text-course-green">
                        Aktiv
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

  export function CrmPage() {
    const columns = [
      { title: "Leads", items: ["Nuran Hüseynli", "Oqtay Məmmədzadə", "Fərid İsmayılzadə"] },
      { title: "Call-followup", items: ["Sona Əhmədova", "Məhbubə Bədirova", "Kənan Ramazanzadə"] },
      { title: "Interview-followup", items: ["Telli Kərimli", "Günel Seyidova", "Ləman Kərimova"] },
    ];

    return (
      <PageShell>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Axtar..." />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((column) => (
            <section key={column.title} className="rounded-xl border border-border bg-card p-3 shadow-card">
              <h2 className="mb-3 text-center text-sm font-semibold text-foreground">{column.title}</h2>
              <div className="space-y-2">
                {column.items.map((item) => (
                  <article key={item} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-sm font-medium">{item}</p>
                    <p className="text-xs text-muted-foreground">proqramçı</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </PageShell>
    );
  }

  export function RoomsPage() {
    const rows = [
      ["MS15", "01 avqust 2026", "14 noyabr 2026", "Sirius", "1"],
      ["CS306", "06 iyul 2026", "06 noyabr 2026", "Venus", "3"],
      ["CS314", "22 iyun 2026", "09 dekabr 2026", "Sun", "3"],
      ["PA203", "16 iyun 2026", "20 oktyabr 2026", "Jupiter", "0"],
    ];

    return (
      <PageShell>
        <section className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-6 text-sm">
              <button className="border-b-2 border-primary pb-1 font-semibold text-primary">Qruplar</button>
              <button className="pb-1 text-muted-foreground">Otaqlar</button>
              <button className="pb-1 text-muted-foreground">Sessiyalar</button>
            </div>
            <Button size="icon"><Plus /></Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Ad</th>
                  <th className="px-3 py-2 text-left">Başlama tarixi</th>
                  <th className="px-3 py-2 text-left">Bitmə tarixi</th>
                  <th className="px-3 py-2 text-left">Otaq</th>
                  <th className="px-3 py-2 text-left">Tələbə sayı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row[0]}>
                    <td className="px-3 py-2">{row[0]}</td>
                    <td className="px-3 py-2">{row[1]}</td>
                    <td className="px-3 py-2">{row[2]}</td>
                    <td className="px-3 py-2">{row[3]}</td>
                    <td className="px-3 py-2">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </PageShell>
    );
  }

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
                <Button variant="outline" size="sm">Qrupu bitir</Button>
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
              onClick={async () => {
                try {
                  if (!firstName.trim() || !lastName.trim()) {
                    toast({ title: "Xəta", description: "Ad və soyad doldurulmalıdır.", variant: "destructive" });
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
                } catch (e: any) {
                  toast({ title: "Xəta", description: e?.message ?? "Əlavə etmək alınmadı.", variant: "destructive" });
                }
              }}
              disabled={create.isPending}
            >
              Yeni tələbə
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ad / soyad axtar..." />
            <Input value={subgroup} onChange={(e) => setSubgroup(e.target.value)} placeholder="Alt qrup" />
            <Input value={lessonFormat} onChange={(e) => setLessonFormat(e.target.value)} placeholder="Dərs formatı (Campus/Online)" />
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
                      Data alınmadı: {(list.error as any)?.message ?? "Xəta"}
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
                        onClick={async () => {
                          try {
                            await del.mutateAsync(s.id);
                            toast({ title: "Silindi", description: "Tələbə silindi." });
                          } catch (e: any) {
                            toast({ title: "Xəta", description: e?.message ?? "Silmək alınmadı.", variant: "destructive" });
                          }
                        }}
                        disabled={del.isPending}
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

  export function CoursesPage() {
    const [search, setSearch] = React.useState("");
    const [name, setName] = React.useState("");
    const [durationWeeks, setDurationWeeks] = React.useState("");
    const [status, setStatus] = React.useState("Aktiv");

    const list = useCourses(search);
    const create = useCreateCourse();
    const del = useDeleteCourse();

    return (
      <PageShell>
        <section className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold">Kurslar</h1>
            <Button
              size="sm"
              onClick={async () => {
                try {
                  if (!name.trim()) {
                    toast({ title: "Xəta", description: "Kurs adı boş ola bilməz.", variant: "destructive" });
                    return;
                  }
                  const weeks = durationWeeks.trim() ? Number(durationWeeks) : null;
                  await create.mutateAsync({
                    name: name.trim(),
                    durationWeeks: Number.isFinite(weeks as any) ? (weeks as number) : null,
                    status,
                  } as any);
                  setName("");
                  setDurationWeeks("");
                  toast({ title: "Uğurlu", description: "Kurs əlavə edildi." });
                } catch (e: any) {
                  toast({ title: "Xəta", description: e?.message ?? "Əlavə etmək alınmadı.", variant: "destructive" });
                }
              }}
              disabled={create.isPending}
            >
              Yeni kurs
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Axtar..." />
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kurs adı" />
            <Input value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} placeholder="Müddət (həftə)" />
            <Input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Status (Aktiv/Planlandı)" />
          </div>

          <div className="mt-4 space-y-3">
            {list.isLoading && <p className="text-sm text-muted-foreground">Yüklənir...</p>}
            {list.isError && (
              <p className="text-sm text-destructive">Data alınmadı: {(list.error as any)?.message ?? "Xəta"}</p>
            )}
            {list.data?.items?.map((course) => (
              <article key={course.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{course.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.durationWeeks ? `${course.durationWeeks} həftə` : "Müddət yoxdur"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    {course.status ?? "-"}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      try {
                        await del.mutateAsync(course.id);
                        toast({ title: "Silindi", description: "Kurs silindi." });
                      } catch (e: any) {
                        toast({ title: "Xəta", description: e?.message ?? "Silmək alınmadı.", variant: "destructive" });
                      }
                    }}
                    disabled={del.isPending}
                  >
                    Sil
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </PageShell>
    );
  }

  export function ReportsPage() {
    const summary = useReportSummary();

    return (
      <PageShell>
        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Aktiv qruplar</p>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">
              {summary.data ? summary.data.activeGroups : summary.isLoading ? "..." : "-"}
            </p>
          </section>
          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Davamiyyət</p>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">
              {summary.data ? `${Math.round(summary.data.attendanceRate * 100)}%` : summary.isLoading ? "..." : "-"}
            </p>
          </section>
          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Aylıq gəlir</p>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">
              {summary.data
                ? `${summary.data.monthlyRevenue.toLocaleString()} ${summary.data.currency ?? "AZN"}`
                : summary.isLoading
                  ? "..."
                  : "-"}
            </p>
          </section>
        </div>
        {summary.isError && (
          <p className="mt-4 text-sm text-destructive">
            Hesabat alınmadı: {(summary.error as any)?.message ?? "Xəta"}
          </p>
        )}
      </PageShell>
    );
  }

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
          <p className="mt-2 text-sm text-muted-foreground">Sistem parametrlərini buradan idarə edə bilərsiniz.</p>
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
              className="md:col-span-2 justify-self-start"
              onClick={async () => {
                try {
                  await save.mutateAsync({ companyName, supportEmail });
                  toast({ title: "Uğurlu", description: "Ayarlar yadda saxlanıldı." });
                } catch (e: any) {
                  toast({ title: "Xəta", description: e?.message ?? "Yadda saxlamaq alınmadı.", variant: "destructive" });
                }
              }}
              disabled={q.isLoading || save.isPending}
            >
              Yadda saxla
            </Button>
          </div>
          {q.isError && (
            <p className="mt-4 text-sm text-destructive">
              Ayarlar alınmadı: {(q.error as any)?.message ?? "Xəta"}
            </p>
          )}
        </section>
      </PageShell>
    );
  }
