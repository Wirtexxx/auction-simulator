import { useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardTitle,
    CardDescription,
} from "../components/ui/card";
import { Wallet, Gift, Gavel } from "lucide-react";

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
        {
            title: "Управление аукционами",
            description: "Просмотр всех аукционов",
            icon: Gavel,
            path: "/app/admin/auctions",
            color: "text-[#5288c1]",
        },
    ];

    return (
        <div className="min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold">Админ панель</h2>
                </div>

                <div className="space-y-4">
                    {adminMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isDisabled = item.disabled;

                        return (
                            <Card
                                key={item.path}
                                onClick={() =>
                                    !isDisabled && navigate(item.path)
                                }
                                className={`cursor-pointer transition-all min-h-[100px] ${
                                    isDisabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:border-primary"
                                }`}
                            >
                                <CardContent className="p-6 flex items-center">
                                    <div className="flex items-start gap-4 w-full">
                                        <div
                                            className={`p-3 rounded-lg bg-muted ${item.color} shrink-0`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="mb-1">
                                                {item.title}
                                            </CardTitle>
                                            <CardDescription>
                                                {item.description}
                                            </CardDescription>
                                            {isDisabled && (
                                                <p className="text-xs text-muted-foreground mt-2 italic">
                                                    Скоро будет доступно
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
