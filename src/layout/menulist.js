import {
  LayoutDashboard,
  MessagesSquare,
  Cpu ,
  Database,
  BarChart3,
  Settings,
  Users
} from "lucide-react";




const menuList = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard
  },
  {
    name: "Conversation Manager",
    path: "/Conversations",
    icon: MessagesSquare
  },
  {
    name: "Intent Manager",
    path: "/Intents",
    icon: Cpu 
  },
  {
    name: "Knowledge Base Manager",
    path: "/Knowledge-Base",
    icon: Database
  },
  {
    name: "Analytics & Reports",
    path: "/Analytics",
    icon: BarChart3
  },
  {
    name: "Settings & Configuration",
    path: "/Settings",
    icon: Settings
  },
  {
    name: "User Management",
    path: "/User-Management",
    icon: Users
  }
];


export default menuList