import { RecruiterBandwidth } from "../utils/dashboardData";
import { ArrowUp, ArrowDown, Award, AlertCircle } from "lucide-react";

interface RecruiterBandwidthTableProps {
  data: RecruiterBandwidth[];
  compact?: boolean;
}

export function RecruiterBandwidthTable({ data, compact = false }: RecruiterBandwidthTableProps) {
  const sortedData = [...data].sort((a, b) => b.successRate - a.successRate);

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return "text-red-600 bg-red-50";
    if (rate >= 75) return "text-amber-600 bg-amber-50";
    return "text-green-600 bg-green-50";
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Recruiter</th>
            {!compact && (
              <>
                <th className="text-center py-2 px-2 font-semibold text-gray-700">Assigned</th>
                <th className="text-center py-2 px-2 font-semibold text-gray-700">Active</th>
                <th className="text-center py-2 px-2 font-semibold text-gray-700">Final</th>
              </>
            )}
            <th className="text-center py-2 px-2 font-semibold text-gray-700">Placed</th>
            <th className="text-center py-2 px-2 font-semibold text-gray-700">Success%</th>
            <th className="text-center py-2 px-2 font-semibold text-gray-700">Capacity</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((recruiter, index) => (
            <tr
              key={recruiter.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-2 px-2">
                <div className="flex items-center gap-1">
                  {index === 0 && <Award className="h-3 w-3 text-amber-500" />}
                  <span className={`font-medium ${index === 0 ? "text-amber-700" : "text-gray-900"}`}>
                    {recruiter.name}
                  </span>
                </div>
              </td>
              {!compact && (
                <>
                  <td className="text-center py-2 px-2 text-gray-700 font-mono">
                    {recruiter.assignedCandidates}
                  </td>
                  <td className="text-center py-2 px-2 text-gray-700 font-mono">
                    {recruiter.activeInterviews}
                  </td>
                  <td className="text-center py-2 px-2 text-gray-700 font-mono">
                    {recruiter.finalRounds}
                  </td>
                </>
              )}
              <td className="text-center py-2 px-2">
                <span className="font-semibold text-green-700 font-mono">
                  {recruiter.placements}
                </span>
              </td>
              <td className="text-center py-2 px-2">
                <span className={`font-semibold font-mono ${getSuccessRateColor(recruiter.successRate)}`}>
                  {recruiter.successRate.toFixed(1)}%
                </span>
              </td>
              <td className="text-center py-2 px-2">
                <div className="flex items-center justify-center gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getUtilizationColor(recruiter.utilizationRate)}`}
                  >
                    {recruiter.utilizationRate}%
                  </span>
                  {recruiter.utilizationRate >= 90 && (
                    <AlertCircle className="h-3 w-3 text-red-600" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
