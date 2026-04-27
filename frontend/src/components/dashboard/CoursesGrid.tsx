import { CourseCard } from "./CourseCard";
import { useFeaturedCourses } from "@/api/resources";

const palette = ["blue", "yellow", "red", "purple", "green", "orange", "teal"] as const;
type PaletteColor = (typeof palette)[number];

export function CoursesGrid({
  selectedCourseId,
  onSelectCourseId,
}: {
  selectedCourseId?: string;
  onSelectCourseId?: (id?: string) => void;
}) {
  const q = useFeaturedCourses();

  return (
    <section aria-labelledby="vitrin-title">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 id="vitrin-title" className="font-display text-2xl font-bold text-foreground">Vitrin</h1>
          <p className="text-sm text-muted-foreground mt-1">Açıq qrupların kateqoriyaları</p>
        </div>
        {selectedCourseId && (
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => onSelectCourseId?.(undefined)}
          >
            Filtri sıfırla
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {q.isLoading && (
          <div className="col-span-full text-sm text-muted-foreground">Yüklənir...</div>
        )}
        {q.isError && (
          <div className="col-span-full text-sm text-destructive">
            Data alınmadı: {(q.error as any)?.message ?? "Xəta"}
          </div>
        )}
        {q.data?.items?.map((c, idx) => {
          const color = palette[idx % palette.length] as PaletteColor;
          const isSelected = selectedCourseId === c.id;
          return (
            <CourseCard
              key={c.id}
              title={c.name}
              color={color}
              selected={isSelected}
              onClick={() => onSelectCourseId?.(isSelected ? undefined : c.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
