import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { getUser } from "../lib/authStorage";
import { getWallet } from "../lib/api/wallet";
import { cn } from "@/lib/utils";

export function BalanceIndicator() {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const user = getUser();

    useEffect(() => {
        const fetchBalance = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const response = await getWallet(user._id);
                if (response.success && response.responseObject) {
                    setBalance(response.responseObject.balance);
                }
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.error("Failed to fetch balance:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, [user]);

    if (loading) {
        return (
            <div className="fixed top-4 right-4 z-40 bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 flex items-center gap-2">
                <div className="animate-pulse h-4 w-16 bg-[#17212b] rounded"></div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "fixed top-4 right-4 z-40 bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg"
            )}
        >
            <Wallet className="h-4 w-4 text-[#5288c1]" />
            <span className="text-sm font-medium text-[#f5f5f5]">
                {balance !== null ? balance.toFixed(0) : "0"} ⭐️
            </span>
        </div>
    );
}
