import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import {
  ClassesPage,
  CoursesPage,
  CrmPage,
  ReportsPage,
  RoomsPage,
  SchedulePage,
  SettingsPage,
  StudentsPage,
  UsersPage,
} from "./pages/ModulesPages.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/istifadeciler" element={<UsersPage />} />
          <Route path="/rollar" element={<UsersPage />} />
          <Route path="/crm" element={<CrmPage />} />
          <Route path="/otaqlar" element={<RoomsPage />} />
          <Route path="/vitrin" element={<Index />} />
          <Route path="/sinifler" element={<ClassesPage />} />
          <Route path="/telebeler" element={<StudentsPage />} />
          <Route path="/kurslar" element={<CoursesPage />} />
          <Route path="/hesabatlar" element={<ReportsPage />} />
          <Route path="/cedvel" element={<SchedulePage />} />
          <Route path="/ayarlar" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
