// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { Search, Database, TrendingUp, UserPlus, LogIn } from "lucide-react";
import PageContainer from "@/components/common/layout/PageContainer";
import { Button } from "@/components/common/ui/Button";
import { Card } from "@/components/common/ui/Card";

export default function HomePage() {
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
                                    icon={Search}
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
                                    icon={LogIn}
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <Card
                    className="p-6 hover:border-gray-300 transition-all duration-200"
                    isHoverable
                >
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-900 text-white mb-4">
                        <Database className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                        Comprehensive Data
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                        Access and analyze over 231,000 research grants from
                        NSERC, CIHR, and SSHRC.
                    </p>
                </Card>

                {/* Feature 2 */}
                <Card
                    className="p-6 hover:border-gray-300 transition-all duration-200"
                    isHoverable
                >
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-900 text-white mb-4">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                        Advanced Analytics
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                        Visualize funding trends, analyze success rates, and
                        track research investments.
                    </p>
                </Card>

                {/* Feature 3 */}
                <Card
                    className="p-6 hover:border-gray-300 transition-all duration-200"
                    isHoverable
                >
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-900 text-white mb-4">
                        <UserPlus className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                        <Link to="/auth" className="hover:text-gray-700">
                            Create Account
                            <span aria-hidden="true" className="ml-1">
                                →
                            </span>
                        </Link>
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                        Sign up to save searches, bookmark grants, and more.
                    </p>
                </Card>
            </div>
        </PageContainer>
    );
}
