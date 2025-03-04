// src/components/features/recipients/RecipientStats.tsx
// Recipient Stats Section
import { ResearchGrant } from '@/types/models';
import { StatCard } from '@/components/common/ui/StatCard';
import { BookMarked, DollarSign, Users, Calendar, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/common/ui/Card';
import { cn } from '@/utils/cn';

interface RecipientStatsProps {
    recipient: any;
    processedGrants: ResearchGrant[];
    agencies: string[];
    expandedStats: boolean;
    setExpandedStats: (expanded: boolean) => void;
}

const RecipientStats = ({
    recipient,
    processedGrants,
    agencies,
    expandedStats,
    setExpandedStats,
}: RecipientStatsProps) => {
    // Calculate stats
    const uniqueGrantCount = processedGrants.length;
    const totalFunding = processedGrants.reduce(
        (sum, grant) => sum + grant.agreement_value,
        0
    );
    const totalYears =
        recipient.latest_grant_date && recipient.first_grant_date
            ? new Date(recipient.latest_grant_date).getFullYear() -
              new Date(recipient.first_grant_date).getFullYear() +
              1
            : 0;
    const averagePerYear = totalYears > 0 ? totalFunding / totalYears : 0;
    const averageGrantValue =
        uniqueGrantCount > 0 ? totalFunding / uniqueGrantCount : 0;

    return (
        <div className="px-3 lg:px-6 py-4 bg-gray-50 rounded-b-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={BookMarked}
                    label="Unique Grants"
                    value={uniqueGrantCount}
                />
                <StatCard
                    icon={DollarSign}
                    label="Total Funding"
                    value={formatCurrency(totalFunding)}
                />
                <StatCard
                    icon={Users}
                    label="Average Grant"
                    value={
                        uniqueGrantCount
                            ? formatCurrency(averageGrantValue)
                            : "N/A"
                    }
                />
                <StatCard
                    icon={Calendar}
                    label="Active Period"
                    value={
                        recipient.first_grant_date &&
                        recipient.latest_grant_date
                            ? `${new Date(
                                  recipient.first_grant_date
                              ).getFullYear()} - ${new Date(
                                  recipient.latest_grant_date
                              ).getFullYear()}`
                            : "N/A"
                    }
                />

                {/* Expandable extra stats */}
                <AnimatePresence>
                    {expandedStats && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <StatCard
                                    icon={DollarSign}
                                    label="Annual Average"
                                    value={formatCurrency(averagePerYear)}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.2, delay: 0.05 }}
                            >
                                <StatCard
                                    icon={BookMarked}
                                    label="Funding Agencies"
                                    value={
                                        recipient.funding_agencies_count ||
                                        agencies.length
                                    }
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="col-span-2 md:col-span-2"
                            >
                                <Card className="bg-white p-3 lg:p-4 rounded-lg border border-gray-100 shadow-sm h-full">
                                    <div className="flex items-center text-gray-600 text-sm mb-1">
                                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                        <span>Duration Range</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-lg font-bold text-gray-900">
                                            {processedGrants.length > 0
                                                ? (() => {
                                                      // Find min and max durations
                                                      const durations =
                                                          processedGrants
                                                              .map((grant) => {
                                                                  const start =
                                                                      new Date(
                                                                          grant.agreement_start_date
                                                                      );
                                                                  const end =
                                                                      new Date(
                                                                          grant.agreement_end_date
                                                                      );
                                                                  return Math.round(
                                                                      (end.getTime() -
                                                                          start.getTime()) /
                                                                          (1000 *
                                                                              60 *
                                                                              60 *
                                                                              24 *
                                                                              30)
                                                                  ); // Approx. months
                                                              })
                                                              .sort(
                                                                  (a, b) =>
                                                                      a - b
                                                              );

                                                      const min = durations[0];
                                                      const max =
                                                          durations[
                                                              durations.length -
                                                                  1
                                                          ];

                                                      if (min === max) {
                                                          return `${min} months`;
                                                      } else {
                                                          return `${min} - ${max} months`;
                                                      }
                                                  })()
                                                : "N/A"}
                                        </span>
                                    </div>
                                </Card>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Toggle button for expanded stats */}
            <button
                onClick={() => setExpandedStats(!expandedStats)}
                className="w-full flex items-center justify-center mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
                <span>{expandedStats ? "Show Less" : "Show More Stats"}</span>
                <ChevronDown
                    className={cn(
                        "ml-1 h-4 w-4 transition-transform",
                        expandedStats && "transform rotate-180"
                    )}
                />
            </button>
        </div>
    );
};

export default RecipientStats;