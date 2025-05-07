import React from "react";
import { Line, Pie, Bar } from "react-chartjs-2";

interface PlotChartProps {
  type: "line" | "pie" | "bar";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}

const PlotChart: React.FC<PlotChartProps> = ({ type, data, options }) => {
  let chartRender = null;

  if (type === "line") {
    chartRender = <Line data={data} options={options} />;
  } else if (type === "pie") {
    chartRender = <Pie data={data} options={options} />;
  } else if (type === "bar") {
    chartRender = <Bar data={data} options={options} />;
  }

  return <div>{chartRender}</div>;
};

export default PlotChart;
