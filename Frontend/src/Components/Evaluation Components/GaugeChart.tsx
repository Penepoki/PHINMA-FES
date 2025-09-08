import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { Doughnut } from "react-chartjs-2";
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface GaugeChartProps {
    value: number; // 0-100
    label?: string;
    color?: string;
    textColor?: string; // ✅ NEW PROP
    onRendered?: (img: string) => void;
}

const GaugeChart = forwardRef<any, GaugeChartProps>(
    (
        {
            value,
            label = "Active Learning %",
            color = "#4ECDC4",
            textColor = "text-white", // ✅ default keeps old behavior
            onRendered,
        },
        ref,
    ) => {
    // Clamp value between 0 and 100
    const displayValue = Math.max(0, Math.min(100, value));
    const formattedValue = displayValue.toFixed(2);

    const data = {
        labels: [label, "Remaining"],
        datasets: [
            {
                data: [displayValue, 100 - displayValue],
                backgroundColor: [color, "#222C37"],
                borderWidth: 0,
                cutout: "95%",
                circumference: 180,
                rotation: 270,
            },
        ],
    };

        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {display: false},
                tooltip: {enabled: false},
            },
            cutout: "80%",
        } as const;

    const chartRef = useRef<any>(null);

        // Expose Chart.js instance methods
        useImperativeHandle(
            ref,
            () => ({
        toBase64Image: () => chartRef.current?.toBase64Image?.(),
        getChart: () => chartRef.current?.chartInstance || chartRef.current?.chart,
            }),
            [],
        );

    const chartOptions = {
        ...baseOptions,
        plugins: {
            ...baseOptions.plugins,
            onAfterRender: (chart: any) => {
                if (onRendered && chart) {
                    const img = chart.toBase64Image();
                    onRendered(img);
                }
            },
        },
    };

    return (
        <div className="relative flex h-28 w-48 flex-col items-center justify-center">
            <Doughnut ref={chartRef} data={data} options={chartOptions as any} width={192} height={112}/>
            <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                {/* ✅ Text color now controlled via prop */}
                <span className={`mt-8 text-3xl font-bold drop-shadow-lg ${textColor}`}>
            {formattedValue}%
          </span>
                <span className={`text-md ${textColor}`}>{label}</span>
            </div>
        </div>
    );
    },
);

export default GaugeChart;
