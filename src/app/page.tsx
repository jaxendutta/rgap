"use client";

import { useRouter } from "next/navigation";
import {
  LuSearch,
  LuGraduationCap,
  LuDatabase,
  LuChartSpline,
  LuUserPlus,
  LuLogIn,
  LuTriangleAlert,
  LuCalendarClock,
} from "react-icons/lu";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconType } from "react-icons";
import { LAST_UPDATED } from "@/constants/data";
import { formatDate, formatDateDiff } from "@/lib/format";

export default function HomePage() {
  const features: [
    title: string,
    description: string,
    icon: IconType,
    link?: string
  ][] = [
      [
        "Comprehensive Data",
        "Access and analyze over 193,000 research grants from NSERC, CIHR, and SSHRC.",
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
        "Discover researchers and institutes behind the grants.",
        LuGraduationCap,
        "/recipients",
      ],
      [
        "Create Account",
        "Sign up to save searches, bookmark grants, have customized dashboards, and more.",
        LuUserPlus,
        "/login",
      ],
    ];

  const router = useRouter();

  return (
    <PageContainer className="flex lg:h-full flex-col justify-center gap-3 md:gap-6">
      {/* Hero Section */}
      <Card className="px-6 lg:px-8 py-14 lg:py-24 hover:border-gray-300 transition-all duration-200 rounded-3xl">
        <div className="text-center">
          <p className="text-5xl font-bold text-gray-900 leading-tight flex justify-center items-center">
            <span className="inline-block px-2">[</span>
            <span className="inline-block">RGAP</span>
            <span className="inline-block px-2">]</span>
          </p>

          <span className="mt-1 text-base md:text-xl text-gray-600 block italic">
            Research Grants Analytics Platform
          </span>
          <p className="mt-3 md:mt-5 max-w-md mx-auto text-sm md:text-base text-gray-500 md:max-w-3xl">
            Explore and analyze research funding data from Canada&apos;s
            three major research funding agencies: NSERC, CIHR, and
            SSHRC.
          </p>

          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="flex flex-wrap justify-center sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                leftIcon={LuSearch}
                className="pl-4.5 pr-6 text-sm md:text-base"
                onClick={() => router.push("/search")}
              >
                Explore
              </Button>

              <Button
                variant="outline"
                size="lg"
                leftIcon={LuLogIn}
                className="pl-4.5 pr-5 text-sm md:text-base"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Last Updated Date */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 md:p-4 rounded-3xl shadow-lg border border-gray-700">
        <div className="flex gap-2 w-full">
          <LuTriangleAlert className="flex size-6 md:size-9 border border-gray-200 text-gray-200 rounded-full p-1 md:p-2 flex-shrink-0" />

          <div className="flex items-center justify-center gap-3 w-full text-gray-900 rounded-3xl p-0 border border-white">
            <span className="text-xs md:text-sm text-white">Last Data Update</span>
          </div>
        </div>
        <div className="flex w-full flex-grow items-center justify-between gap-3 text-gray-200 md:gap-4">
          <span className="text-xs md:text-sm">{formatDate(LAST_UPDATED, "long")}</span>
          <div className="h-px flex-grow bg-gray-100 mx-1" />
          <span className="italic text-xs md:text-sm">{formatDateDiff(LAST_UPDATED, new Date(), "long")} ago</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {features.map(([title, description, Icon, link], index) => {
          return (
            <Card
              key={index}
              className="relative overflow-hidden p-4 md:p-6 flex flex-col justify-center gap-1 hover:border-gray-300 hover:shadow-md transition-all duration-200 rounded-3xl"
              isInteractive
              onClick={link ? () => router.push(link) : undefined}
            >
              <Icon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-24 md:size-32 text-gray-700 opacity-10 animate-slow-rotate" />
              <div className="z-10 justify-between flex flex-col h-full">
                <h3 className="font-semibold text-sm md:text-base text-gray-900">
                  {title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  {description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
