// src/app/layout.tsx
// Root layout - Authentication is OPTIONAL
// Users can browse all grants, recipients, institutes without logging in
// Auth only needed for: bookmarks, saved searches, account features

import type { Metadata, Viewport } from "next";
import { Stack_Sans_Notch } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getCurrentUser } from "@/lib/session";
import MainLayout from "@/components/layout/MainLayout";
import ServiceWorkerRegistration from "@/components/layout/ServiceWorkerRegistration";

const stack = Stack_Sans_Notch({ 
    weight: ["200", "300", "400", "500", "600", "700"],
    style: "normal",
    subsets: ['latin'],
    adjustFontFallback: true,
    fallback: ['system-ui', 'Helvetica', 'Arial', 'sans-serif'],
    display: 'swap'
});

export const metadata: Metadata = {
    title: "[ RGAP ] Research Grants Analytics Platform",
    description:
        "Browse Canadian Tri-Agency Council research grants from NSERC, CIHR, and SSHRC",
    keywords: ["research grants", "NSERC", "CIHR", "SSHRC", "Canada"],
    icons: {
        icon: "/favicon.ico",
        apple: "/favicon.png",
        other: {
            rel: "icon",
            url: "/favicon.png",
        },
    },
    openGraph: {
        type: "website",
        locale: "en_CA",
        url: "https://rgap.anirban.ca",
        title: "[ RGAP ] Research Grants Analytics Platform",
        description:
            "Browse Canadian Tri-Agency Council research grants from NSERC, CIHR, and SSHRC",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: 'cover'
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    return (
        <html lang="en">
            <body className={stack.className}>
                <ServiceWorkerRegistration />
                <Providers initialUser={user} key={user?.id || "anonymous"}>
                    <MainLayout>{children}</MainLayout>
                </Providers>
            </body>
        </html>
    );
}
