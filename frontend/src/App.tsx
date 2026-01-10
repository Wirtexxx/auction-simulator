import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { AuctionPage } from "./pages/AuctionPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { CollectionDetailPage } from "./pages/CollectionDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPage } from "./pages/AdminPage";
import { AdminBalancePage } from "./pages/AdminBalancePage";
import { AdminCollectionPage } from "./pages/AdminCollectionPage";
import { AdminCollectionsPage } from "./pages/AdminCollectionsPage";
import { AdminAuctionPage } from "./pages/AdminAuctionPage";
import { BottomNavigation } from "./components/BottomNavigation";
import { BalanceIndicator } from "./components/BalanceIndicator";
import { isAuthenticated } from "./lib/authStorage";
import "./App.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (!isAuthenticated()) {
        return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <BalanceIndicator />
            {children}
            <BottomNavigation />
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route
                    path="/app/auction"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <AuctionPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/app/collections"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <CollectionsPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/app/collections/:id"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <CollectionDetailPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/app/profile"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <ProfilePage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/app/admin"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <AdminPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/app/admin/balance"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <AdminBalancePage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/app/admin/collection"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <AdminCollectionPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/app/admin/collections"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <AdminCollectionsPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/app/admin/auction"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <AdminAuctionPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/app"
                    element={<Navigate to="/app/auction" replace />}
                />
                <Route path="/" element={<Navigate to="/auth" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
