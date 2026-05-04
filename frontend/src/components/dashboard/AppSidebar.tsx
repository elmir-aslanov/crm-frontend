import {
    Home, Users, Shield, Building2, DoorOpen, LayoutGrid,
    GraduationCap, UserCheck, BookOpen, BarChart3, CalendarDays,
    Settings, Sparkles, ClipboardList, CreditCard,
  } from "lucide-react";
  import { NavLink } from "@/components/ui/NavLink";
  import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
    SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
  } from "@/components/ui/sidebar";
  
  const mainItems = [
    { title: "Ana səhifə", url: "/", icon: Home },
    { title: "İstifadəçilər", url: "/istifadeciler", icon: Users },
    { title: "Rollar", url: "/rollar", icon: Shield },
    { title: "CRM", url: "/crm", icon: Building2 },
    { title: "Otaqlar", url: "/otaqlar", icon: DoorOpen },
    { title: "Vitrin", url: "/vitrin", icon: LayoutGrid },
    { title: "Siniflər", url: "/sinifler", icon: GraduationCap },
  ];
  
  const secondaryItems = [
    { title: "Tələbələr", url: "/telebeler", icon: UserCheck },
    { title: "Kurslar", url: "/kurslar", icon: BookOpen },
    { title: "Davamiyyət", url: "/davamiyyet", icon: ClipboardList },
    { title: "Ödənişlər", url: "/odenisler", icon: CreditCard },
    { title: "Hesabatlar", url: "/hesabatlar", icon: BarChart3 },
    { title: "Cədvəl", url: "/cedvel", icon: CalendarDays },
  ];
  
  export function AppSidebar() {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
  
    return (
      <Sidebar collapsible="icon" className="border-r-0">
        <div className="bg-gradient-sidebar h-full">
          <SidebarHeader className="px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/20 ring-1 ring-sidebar-primary/30">
                <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-sidebar-foreground truncate">Kometa</p>
                  <p className="text-[11px] text-sidebar-foreground/60 truncate">Education Platform</p>
                </div>
              )}
            </div>
          </SidebarHeader>
  
          <SidebarContent className="px-2">
            <SidebarGroup>
              {!collapsed && (
                <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider px-3">
                  İdarəetmə
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="h-10 rounded-lg">
                        <NavLink
                          to={item.url}
                          end={item.url === "/"}
                          className="flex items-center gap-3 px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                          activeClassName="!bg-sidebar-primary !text-sidebar-primary-foreground font-medium shadow-md shadow-sidebar-primary/30"
                        >
                          <item.icon className="h-[18px] w-[18px] shrink-0" />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
  
            <SidebarGroup>
              {!collapsed && (
                <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider px-3 mt-2">
                  Akademik
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {secondaryItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="h-10 rounded-lg">
                        <NavLink
                          to={item.url}
                          className="flex items-center gap-3 px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                          activeClassName="!bg-sidebar-primary !text-sidebar-primary-foreground font-medium"
                        >
                          <item.icon className="h-[18px] w-[18px] shrink-0" />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
  
          <SidebarFooter className="p-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-10 rounded-lg">
                  <NavLink
                    to="/ayarlar"
                    className="flex items-center gap-3 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    activeClassName="!bg-sidebar-accent !text-sidebar-foreground"
                  >
                    <Settings className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span className="text-sm">Ayarlar</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </div>
      </Sidebar>
    );
  }
  