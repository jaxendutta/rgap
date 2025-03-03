import { useState } from "react";
import { ResearchGrant } from "@/types/models";
import { Card } from "@/components/common/ui/Card";
import { formatCurrency, formatShortCurrency, formatDate, formatDateDiff } from "@/utils/format";
import { Link } from "react-router-dom";
import {
    BookmarkPlus,
    University,
    BookMarked,
    Database,
    ArrowUpRight,
    MapPin,
    Calendar,
    ChevronDown,
    DollarSign,
    FileText,
    AlertCircle,
    Globe,
    History,
    TrendingUp,
    TrendingDown,
    FileEdit,
    CornerDownRight,
    CalendarDays,
    Layers,
    LineChart
} from "lucide-react";
import { formatSentenceCase } from "@/utils/format";
import { cn } from "@/utils/cn";

interface GrantCardProps {
    grant: ResearchGrant;
    onBookmark?: () => void;
}

export const GrantCard = ({ grant, onBookmark }: GrantCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'versions' | 'funding'>('details');
    
    // Check if agreement title is empty or null
    const hasTitle = grant.agreement_title_en && grant.agreement_title_en.trim() !== '';
    
    // Check for optional fields existence before use
    const hasDescription = !!grant.description_en && grant.description_en.trim() !== '';
    const hasExpectedResults = !!grant.expected_results_en && grant.expected_results_en.trim() !== '';
    const hasForeignCurrency = !!grant.foreign_currency_type && 
                              !!grant.foreign_currency_value && 
                              grant.foreign_currency_value > 0;
    
    // Format amendment number for display (safely)
    const amendmentNumber = grant.amendment_number ? Number(grant.amendment_number) || 0 : 0;
    
    // Check if this grant has amendments
    const hasAmendments = grant.amendments_history && grant.amendments_history.length > 1;
    
    // Sort amendments by number (descending - most recent first)
    const sortedAmendments = hasAmendments 
        ? [...(grant.amendments_history || [])].sort((a, b) => {
            const numA = parseInt(a.amendment_number);
            const numB = parseInt(b.amendment_number);
            return numB - numA;
          })
        : [];
        
    // Get funding data for chart
    const fundingChartData = hasAmendments ? sortedAmendments.map((amendment) => ({
        version: amendment.amendment_number === "0" ? "Original" : `${amendment.amendment_number}`,
        value: amendment.agreement_value,
        date: amendment.amendment_date || amendment.agreement_start_date
    })).reverse() : [];

    // Function to render funding change indicator
    const renderChangeIndicator = (current: number, previous: number) => {
        const diff = current - previous;
        if (diff === 0) return null;
        
        return (
            <span className={cn(
                "inline-flex items-start ml-2 px-2 py-0.5 rounded text-xs font-medium",
                diff > 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
            )}>
                {diff > 0 ? <TrendingUp className="h-3 w-3 mr-1 mt-0.5 shrink-0" /> : <TrendingDown className="h-3 w-3 mr-1 mt-1 shrink-0" />}
                {diff > 0 ? '+' : ''}{formatCurrency(diff)}
            </span>
        );
    };
    
    return (
        <Card isHoverable className="p-4 transition-all duration-300">
            <div>
                {/* Main Content */}
                <div className="flex flex-col lg:flex-row lg:justify-between gap-2 lg:gap-6">
                    {/* Left Column - Grant Details */}
                    <div className="flex-1 lg:max-w-[80%]">
                        {/* Recipient Name with Bookmark button inline */}
                        <div className="flex items-start justify-between lg:justify-start gap-2">
                            <Link
                                to={`/recipients/${grant.recipient_id}`}
                                className="inline-flex items-start text-lg font-medium hover:text-blue-600 transition-colors gap-1.5 group"
                            >
                                <span className="inline-block">
                                    {grant.legal_name}
                                    <ArrowUpRight className="inline-block h-4 w-4 ml-1 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                                </span>
                            </Link>

                            {/* Show amount on mobile, hidden on desktop */}
                            <div className="lg:hidden flex items-center gap-3">
                                <span className="font-medium text-lg">
                                    {formatCurrency(grant.agreement_value)}
                                </span>
                                {onBookmark && (
                                    <button
                                        onClick={onBookmark}
                                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        <BookmarkPlus className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Institution */}
                        <Link
                            to={`/institutes/${grant.research_organization_name}`}
                            className="inline-flex items-start text-gray-600 hover:text-blue-600 transition-colors group"
                        >
                            <University className="inline-block flex-shrink-0 h-4 w-4 mr-1.5 mt-1" />
                            <span className="inline-block">
                                {grant.research_organization_name}
                                <ArrowUpRight className="inline-block h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                        </Link>

                        {/* Grant Title - Handle empty case */}
                        <p className="text-gray-600 flex items-start">
                            <BookMarked className={cn(
                                "flex-shrink-0 h-4 w-4 mt-1 mr-1.5",
                                !hasTitle && "text-gray-300"
                            )} />
                            <span className={cn(
                                "flex-1",
                                !hasTitle && "text-gray-400 italic"
                            )}>
                                {hasTitle 
                                    ? formatSentenceCase(grant.agreement_title_en)
                                    : "No Agreement Title Record Found"}
                            </span>
                        </p>

                        {/* Reference Number & Location - Mobile Only */}
                        <div className="flex flex-col lg:hidden text-sm text-gray-500 pt-1">
                            <div className="flex items-start">
                                <Database className="flex-shrink-0 h-3 w-3 mr-1.5 mt-1" />
                                {grant.ref_number} • {grant.org}
                            </div>
                            <div className="flex items-start mt-1">
                                {(grant.city &&
                                    grant.city.toUpperCase() !== "N/A") ||
                                (grant.province &&
                                    grant.province.toUpperCase() !== "N/A") ||
                                (grant.country &&
                                    grant.country.toUpperCase() !== "N/A") ? (
                                    <MapPin className="inline-block h-3 w-3 mr-1 mt-1" />
                                ) : null}
                                <span>
                                    {grant.city &&
                                        grant.city.toUpperCase() !== "N/A" && (
                                            <>
                                                {grant.city}
                                                {(grant.province &&
                                                    grant.province.toUpperCase() !==
                                                        "N/A") ||
                                                (grant.country &&
                                                    grant.country.toUpperCase() !==
                                                        "N/A")
                                                    ? ", "
                                                    : ""}
                                            </>
                                        )}
                                    {grant.province &&
                                        grant.province.toUpperCase() !== "N/A" && (
                                            <>
                                                {grant.province}
                                                {grant.country &&
                                                grant.country.toUpperCase() !==
                                                    "N/A"
                                                    ? ", "
                                                    : ""}
                                            </>
                                        )}
                                    {grant.country &&
                                        grant.country.toUpperCase() !== "N/A" &&
                                        grant.country}
                                </span>
                                <span className="mx-2">•</span>
                                <Calendar className="flex-shrink-0 h-3 w-3 mr-1.5 mt-1" />
                                <span>
                                    {formatDate(grant.agreement_start_date)}
                                </span>
                            </div>
                        </div>

                        {/* Reference Number - Desktop Only */}
                        <div className="hidden lg:block">
                            <p className="text-sm text-gray-500 flex items-center">
                                <Database className="inline-block h-3 w-3 ml-0.5 mr-1.5" />
                                <span>{grant.ref_number}</span>
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Hidden on mobile */}
                    <div className="hidden lg:block text-right">
                        <div className="flex items-center justify-end gap-2">
                            <p className="font-medium text-lg">
                                {formatCurrency(grant.agreement_value)}
                            </p>
                            {onBookmark && (
                                <button
                                    onClick={onBookmark}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    <BookmarkPlus className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <p className="text-gray-600">{grant.org}</p>
                        <p className="text-sm text-gray-500 flex justify-end items-center">
                            {(grant.city && grant.city.toUpperCase() !== "N/A") ||
                            (grant.province &&
                                grant.province.toUpperCase() !== "N/A") ||
                            (grant.country &&
                                grant.country.toUpperCase() !== "N/A") ? (
                                <MapPin className="inline-block h-3 w-3 mr-1" />
                            ) : null}
                            <span>
                                {grant.city &&
                                    grant.city.toUpperCase() !== "N/A" && (
                                        <>
                                            {grant.city}
                                            {(grant.province &&
                                                grant.province.toUpperCase() !==
                                                    "N/A") ||
                                            (grant.country &&
                                                grant.country.toUpperCase() !==
                                                    "N/A")
                                                ? ", "
                                                : ""}
                                        </>
                                    )}
                                {grant.province &&
                                    grant.province.toUpperCase() !== "N/A" && (
                                        <>
                                            {grant.province}
                                            {grant.country &&
                                            grant.country.toUpperCase() !== "N/A"
                                                ? ", "
                                                : ""}
                                        </>
                                    )}
                                {grant.country &&
                                    grant.country.toUpperCase() !== "N/A" &&
                                    grant.country}
                            </span>
                        </p>
                        <div className="text-sm text-gray-500 flex justify-end items-center gap-2">
                            <span>{formatDate(grant.agreement_start_date)}</span>
                            <span className="w-0.5 h-3 bg-gray-200"></span>
                            <span>{formatDate(grant.agreement_end_date)}</span>
                        </div>
                    </div>
                </div>
                
                {/* Amendment History Badge - Always visible if amendments exist */}
                {hasAmendments && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        <button 
                            onClick={() => {
                                setIsExpanded(true);
                                setActiveTab('versions');
                            }}
                            className="inline-flex items-center bg-blue-50 hover:bg-blue-100 transition-colors text-blue-700 text-xs font-medium rounded-full px-2.5 py-1"
                        >
                            <History className="h-3 w-3 mr-1" />
                            {amendmentNumber > 0 ? `Latest Amendment: ${amendmentNumber}` : 'Original'} • {sortedAmendments.length} versions
                        </button>
                        
                        {/* Show funding change if available */}
                        {sortedAmendments.length > 1 && amendmentNumber > 0 && (
                            <div className="inline-flex items-center text-xs font-medium rounded-full px-2.5 py-1">
                                {(() => {
                                    // Find the previous amendment
                                    const currentAmendment = sortedAmendments.find(a => a.amendment_number === String(amendmentNumber));
                                    const previousIndex = sortedAmendments.findIndex(a => a.amendment_number === String(amendmentNumber)) + 1;
                                    const previousAmendment = previousIndex < sortedAmendments.length ? sortedAmendments[previousIndex] : null;
                                    
                                    if (currentAmendment && previousAmendment) {
                                        const valueDiff = currentAmendment.agreement_value - previousAmendment.agreement_value;
                                        
                                        if (valueDiff !== 0) {
                                            return (
                                                <span className={cn(
                                                    "inline-flex items-center",
                                                    valueDiff > 0 
                                                        ? "bg-green-50 text-green-700" 
                                                        : "bg-amber-50 text-amber-700"
                                                )}>
                                                    {valueDiff > 0 ? (
                                                        <TrendingUp className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <TrendingDown className="h-3 w-3 mr-1" />
                                                    )}
                                                    {valueDiff > 0 ? '+' : ''}{formatCurrency(valueDiff)}
                                                </span>
                                            );
                                        }
                                    }
                                    return null;
                                })()}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Expand/Collapse Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 flex w-full items-center justify-center p-1 text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <ChevronDown 
                        className={cn(
                            "h-5 w-5 transition-transform duration-200",
                            isExpanded && "transform rotate-180"
                        )} 
                    />
                    <span className="ml-1">{isExpanded ? "Show Less" : "Show More"}</span>
                </button>
                
                {/* Expanded Content */}
                <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isExpanded 
                        ? "opacity-100 max-h-[2000px] mt-2 lg:mt-4 pt-2 border-t" 
                        : "opacity-0 max-h-0"
                )}>
                    {/* Tabs */}
                    <div className="border-b mb-4">
                        <div className="flex -mb-px">
                            <button 
                                className={cn(
                                    "px-2 lg:px-4 py-1 lg:py-2 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === 'details'
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                                onClick={() => setActiveTab('details')}
                            >
                                <span className="flex items-start">
                                    <FileText className="h-4 w-4 mr-1.5 mt-0.5 shrink-0" />
                                    <span className="mr-1 hidden lg:flex">Grant</span>
                                    <span>Details</span>
                                </span>
                            </button>
                            
                            {hasAmendments && (
                                <button 
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                        activeTab === 'versions'
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    )}
                                    onClick={() => setActiveTab('versions')}
                                >
                                    <span className="flex items-start">
                                        <History className="h-4 w-4 mr-1.5 mt-0.5 shrink-0" />
                                        <span className="mr-1 hidden lg:flex">Version</span>
                                        <span>History</span>
                                    </span>
                                </button>
                            )}
                            
                            <button 
                                className={cn(
                                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === 'funding'
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                                onClick={() => setActiveTab('funding')}
                            >
                                <span className="flex items-start">
                                    <LineChart className="h-4 w-4 mr-1.5 mt-0.5 shrink-0" />
                                    Funding Timeline
                                </span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="p-1">
                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Reference Info */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                            <FileText className="h-4 w-4 mr-1.5" />
                                            Grant Information
                                        </h3>
                                        <div className="text-sm space-y-2 pl-6">
                                            <p className="flex">
                                                <span className="text-gray-500 w-32">Reference Number:</span>
                                                <span className="text-gray-700 font-medium">{grant.ref_number}</span>
                                            </p>
                                            
                                            <p className="flex">
                                                <span className="text-gray-500 w-32">Current Version:</span>
                                                <span className={amendmentNumber > 0 ? 'text-amber-600 font-medium' : 'text-gray-700'}>
                                                    {amendmentNumber > 0 ? `Amendment ${amendmentNumber}` : "Original Agreement"}
                                                </span>
                                            </p>
                                            
                                            <p className="flex">
                                                <span className="text-gray-500 w-32">Program:</span>
                                                <span className="text-gray-700">{formatSentenceCase(grant.agreement_title_en)}</span>
                                            </p>
                                                                                
                                            {grant.amendment_date && (
                                                <p className="flex">
                                                    <span className="text-gray-500 w-32">Amendment Date:</span>
                                                    <span className="text-gray-700">{formatDate(grant.amendment_date)}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Timeline */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                            <CalendarDays className="h-4 w-4 mr-1.5" />
                                            Timeline
                                        </h3>
                                        <div className="text-sm space-y-2 pl-6">
                                            <p className="flex">
                                                <span className="text-gray-500 w-32">Start Date:</span>
                                                <span className="text-gray-700">{formatDate(grant.agreement_start_date)}</span>
                                            </p>
                                            
                                            <p className="flex">
                                                <span className="text-gray-500 w-32">End Date:</span>
                                                <span className="text-gray-700">{formatDate(grant.agreement_end_date)}</span>
                                            </p>
                                            
                                            <p className="flex">
                                                <span className="text-gray-500 w-32">Duration:</span>
                                                <span className="text-gray-700">
                                                    {(() => {
                                                        try {
                                                            // Calculate duration in months
                                                            const start = new Date(grant.agreement_start_date);
                                                            const end = new Date(grant.agreement_end_date);
                                                            const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
                                                            const years = Math.floor(diffMonths / 12);
                                                            const months = diffMonths % 12;
                                                            
                                                            if (years > 0 && months > 0) {
                                                                return `${years} ${years === 1 ? 'year' : 'years'} and ${months} ${months === 1 ? 'month' : 'months'}`;
                                                            } else if (years > 0) {
                                                                return `${years} ${years === 1 ? 'year' : 'years'}`;
                                                            } else {
                                                                return `${months} ${months === 1 ? 'month' : 'months'}`;
                                                            }
                                                        } catch (e) {
                                                            return "Unknown";
                                                        }
                                                    })()}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Location */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                            <Globe className="h-4 w-4 mr-1.5" />
                                            Location
                                        </h3>
                                        <div className="text-sm space-y-2 pl-6">
                                            <p className="flex">
                                                <span className="text-gray-500 w-32">Country:</span>
                                                <span className={cn(
                                                    (grant.country && grant.country.toUpperCase() !== "N/A") ? "text-gray-700" : "text-gray-400 italic"
                                                )}>
                                                    {(grant.country && grant.country.toUpperCase() !== "N/A") ? grant.country : "Not specified"}
                                                </span>
                                            </p>
                                            
                                            <p className="flex">
                                                <span className="text-gray-500 w-32">Province/State:</span>
                                                <span className={cn(
                                                    (grant.province && grant.province.toUpperCase() !== "N/A") ? "text-gray-700" : "text-gray-400 italic"
                                                )}>
                                                    {(grant.province && grant.province.toUpperCase() !== "N/A") ? grant.province : "Not specified"}
                                                </span>
                                            </p>
                                            
                                            <p className="flex">
                                                <span className="text-gray-500 w-32">City:</span>
                                                <span className={cn(
                                                    (grant.city && grant.city.toUpperCase() !== "N/A") ? "text-gray-700" : "text-gray-400 italic"
                                                )}>
                                                    {(grant.city && grant.city.toUpperCase() !== "N/A") ? grant.city : "Not specified"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Financial Summary */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                            <DollarSign className="h-4 w-4 mr-1.5" />
                                            Financial Information
                                        </h3>
                                        <div className="text-sm space-y-2 pl-6">
                                            <p className="flex items-center">
                                                <span className="text-gray-500 w-32">Current Value:</span>
                                                <span className="text-gray-700 font-medium">{formatCurrency(grant.agreement_value)}</span>
                                                {hasAmendments && sortedAmendments.length > 1 && 
                                                    renderChangeIndicator(
                                                        grant.agreement_value, 
                                                        sortedAmendments[sortedAmendments.length - 1].agreement_value
                                                    )
                                                }
                                            </p>
                                            
                                            <p className="flex">
                                                <span className="text-gray-500 w-32">Funding Agency:</span>
                                                <span className="text-gray-700">{grant.org} {grant.owner_org_title ? `(${grant.owner_org_title})` : ""}</span>
                                            </p>
                                            
                                            {hasForeignCurrency && (
                                                <p className="flex">
                                                    <span className="text-gray-500 w-32">Foreign Currency:</span>
                                                    <span className="text-gray-700">
                                                        {grant.foreign_currency_type} {grant.foreign_currency_value?.toLocaleString()}
                                                    </span>
                                                </p>
                                            )}
                                            
                                            {hasAmendments && sortedAmendments.length > 1 && (
                                                <p className="flex">
                                                    <span className="text-gray-500 w-32">Original Value:</span>
                                                    <span className="text-gray-700">{formatCurrency(sortedAmendments[sortedAmendments.length - 1].agreement_value)}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {hasDescription && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                                <FileEdit className="h-4 w-4 mr-1.5" />
                                                Description
                                            </h3>
                                            <div className="text-sm text-gray-700 space-y-2 pl-6">
                                                <p>{grant.description_en}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Expected Results */}
                                    {hasExpectedResults && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1.5" />
                                                Expected Results
                                            </h3>
                                            <div className="text-sm text-gray-700 space-y-2 pl-6">
                                                <p>{grant.expected_results_en}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Version History Tab */}
                        {activeTab === 'versions' && hasAmendments && (
                            <div>
                                {/* Timeline header */}
                                <div className="mb-6 bg-gray-50 p-3 lg:p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Layers className="h-4 w-4 mr-1.5" />
                                        Version Timeline
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2 lg:gap-4 text-center">
                                        <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                            <h4 className="text-xs lg:text-sm font-medium text-gray-500 mb-1">Total Versions</h4>
                                            <p className="text-sm lg:text-md font-semibold text-gray-900">{sortedAmendments.length}</p>
                                        </div>
                                        {sortedAmendments.length > 1 && (
                                            <>
                                                <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                                    <h4 className="text-xs lg:text-sm font-medium text-gray-500 mb-1">First Version</h4>
                                                    <p className="text-sm lg:text-md font-semibold text-gray-900">{formatDate(sortedAmendments[sortedAmendments.length-1].agreement_start_date)}</p>
                                                </div>
                                                <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                                    <h4 className="text-xs lg:text-sm font-medium text-gray-500 mb-1">Latest Version</h4>
                                                    <p className="text-sm lg:text-md font-semibold text-gray-900">{formatDate(sortedAmendments[0].amendment_date || sortedAmendments[0].agreement_start_date)}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Visualization of amendment timeline */}
                                <div className="relative pt-4 lg:pt-6 pb-4">
                                    {/* Timeline line */}
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                    
                                    {/* Amendment entries */}
                                    <div className="space-y-6 lg:space-y-8">
                                        {sortedAmendments.map((amendment, index) => (
                                            <div key={amendment.amendment_number} className="relative pl-12 lg:pl-16">
                                                {/* Timeline dot */}
                                                <div className={cn(
                                                    "absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                    amendment.amendment_number === "0"
                                                        ? "border-blue-500 bg-white"
                                                        : "border-amber-500 bg-white"
                                                )}>
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        amendment.amendment_number === "0"
                                                            ? "bg-blue-500"
                                                            : "bg-amber-500"
                                                    )}></div>
                                                </div>
                                                
                                                {/* Amendment card */}
                                                <div className="bg-white border rounded-lg shadow-sm">
                                                    <div className="p-3 lg:p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className={cn(
                                                                    "text-sm font-medium",
                                                                    amendment.amendment_number === "0"
                                                                        ? "text-blue-600"
                                                                        : "text-amber-600"
                                                                )}>
                                                                    {amendment.amendment_number === "0" 
                                                                        ? "Original Agreement" 
                                                                        : `Amendment ${amendment.amendment_number}`}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {amendment.amendment_date 
                                                                        ? formatDate(amendment.amendment_date) 
                                                                        : formatDate(amendment.agreement_start_date)}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium">
                                                                    {formatCurrency(amendment.agreement_value)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Changes from previous version */}
                                                    {index < sortedAmendments.length - 1 && (
                                                        <div className="border-t px-4 py-3 bg-gray-50 rounded-b-lg">
                                                            <p className="text-xs font-medium text-gray-600 mb-2">
                                                                Registered changes from previous version:
                                                            </p>
                                                            <div className="space-y-2 text-sm">
                                                                {/* Amount change */}
                                                                {amendment.agreement_value !== sortedAmendments[index + 1].agreement_value && (
                                                                    <div className="flex items-start">
                                                                        <CornerDownRight className="h-3 w-3 mr-2 mt-1 shrink-0 text-gray-400" />
                                                                        <span className="text-gray-600">
                                                                            Funding changed from 
                                                                            <span className="font-medium mx-1">
                                                                                {formatCurrency(sortedAmendments[index + 1].agreement_value)}
                                                                            </span>
                                                                            to
                                                                            <span className={cn(
                                                                                "font-medium mx-1",
                                                                                amendment.agreement_value > sortedAmendments[index + 1].agreement_value
                                                                                    ? "text-green-600"
                                                                                    : "text-amber-600"
                                                                            )}>
                                                                                {formatCurrency(amendment.agreement_value)}
                                                                                {amendment.agreement_value > sortedAmendments[index + 1].agreement_value 
                                                                                    ? ` (+${formatCurrency(amendment.agreement_value - sortedAmendments[index + 1].agreement_value)})` 
                                                                                    : ` (-${formatCurrency(sortedAmendments[index + 1].agreement_value - amendment.agreement_value)})`}
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* End date change */}
                                                                {amendment.agreement_end_date !== sortedAmendments[index + 1].agreement_end_date && (
                                                                    <div className="flex items-start">
                                                                        <CornerDownRight className="h-3 w-3 mr-2 mt-1 shrink-0  text-gray-400" />
                                                                        <span className="text-gray-600">
                                                                            End date extended from 
                                                                            <span className="font-medium mx-1">
                                                                                {formatDate(sortedAmendments[index + 1].agreement_end_date)}
                                                                            </span>
                                                                            to
                                                                            <span className="font-medium mx-1">
                                                                                {formatDate(amendment.agreement_end_date)}
                                                                            </span>
                                                                            ({formatDateDiff(sortedAmendments[index + 1].agreement_end_date, amendment.agreement_end_date)})
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Funding Timeline Tab */}
                        {activeTab === 'funding' && (
                            <div>
                                {/* Funding summary header */}
                                <div className="mb-6 bg-gray-50 p-3 lg:p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-start">
                                        <LineChart className="h-4 w-4 mr-1.5 mt-0.5 shrink-0" />
                                        Funding Overview
                                    </h3>
                                    
                                    {hasAmendments && sortedAmendments.length > 1 ? (
                                        <div className="grid grid-cols-3 gap-2 lg:gap-4 lg:text-sm text-center">
                                            <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                                <p className="text-gray-500 text-xs">Original Value</p>
                                                <p className="text-gray-900 font-medium text-md lg:text-lg">
                                                    {formatCurrency(sortedAmendments[sortedAmendments.length - 1].agreement_value)}
                                                </p>
                                            </div>
                                            <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                                <p className="text-gray-500 text-xs">Current Value</p>
                                                <p className="text-gray-900 font-medium text-md lg:text-lg">
                                                    {formatCurrency(grant.agreement_value)}
                                                </p>
                                            </div>
                                            <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                                <p className="text-gray-500 text-xs">Total Change</p>
                                                <p className={cn(
                                                    "font-medium text-md lg:text-lg",
                                                    grant.agreement_value > sortedAmendments[sortedAmendments.length - 1].agreement_value
                                                        ? "text-green-600" 
                                                        : grant.agreement_value < sortedAmendments[sortedAmendments.length - 1].agreement_value
                                                            ? "text-amber-600"
                                                            : "text-gray-900"
                                                )}>
                                                    {grant.agreement_value !== sortedAmendments[sortedAmendments.length - 1].agreement_value ? (
                                                        grant.agreement_value > sortedAmendments[sortedAmendments.length - 1].agreement_value ? (
                                                            <>+{formatCurrency(grant.agreement_value - sortedAmendments[sortedAmendments.length - 1].agreement_value)}</>
                                                        ) : (
                                                            <>-{formatCurrency(sortedAmendments[sortedAmendments.length - 1].agreement_value - grant.agreement_value)}</>
                                                        )
                                                    ) : (
                                                        <>No change</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-sm text-gray-500 py-4">
                                            <p>No amendment history available for this grant.</p>
                                            <p>Current value: {formatCurrency(grant.agreement_value)}</p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Funding visualization */}
                                {hasAmendments && sortedAmendments.length > 1 && (
                                    <div className="mt-6">
                                        
                                        {/* Simple visual timeline representing funding changes */}
                                        <div className="relative h-48 my-6">
                                            {/* Render a simple bar chart showing funding changes */}
                                            {fundingChartData.map((item, index) => {
                                                const maxValue = Math.max(...fundingChartData.map(d => d.value));
                                                const barHeight = (item.value / maxValue) * 100;
                                                const barWidth = 100 / fundingChartData.length;
                                                
                                                return (
                                                    <div 
                                                        key={index} 
                                                        className="absolute bottom-0 group" 
                                                        style={{
                                                            left: `${index * barWidth}%`,
                                                            width: `${barWidth}%`,
                                                            height: `${barHeight}%`,
                                                            minHeight: '10%'
                                                        }}
                                                    >
                                                        <div 
                                                            className={cn(
                                                                "w-full h-full rounded-t transition-all duration-200 group-hover:opacity-90",
                                                                item.version === "Original" 
                                                                    ? "bg-blue-500" 
                                                                    : index === fundingChartData.length - 1 
                                                                        ? "bg-green-500" 
                                                                        : "bg-amber-500"
                                                            )}
                                                            style={{
                                                                opacity: 0.6 + (index / fundingChartData.length) * 0.4
                                                            }}
                                                        ></div>
                                                        
                                                        {/* Label */}
                                                        <div className="text-center mt-2 text-xs text-gray-600">
                                                            <div 
                                                                className={cn(
                                                                    "font-medium",
                                                                    item.version === "Original" 
                                                                        ? "text-blue-700" 
                                                                        : index === fundingChartData.length - 1 
                                                                            ? "text-green-700" 
                                                                            : "text-amber-700"
                                                                )}
                                                            >
                                                                {item.version}
                                                            </div>
                                                            <div className="text-gray-500 mt-1">{formatShortCurrency(item.value)}</div>
                                                        </div>
                                                        
                                                        {/* Tooltip */}
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-white shadow-lg rounded border border-gray-200 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                                            <div className="text-sm">
                                                                <p className="font-medium">{item.version}</p>
                                                                <p className="text-gray-600">Value: {formatCurrency(item.value)}</p>
                                                                <p className="text-gray-600">Date: {formatDate(item.date)}</p>
                                                                {index > 0 && (
                                                                    <p className={cn(
                                                                        "mt-1",
                                                                        item.value > fundingChartData[index - 1].value 
                                                                            ? "text-green-600" 
                                                                            : item.value < fundingChartData[index - 1].value 
                                                                                ? "text-amber-600" 
                                                                                : "text-gray-600"
                                                                    )}>
                                                                        Change: {
                                                                            item.value > fundingChartData[index - 1].value 
                                                                                ? "+" + formatCurrency(item.value - fundingChartData[index - 1].value)
                                                                                : item.value < fundingChartData[index - 1].value
                                                                                    ? "-" + formatCurrency(fundingChartData[index - 1].value - item.value)
                                                                                    : "No change"
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            
                                            {/* Baseline */}
                                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                                        </div>
                                        
                                        {/* Legend */}
                                        <div className="flex justify-center space-x-6 mt-20">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                                                <span className="text-sm text-gray-600">Original</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
                                                <span className="text-sm text-gray-600">Amendments</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                                                <span className="text-sm text-gray-600">Current</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
