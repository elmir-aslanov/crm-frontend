import { cn } from "@/lib/utils";

type CourseColor = "blue" | "yellow" | "red" | "purple" | "green" | "orange" | "teal";

interface CourseCardProps {
  title: string;
  color: CourseColor;
  selected?: boolean;
  onClick?: () => void;
}

const colorMap: Record<CourseColor, string> = {
  blue: "bg-course-blue",
  yellow: "bg-course-yellow",
  red: "bg-course-red",
  purple: "bg-course-purple",
  green: "bg-course-green",
  orange: "bg-course-orange",
  teal: "bg-course-teal",
};

export function CourseCard({ title, color, selected, onClick }: CourseCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary/30",
        selected && "border-primary/50 ring-2 ring-primary/20"
      )}
    >
      <span className={cn("h-10 w-1 shrink-0 rounded-full", colorMap[color])} aria-hidden />
      <span className="text-sm font-medium text-foreground leading-tight">{title}</span>
    </button>
  );
}
