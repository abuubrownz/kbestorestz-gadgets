import { LayoutDashboard, Package, Wrench, Boxes, Users, BarChart3, HardHat } from "lucide-react";
import type { DashboardNavItem } from "@/components/kb/dashboard-shell";

export const adminNav: DashboardNavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/repairs", label: "Repairs", icon: Wrench },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/technician", label: "Technician", icon: HardHat },
];
