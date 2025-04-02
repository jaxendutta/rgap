// src/pages/AnalyticsPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  DotProps,
} from "recharts";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import { Card } from "@/components/common/ui/Card";
import Button from "@/components/common/ui/Button";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import { Activity } from "lucide-react";
import portConfig from "../../../config/ports.json";  // <-- for usage like AuthPage

interface FundingComparison {
  year: number;
  funding_agency: string; 
  total_grants: number;
  total_funding: number;
  avg_funding: number;
  funding_rank: number;
  is_outlier?: number; 
}

interface HistogramBin {
  bin_range: string;      
  bin_count: number;      
  is_outlier_bin: number; 
}

interface CustomDotProps extends DotProps {
  payload?: Record<string, any>;
}

export default function AnalyticsPage() {
  const { showNotification } = useNotification();

  // States
  const [comparisonsData, setComparisonsData] = useState<FundingComparison[]>([]);
  const [histogramData, setHistogramData] = useState<HistogramBin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bins, setBins] = useState(10);
  const [selectedYear, setSelectedYear] = useState("All");

  // 1) Fetch advanced comparisons
  const fetchComparisons = async () => {
    try {
      setLoading(true);
      const baseurl =
        process.env.VITE_API_URL ||
        `http://localhost:${portConfig.defaults.server}`;
      // Use same style as AuthPage for the fetch
      const response = await fetch(`${baseurl}/analytics/funding-comparisons`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch funding comparisons");
      }
      setComparisonsData(data);
    } catch (err: any) {
      setError(err.message);
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 2) Fetch histogram data
  const fetchHistogram = async () => {
    try {
      setLoading(true);
      const baseurl =
        process.env.VITE_API_URL ||
        `http://localhost:${portConfig.defaults.server}`;
      // As above, incorporate bins
      const response = await fetch(`${baseurl}/analytics/grant-histogram?bins=${bins}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch histogram data");
      }
      setHistogramData(data);
    } catch (err: any) {
      setError(err.message);
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // On mount, fetch both sets of data
  useEffect(() => {
    fetchComparisons();
    fetchHistogram();
    // eslint-disable-next-line
  }, []);

  // Re-fetch histogram if bins changes
  useEffect(() => {
    fetchHistogram();
    // eslint-disable-next-line
  }, [bins]);

  // Build unique years for the dropdown
  const years = useMemo(() => {
    const unique = new Set<string>();
    comparisonsData.forEach((item) => unique.add(String(item.year)));
    return ["All", ...Array.from(unique).sort()];
  }, [comparisonsData]);

  // Transform data for line chart
  const lineData = useMemo(() => {
    let filtered = comparisonsData;
    if (selectedYear !== "All") {
      filtered = comparisonsData.filter((item) => String(item.year) === selectedYear);
    }
    const yearMap = new Map<number, any>();
    filtered.forEach((row) => {
      const y = row.year;
      if (!yearMap.has(y)) {
        yearMap.set(y, { year: y });
      }
      const yearObj = yearMap.get(y);
      const agency = row.funding_agency;
      if (agency === "NSERC" || agency === "CIHR" || agency === "SSHRC") {
        yearObj[agency] = row.total_funding;
        yearObj[`${agency}_outlier`] = row.is_outlier || 0;
      }
    });
    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
  }, [comparisonsData, selectedYear]);

  console.log("lineData", lineData);

  const AGENCY_COLORS: Record<string, string> = {
    NSERC: "#2563eb",
    CIHR: "#059669",
    SSHRC: "#7c3aed",
  };

  function customDotOutlierOnly(agency: string) {
    return function Dot(props: CustomDotProps): React.ReactElement<SVGElement> {
      const { cx, cy, payload } = props;
      if (cx === undefined || cy === undefined) {
        return <circle cx={0} cy={0} r={0} fill="none" />;
      }
      const outlierKey = `${agency}_outlier`;
      const isOutlier = payload && payload[outlierKey] === 1;
      if (!isOutlier) {
        // Return an invisible dot for non-outlier points.
        return <circle cx={cx} cy={cy} r={0} fill="none" />;
      }
      // For outliers, always use red
      return <circle cx={cx} cy={cy} r={6} fill="red" />;
    };
  }
  
  


  function BinRangeTick(props: any) {
    const { x, y, payload } = props;
    // payload.value => "0.00 - 5,040,000.00"
    
    // Let’s parse your label to something shorter:
    const shortLabel = shortenRangeLabel(payload.value);
  
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#666"
          transform="rotate(-30)"
        >
          {shortLabel}
        </text>
      </g>
    );
  }
  
  function shortenRangeLabel(label: string) {
    // For example, you might parse each numeric part and convert to M
    // This is just a simple example:
    const parts = label.split(" - ");
    if (parts.length === 2) {
      const [start, end] = parts;
      return `${toMillions(start)} - ${toMillions(end)}`;
    }
    return label;
  }
  
  function toMillions(str: string) {
    const num = parseFloat(str.replace(/,/g, "")) || 0;
    return (num / 1_000_000).toFixed(2) + "M";
  }

  return (
    <PageContainer>
      <PageHeader
        title="Advanced Analytics"
        subtitle="Visualize agency funding comparisons and grant value distributions"
      />

      {/* If loading or error, we show messages inside the container rather than returning early */}
      {loading ? (
        <div className="p-6 text-gray-500">Fetching analytics data...</div>
      ) : error ? (
        <div className="p-6 text-red-600">
          {error}
          <div className="mt-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Year Selector */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-gray-700">Select Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* 1) Funding Comparisons (Line Chart) */}
          <Card className="mb-6">
            <Card.Header
              title="Funding Comparisons"
              subtitle="Line chart of total funding by year and agency"
            />
            <Card.Content>
              {lineData.length > 0 ? (
                <div style={{ width: "100%", height: 400 }}>
                  <ResponsiveContainer>
                    <LineChart 
                      data={lineData}
                      margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis
                        tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
                        domain={[
                          0,
                          (dataMax: number) => dataMax * 3.2, // 20% above largest data
                        ]}
                      />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      {["NSERC", "CIHR", "SSHRC"].map((agency) => (
                        <Line
                          key={agency}
                          type="monotone"
                          dataKey={agency}
                          stroke={AGENCY_COLORS[agency]}
                          dot={customDotOutlierOnly(agency)}
                          activeDot={{ r: 5 }}
                          strokeWidth={2}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-gray-500">
                  No funding comparisons data available for the selected year.
                </div>
              )}
            </Card.Content>
          </Card>

          {/* 2) Grant Value Histogram */}
          <Card>
            <Card.Header
              title="Grant Value Histogram"
              subtitle="Distribution of grant values across all data"
            />
            <Card.Content>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm">Bins:</span>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={bins}
                  onChange={(e) => setBins(parseInt(e.target.value, 10))}
                  className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
              {histogramData && histogramData.length > 0 ? (
                <div style={{ width: "100%", height: 400 }}>
                  <ResponsiveContainer>
                    <BarChart 
                      data={histogramData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bin_range"
                            tick={<BinRangeTick />}
                            interval={0} 
                            angle={-45} 
                            />
                      <YAxis />
                      <Tooltip />
                      <Legend
                        iconType="square"
                        verticalAlign="top"    
                        align="left"
                        wrapperStyle={{ marginTop: -20 }}
                      />
                      <Bar
                      dataKey="bin_count"
                      name="Number of Grants"
                      fill="#2563eb"
                      shape={(props: any) => {
                        const { fill, x, y, width, height, payload } = props;
                        const isOutlier = payload && payload.is_outlier_bin === 1;
                        // Set a minimum height value (in pixels) for very small bars.
                        const minHeight = 3;
                        const adjustedHeight = height < minHeight ? minHeight : height;
                        // Adjust the y coordinate if height is increased, so the bar stays at the bottom.
                        const adjustedY = height < minHeight ? y - (minHeight - height) : y;
                        return (
                          <rect
                            x={x}
                            y={adjustedY}
                            width={width}
                            height={adjustedHeight}
                            fill={isOutlier ? "red" : fill}
                          />
                        );
                      }}
                    />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-gray-500">No histogram data available.</div>
              )}
            </Card.Content>
          </Card>
        </>
      )}
    </PageContainer>
  );
}
