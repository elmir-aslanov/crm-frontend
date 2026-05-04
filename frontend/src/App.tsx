import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import ProtectedRoute from "@/components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import {
  AttendancePage,
  ClassesPage,
  CoursesPage,
  CrmPage,
  PaymentsPage,
  ReportsPage,
  RoomsPage,
  SchedulePage,
  SettingsPage,
  StudentsPage,
  UsersPage,
} from "./pages/ModulesPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/istifadeciler"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rollar"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm"
            element={
              <ProtectedRoute>
                <CrmPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/otaqlar"
            element={
              <ProtectedRoute>
                <RoomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vitrin"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sinifler"
            element={
              <ProtectedRoute>
                <ClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/telebeler"
            element={
              <ProtectedRoute>
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kurslar"
            element={
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hesabatlar"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cedvel"
            element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ayarlar"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/davamiyyet"
            element={
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/odenisler"
            element={
              <ProtectedRoute>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
