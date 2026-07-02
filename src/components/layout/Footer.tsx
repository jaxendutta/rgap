import Link from "next/link";
import { SITE_NAME } from "@/constants/site";

const Footer = () => {
    return (
        <footer className="shrink-0 border-t border-gray-200 bg-slate-100/95 px-4 py-2 md:py-4 text-xs md:text-sm text-gray-500 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl flex-nowrap items-center justify-center gap-2 text-center leading-none whitespace-nowrap">
                <span className="whitespace-nowrap">© 2026 {SITE_NAME}</span>
                <Link
                    href="/docs/privacy"
                    className="font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-blue-600 hover:decoration-blue-500"
                >
                    Privacy Policy
                </Link>
            </div>
        </footer>
    );
};

export default Footer;