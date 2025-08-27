import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface GaugeChartProps {
    value: number; // 0-100
    label?: string;
    color?: string;
    onRendered?: (img: string) => void;
}


const GaugeChart = forwardRef<any, GaugeChartProps>(({ value, label = "Active Learning %", color = "#4ECDC4", onRendered }, ref) => {
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

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        cutout: "80%",
    };

    // Ref to Chart.js instance
    const chartRef = useRef<any>(null);

    // Expose Chart.js instance methods to parent via ref
    useImperativeHandle(ref, () => ({
        toBase64Image: () => chartRef.current?.toBase64Image?.(),
        getChart: () => chartRef.current?.chartInstance || chartRef.current?.chart,
    }), []);

    // Chart.js onAfterRender callback
    const chartOptions = {
        ...options,
        plugins: {
            ...options.plugins,
            onAfterRender: (chart: any) => {
                if (onRendered && chart) {
                    const img = chart.toBase64Image();
                    onRendered(img);
                }
            },
        },
    };

    return (
        <div className="relative flex flex-col items-center justify-center w-48 h-28">
            <Doughnut ref={chartRef} data={data} options={chartOptions} width={192} height={112} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="text-3xl font-bold text-black drop-shadow-lg">{formattedValue}%</span>
                <span className="text-xs text-gray-700 mt-1">{label}</span>
            </div>
        </div>
    );
});

export default GaugeChart;
