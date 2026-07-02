// src/components/layout/MainLayout.tsx
import { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="h-screen flex flex-col">
            <Header />
            <div className="flex-1 min-h-0 flex overflow-hidden">
                <Sidebar />
                <main
                    id="main-content"
                    className="flex-1 min-h-0 overflow-auto px-3 lg:px-6 pt-16 pb-16 md:pt-12 lg:mt-0 md:pb-0 bg-slate-100 flex flex-col"
                >
                    {children}
                    <Footer />
                </main>
            </div>
        </div>
    );
};

export default MainLayout