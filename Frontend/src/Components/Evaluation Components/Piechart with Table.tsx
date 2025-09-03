import React, { forwardRef } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { ActivityData } from "./Copus Matrix";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  studentTallies: Record<string, ActivityData>;
  teacherTallies: Record<string, ActivityData>;
}

const PieChartWithTable = forwardRef<any, PieChartProps>(
  ({ studentTallies, teacherTallies }, ref) => {
    // Pie data
    const studentPieData = {
      labels: Object.keys(studentTallies),
      datasets: [
        {
          label: "Student Activities",
          data: Object.values(studentTallies).map((i) => i.count),
          backgroundColor: [
            "#36A2EB",
            "#FFCE56",
            "#FF6384",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#8AC249",
            "#EA5545",
            "#F46A9B",
            "#EF9B20",
          ],
          borderWidth: 1,
        },
      ],
    };

    const teacherPieData = {
      labels: Object.keys(teacherTallies),
      datasets: [
        {
          label: "Teacher Activities",
          data: Object.values(teacherTallies).map((i) => i.count),
          backgroundColor: [
            "#B3EFFF",
            "#00C6FF",
            "#0072FF",
            "#D4FF00",
            "#A3FF00",
            "#73FF00",
            "#FFD300",
            "#FF9500",
            "#FF6200",
            "#FF2D00",
            "#FF006A",
          ],
          borderWidth: 1,
        },
      ],
    };

    const pieOptions: ChartOptions<"pie"> = {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    };

    // A row in the “Activity Summary” visual style
    const SummaryRow = ({
      label,
      count,
      pct,
    }: {
      label: string;
      count: number;
      pct: number;
    }) => (
      <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
        <span className="text-sm">{label}</span>
        <span className="text-sm tabular-nums">
          {count} times ({pct.toFixed(2)}%)
        </span>
      </div>
    );

    const SummaryBlock = ({
      title,
      data,
    }: {
      title: string;
      data: Record<string, ActivityData>;
    }) => (
      <div className="w-full max-w-md">
        <h4 className="mb-2 text-center font-semibold">{title}</h4>
        <div className="space-y-2">
          {Object.entries(data).map(([activity, v]) => (
            <SummaryRow
              key={activity}
              label={activity}
              count={v?.count ?? 0}
              pct={v?.percentage ?? 0}
            />
          ))}
        </div>
      </div>
    );

    return (
      <div className="flex flex-col justify-center gap-8 md:flex-row">
        {/* Students */}
        <div className="flex w-full flex-col items-center gap-4 md:w-1/2">
          <h3 className="text-xl font-semibold text-white">Student Doing</h3>
          <div className="w-full max-w-xs">
            <Pie ref={ref} data={studentPieData} options={pieOptions} />
          </div>

          {/* Summary-style list (replaces table) */}
          <div className="w-full rounded-xl border border-gray-600/40 bg-black/30 p-4">
            <div className="mb-3 rounded-md bg-[#1c402a]/80 px-3 py-2 text-center text-white">
              Student Activities
            </div>
            <SummaryBlock title="" data={studentTallies} />
          </div>
        </div>

        {/* Teachers */}
        <div className="flex w-full flex-col items-center gap-4 md:w-1/2">
          <h3 className="text-xl font-semibold text-white">Teacher Doing</h3>
          <div className="w-full max-w-xs">
            <Pie data={teacherPieData} options={pieOptions} />
          </div>

          {/* Summary-style list (replaces table) */}
          <div className="w-full rounded-xl border border-gray-600/40 bg-black/30 p-4">
            <div className="mb-3 rounded-md bg-[#1c402a]/80 px-3 py-2 text-center text-white">
              Teacher Activities
            </div>
            <SummaryBlock title="" data={teacherTallies} />
          </div>
        </div>
      </div>
    );
  }
);

export default PieChartWithTable;
