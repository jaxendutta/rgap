// src/pages/HomePage.tsx
import { Link, useNavigate } from "react-router-dom";
import {
    Search,
    Database,
    ChartSpline,
    UserPlus,
    LogIn,
    LucideIcon,
    GraduationCap,
} from "lucide-react";
import PageContainer from "@/components/common/layout/PageContainer";
import { Button } from "@/components/common/ui/Button";
import { Card } from "@/components/common/ui/Card";

export default function HomePage() {
    const navigate = useNavigate();

    const features: [title: string, description: string, icon: LucideIcon, link: string][] = [
        [
            "Comprehensive Data",
            "Access and analyze over 175,000 research grants from NSERC, CIHR, and SSHRC.",
            Database,
            "/search",
        ],
        [
            "Advanced Analytics",
            "Visualize funding trends, analyze success rates, and track research investments.",
            ChartSpline,
            "/trends",
        ],
        [
            "Explore Recipients",
            "Discover researchers and institutions behind the grants.",
            GraduationCap,
            "/recipients",
        ],
        [
            "Create Account",
            "Sign up to save searches, bookmark grants, and more.",
            UserPlus,
            "/auth",
        ],
    ];

    return (
        <PageContainer>
            {/* Hero Section */}
            <Card className="hover:border-gray-300 transition-all duration-200">
                <Card.Content noPadding className="px-6 lg:px-8 py-14">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl leading-tight flex justify-center items-center">
                            <span
                                style={{
                                    fontSize: "inherit",
                                    fontWeight: "inherit",
                                    display: "inline-block",
                                    padding: "0 0.5rem",
                                }}
                            >
                                [
                            </span>
                            <span className="inline-block">
                                Research Grant Analytics Platform
                            </span>
                            <span
                                style={{
                                    fontSize: "inherit",
                                    fontWeight: "inherit",
                                    display: "inline-block",
                                    padding: "0 0.5rem",
                                }}
                            >
                                ]
                            </span>
                        </h1>

                        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            Explore and analyze research funding data from
                            Canada's three major research funding agencies:
                            NSERC, CIHR, and SSHRC.
                        </p>

                        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    leftIcon={Search}
                                    className="pl-6 pr-8 md:text-lg"
                                    onClick={() => {}} // Using button with Link component
                                >
                                    <Link to="/search" className="text-white">
                                        Start Exploring
                                    </Link>
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    leftIcon={LogIn}
                                    className="pl-6 pr-8 md:text-lg"
                                    onClick={() => {}} // Using button with Link component
                                >
                                    <Link to="/auth" className="text-gray-700">
                                        Your Account
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card.Content>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-6">
                {features.map(([title, description, Icon, link], index) => {
                    return (
                        <Card
                            key={index}
                            className="p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                            isInteractive
                            onClick={() => {
                                navigate(link);
                            }}
                        >
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-900 text-white mb-4">
                                <Icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">
                                {title}
                            </h3>
                            <p className="mt-2 text-base text-gray-500">
                                {description}
                            </p>
                        </Card>
                    );
                })}
            </div>
        </PageContainer>
    );
}
