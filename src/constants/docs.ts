import { IconType } from "react-icons";
import { LuBookmark, LuChartLine, LuInfo, LuScale, LuSearch, LuShieldCheck, LuUser } from "react-icons/lu";

interface DocNavItem {
    title: string;
    href: string;
    icon: IconType;
}

export const DOCS_NAV_ITEMS: { title: string; items: DocNavItem[] }[] = [
    {
        title: "Getting Started",
        items: [
            { title: "Introduction", href: "/docs/intro", icon: LuInfo },
            { title: "Account & Security", href: "/docs/account-setup", icon: LuUser },
        ]
    },
    {
        title: "Platform Features",
        items: [
            { title: "Search & Filters", href: "/docs/search", icon: LuSearch },
            { title: "Analytics Engine", href: "/docs/analytics", icon: LuChartLine },
            { title: "Bookmarks", href: "/docs/bookmarks", icon: LuBookmark },
        ]
    },
    {
        title: "Legal",
        items: [
            { title: "Privacy Policy", href: "/docs/privacy", icon: LuShieldCheck },
            { title: "Terms & Conditions", href: "/docs/terms", icon: LuScale },
        ]
    }
];
