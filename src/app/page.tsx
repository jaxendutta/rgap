"use client";

import { useRouter } from "next/navigation";
import {
  LuSearch,
  LuGraduationCap,
  LuBuilding,
  LuDatabase,
  LuChartSpline,
  LuUserPlus,
  LuLogIn,
} from "react-icons/lu";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconType } from "react-icons";

export default function HomePage() {
  const features: [
    title: string,
    description: string,
    icon: IconType,
    link?: string
  ][] = [
      [
        "Comprehensive Data",
        "Access and analyze over 175,000 research grants from NSERC, CIHR, and SSHRC.",
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
        "Discover researchers and institutions behind the grants.",
        LuGraduationCap,
        "/recipients",
      ],
      [
        "Create Account",
        "Sign up to save searches, bookmark grants, and more.",
        LuUserPlus,
        "/login",
      ],
    ];

  const router = useRouter();

  return (
    <PageContainer className="flex lg:h-full flex-col justify-center">
      {/* Hero Section */}
      <Card className="px-6 lg:px-8 py-14 lg:py-24 hover:border-gray-300 transition-all duration-200 rounded-3xl lg:rounded-full">
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
            Explore and analyze research funding data from Canada's
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

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-6">
        {features.map(([title, description, Icon, link], index) => {
          return (
            <Card
              key={index}
              className="p-4 md:p-6 flex flex-col gap-1 hover:border-gray-300 hover:shadow-md transition-all duration-200 rounded-3xl"
              isInteractive
              onClick={link ? () => router.push(link) : undefined}
            >
              <div className="flex items-center justify-center h-8 md:h-12 w-8 md:w-12 rounded-md bg-gray-900 text-white mb-1 md:mb-3">
                <Icon className="h-4 md:h-6 w-4 md:w-6" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-gray-900">
                {title}
              </h3>
              <p className="text-xs md:text-sm text-gray-500">
                {description}
              </p>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
