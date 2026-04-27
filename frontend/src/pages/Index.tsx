import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { CoursesGrid } from "@/components/dashboard/CoursesGrid";
import { GroupsTable } from "@/components/dashboard/GroupsTable";

const Index = () => {
  const [search, setSearch] = React.useState("");
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | undefined>(undefined);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex flex-1 flex-col min-w-0">
          <TopBar searchValue={search} onSearchChange={setSearch} />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="mx-auto max-w-[1400px]">
              <CoursesGrid selectedCourseId={selectedCourseId} onSelectCourseId={setSelectedCourseId} />
              <GroupsTable search={search} courseId={selectedCourseId} />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
