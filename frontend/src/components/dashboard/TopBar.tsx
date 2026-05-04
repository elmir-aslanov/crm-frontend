import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";

export function TopBar({
  searchValue,
  onSearchChange,
}: {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-gradient-header px-4 sm:px-6 backdrop-blur">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Qrup, tələbə və ya kurs axtar..."
          className="pl-9 h-10 bg-muted/40 border-transparent focus-visible:bg-card focus-visible:border-border"
          value={searchValue ?? ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Bildirişlər"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-course-red ring-2 ring-background" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-foreground leading-tight">Elmir Aslanov</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-course-purple text-sm font-bold text-primary-foreground">
            EA
          </div>
        </div>
      </div>
    </header>
  );
}
