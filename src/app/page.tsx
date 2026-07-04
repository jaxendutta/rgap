import Link from "next/link";
import {
    LuSearch,
    LuGraduationCap,
    LuDatabase,
    LuChartSpline,
    LuUserPlus,
    LuLogIn,
    LuTriangleAlert
} from "react-icons/lu";
import PageContainer from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { IconType } from "react-icons";
import { LAST_UPDATED, GRANTS_COUNT_APPROX } from "@/constants/data";
import { formatDate, formatDateDiff } from "@/lib/format";
import { GiAbstract014 } from "react-icons/gi";

export default function HomePage() {
    const features: [
        title: string,
        description: string,
        icon: IconType,
        link?: string
    ][] = [
            [
                "Comprehensive Data",
                `Access and analyze over ${GRANTS_COUNT_APPROX.toLocaleString()} research grants from NSERC, CIHR, and SSHRC.`,
                LuDatabase,
                "/search",
            ],
            [
                "Advanced Analytics",
                "Visualize funding trends, analyze success rates, and track research investments.",
                LuChartSpline,
            ],
            [
                "Recipients + Institutes",
                "Discover the personalized profiles of researchers and institutes behind the grants.",
                LuGraduationCap,
                "/recipients",
            ],
            [
                "Create Account",
                "Sign up to bookmark grants, save searches, customize dashboards + more.",
                LuUserPlus,
                "/login",
            ],
        ];

    const actionLinkClasses = "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm md:text-base font-medium transition-colors duration-300 ease-in-out shadow-xs hover:shadow-sm";

    return (
        <PageContainer className="flex min-h-full flex-1 flex-col gap-3 md:gap-6">
            {/* Hero Section */}
            <Card className="relative flex flex-1 items-center px-6 lg:px-8 py-10 md:py-14 lg:py-24 hover:border-gray-300 transition-all duration-200 rounded-3xl">
                <GiAbstract014 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 md:size-80 text-gray-700 opacity-10 animate-spin-slow pointer-events-none" />

                <div className="flex h-full w-full flex-col justify-center text-center">
                    <div className={`font-bold text-gray-900 leading-tight flex justify-center items-center pb-2 sm:pb-3 md:pb-4`}>
                        <span className="px-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl">[</span>
                        <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-2">RGAP</span>
                        <span className="px-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl">]</span>
                    </div>

                    <span className="mt-1 text-xs sm:text-base md:text-xl text-gray-600 block uppercase tracking-widest font-semibold border-b border-gray-300 pb-1 md:pb-2">
                        Research Grants Analytics Platform
                    </span>
                    <div className="mt-3 md:mt-5 max-w-md mx-auto text-sm md:text-base text-gray-500 md:max-w-3xl">
                        Explore and analyze research funding data from Canada&apos;s
                        three major research funding agencies: NSERC, CIHR, and
                        SSHRC.
                    </div>

                    <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                        <div className="flex flex-wrap justify-center sm:flex-row gap-3">
                            <Link
                                href="/search"
                                className={`${actionLinkClasses} bg-gray-900 text-white hover:bg-black`}
                            >
                                <LuSearch className="size-3.5 md:size-4 flex-shrink-0" />
                                <span>Explore</span>
                            </Link>

                            <Link
                                href="/login"
                                className={`${actionLinkClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`}
                            >
                                <span>Sign In</span>
                                <LuLogIn className="size-3.5 md:size-4 flex-shrink-0" />
                            </Link>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Last Updated Date */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 w-full bg-gray-900 text-white py-2 px-2 md:px-4 md:p-4 rounded-[20px] md:rounded-4xl shadow-lg border border-gray-700">
                <div className="flex w-full items-center justify-center gap-3 w-full text-gray-900 rounded-3xl py-2 bg-gray-100">
                    <span className="text-xs md:text-sm lg:text-base">Last Data Update</span>
                </div>
                <div className="flex w-full flex-grow items-center justify-between gap-3 text-gray-200 md:gap-4 text-xs md:text-sm lg:text-base font-medium px-2">
                    <span>{formatDate(LAST_UPDATED, "long")}</span>
                    <div className="h-px flex-grow bg-gray-100 mx-1" />
                    <span>{formatDateDiff(LAST_UPDATED, new Date(), "long")} ago</span>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {features.map(([title, description, Icon, link], index) => {
                    const card = (
                        <Card
                            className="relative overflow-hidden p-4 md:p-6 flex flex-col justify-center gap-1 hover:border-gray-300 hover:shadow-md transition-all duration-200 rounded-3xl h-full"
                        >
                            <Icon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-24 md:size-32 text-gray-700 opacity-10 animate-spin-slow" />
                            <div className="z-10 justify-between flex flex-col h-full gap-1">
                                <h3 className="font-semibold text-[13px] sm:text-sm md:text-base text-gray-900 leading-tight">
                                    {title}
                                </h3>
                                <p className="text-[11px] sm:text-xs md:text-sm text-gray-500">
                                    {description}
                                </p>
                            </div>
                        </Card>
                    );

                    if (link) {
                        return (
                            <Link key={index} href={link} className="block h-full">
                                {card}
                            </Link>
                        );
                    }

                    return (
                        <div key={index} className="h-full">
                            {card}
                        </div>
                    );
                })}
            </div>

        </PageContainer>
    );
}
