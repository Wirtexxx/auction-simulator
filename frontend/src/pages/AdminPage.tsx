import { useNavigate } from "react-router-dom";
import { Wallet, Shield, Gift, Gavel } from "lucide-react";

interface AdminMenuItem {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    color: string;
    disabled?: boolean;
}

export function AdminPage() {
    const navigate = useNavigate();

    const adminMenuItems: AdminMenuItem[] = [
        {
            title: "Управление балансом",
            description: "Изменение баланса пользователей",
            icon: Wallet,
            path: "/app/admin/balance",
            color: "text-[#5288c1]",
        },
        {
            title: "Создать коллекцию подарков",
            description: "Создание новой коллекции подарков",
            icon: Gift,
            path: "/app/admin/collection",
            color: "text-[#6ab2f2]",
        },
        {
            title: "Управление коллекциями",
            description: "Просмотр и удаление коллекций",
            icon: Gift,
            path: "/app/admin/collections",
            color: "text-[#6ab2f2]",
        },
        {
            title: "Создать аукцион",
            description: "Создание нового аукциона для коллекции",
            icon: Gavel,
            path: "/app/admin/auction",
            color: "text-[#5288c1]",
        },
    ];

    return (
        <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <Shield className="w-8 h-8 text-[#5288c1]" />
                    <h1 className="text-3xl font-bold">Админ панель</h1>
                </div>

                <div className="space-y-4">
                    {adminMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isDisabled = item.disabled;

                        return (
                            <button
                                key={item.path}
                                onClick={() =>
                                    !isDisabled && navigate(item.path)
                                }
                                disabled={isDisabled}
                                className={`w-full text-left p-6 rounded-lg border transition-all min-h-[100px] flex items-center ${
                                    isDisabled
                                        ? "bg-[#232e3c]/50 border-[rgba(255,255,255,0.05)] opacity-50 cursor-not-allowed"
                                        : "bg-[#232e3c] border-[rgba(255,255,255,0.1)] hover:border-[#5288c1] hover:bg-[#232e3c]/80 cursor-pointer"
                                }`}
                            >
                                <div className="flex items-start gap-4 w-full">
                                    <div
                                        className={`p-3 rounded-lg bg-[#17212b] ${item.color} shrink-0`}
                                    >
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-[#f5f5f5] mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-[#708499]">
                                            {item.description}
                                        </p>
                                        {isDisabled && (
                                            <p className="text-xs text-[#708499] mt-2 italic">
                                                Скоро будет доступно
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
