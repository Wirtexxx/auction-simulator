import { useNavigate, useLocation } from "react-router-dom";
import { Home, User, Shield, Gift } from "lucide-react";
import { getUser } from "../lib/authStorage";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUser();
    const isAdmin = user?.role === "admin";

    const navItems = [
        {
            label: "Аукцион",
            path: "/app/auction",
            icon: Home,
        },
        {
            label: "Коллекции",
            path: "/app/collections",
            icon: Gift,
        },
        {
            label: "Профиль",
            path: "/app/profile",
            icon: User,
        },
        ...(isAdmin
            ? [
                  {
                      label: "Admin",
                      path: "/app/admin",
                      icon: Shield,
                  },
              ]
            : []),
    ];

    return (
        <nav className="fixed bottom-0 pb-8 left-0 right-0 bg-[#17212b] border-t border-[rgba(255,255,255,0.1)] z-50">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // For admin, check if path starts with /app/admin
                    const isActive =
                        item.path === "/app/admin"
                            ? location.pathname.startsWith("/app/admin")
                            : location.pathname === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors bg-transparent border-none",
                                isActive
                                    ? "text-[#5288c1]"
                                    : "text-[#708499] hover:text-[#f5f5f5]"
                            )}
                            style={{
                                backgroundColor: "transparent",
                                border: "none",
                            }}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
