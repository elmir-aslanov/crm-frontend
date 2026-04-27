import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface SectionPageProps {
  title: string;
  description: string;
}

export default function SectionPage({ title, description }: SectionPageProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-[1400px]">
              <section className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
