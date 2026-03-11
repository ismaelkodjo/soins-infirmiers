import { LayoutDashboard, FileText, ShoppingBag, MessageSquare, ArrowLeft, FilePlus2, Users, Bell, UserCog, Pill } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Tableau de bord", url: "/admin", icon: LayoutDashboard },
  { title: "Articles", url: "/admin/articles", icon: FileText },
  { title: "Produits", url: "/admin/produits", icon: ShoppingBag },
  { title: "Pages", url: "/admin/pages", icon: FilePlus2 },
  { title: "Messages", url: "/admin/messages", icon: MessageSquare },
  { title: "Patients", url: "/admin/patients", icon: Users },
  { title: "Personnel", url: "/admin/personnel", icon: UserCog },
  { title: "Pharmacie", url: "/admin/pharmacie", icon: Pill },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["admin-unread-notifications"],
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      return count || 0;
    },
    refetchInterval: 30000,
  });

  const { data: pendingStaffCount = 0 } = useQuery({
    queryKey: ["admin-pending-staff-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("staff_members")
        .select("id", { count: "exact", head: true })
        .eq("approved", false);
      return count || 0;
    },
    refetchInterval: 30000,
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {item.title === "Notifications" && unreadCount > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold h-5 min-w-[20px] px-1">
                          {unreadCount}
                        </span>
                      )}
                      {item.title === "Personnel" && pendingStaffCount > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold h-5 min-w-[20px] px-1">
                          {pendingStaffCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="hover:bg-muted/50 text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Retour au site</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
