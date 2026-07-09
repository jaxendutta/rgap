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
        <div className="min-h-dvh flex flex-col bg-slate-100">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main
                    id="main-content"
                    className="flex-1 min-w-0 px-3 lg:px-6 pt-16 md:pt-12 lg:mt-0 bg-slate-100 flex flex-col"
                >
                    <div className="flex-1 flex flex-col">
                        {children}
                        {/*
                          Clearance for the floating mobile bottom-nav (Sidebar).
                          It's a fixed overlay, so instead of a permanent `pb-20` on
                          <main> (which shrinks the centering box and pushes short,
                          vertically-centered pages up off-center), we add a trailing
                          spacer. It only extends the scroll area when content is tall
                          enough to run under the nav, and stays out of the way on
                          short pages. Hidden on lg where the nav isn't floating.
                        */}
                        <div aria-hidden className="h-20 shrink-0 lg:hidden" />
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
};

export default MainLayout