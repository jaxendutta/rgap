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
        <div className="min-h-screen flex flex-col bg-slate-100">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main
                    id="main-content"
                    className="flex-1 min-w-0 px-3 lg:px-6 pt-16 pb-20 md:pt-12 lg:mt-0 lg:pb-0 bg-slate-100 flex flex-col"
                >
                    <div className="flex-1 flex flex-col">
                        {children}
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
};

export default MainLayout