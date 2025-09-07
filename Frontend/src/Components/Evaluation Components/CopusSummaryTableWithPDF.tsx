import React, { useRef, useState, useEffect } from "react";
import CopusSummaryTable from "./CopusSummaryTable";
import CopusSummaryTablePDFButton from "./CopusSummaryTablePDFButton";
import PieChartWithTable from "./Piechart with Table";
import GaugeChart from "./GaugeChart";

interface CopusSummaryTableWithPDFProps {
  evaluations: any;
  evaluationTallies: any;
  studentOptions: string[];
  teacherOptions: string[];
  professorName?: string;
}

const CopusSummaryTableWithPDF: React.FC<CopusSummaryTableWithPDFProps> = (props) => {
  const gaugeRef = useRef<any>(null);
  const pieRef = useRef<any>(null);
  const [chartImages, setChartImages] = useState<{ gauge?: string; pie?: string }>({});
  const pdfBtnRef = useRef<HTMLButtonElement>(null);

  const handleCollectChartImages = () => {
    let pieImg: string | undefined;
    if (pieRef.current) {
      if (typeof pieRef.current.toBase64Image === "function") {
        pieImg = pieRef.current.toBase64Image();
      } else if (pieRef.current.chart && typeof pieRef.current.chart.toBase64Image === "function") {
        pieImg = pieRef.current.chart.toBase64Image();
      }
    }
    setChartImages((prev) => ({ ...prev, pie: pieImg }));
    return { pie: pieImg };
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      let gaugeImg: string | undefined;
      if (gaugeRef.current) {
        if (gaugeRef.current.chart && typeof gaugeRef.current.chart.toBase64Image === "function") {
          gaugeImg = gaugeRef.current.chart.toBase64Image();
        } else if (typeof gaugeRef.current.toBase64Image === "function") {
          gaugeImg = gaugeRef.current.toBase64Image();
        }
      }
      setChartImages((prev) => ({ ...prev, gauge: gaugeImg }));
    }, 700);
    return () => clearTimeout(timeout);
  }, [props.evaluations, props.evaluationTallies]);

  return (
    <div>
      {/* Centered PDF Button */}
      <div className="flex w-full justify-center mb-4">
        <button
          className="btn text-white btn-primary"
          onClick={() => {
            setTimeout(() => {
              handleCollectChartImages();
              setTimeout(() => {
                pdfBtnRef.current?.click();
              }, 700);
            }, 200);
          }}
        >
          Save as PDF
        </button>
      </div>

      <div style={{ display: "none" }}>
        <CopusSummaryTablePDFButton {...props} chartImages={chartImages} ref={pdfBtnRef as any} />
      </div>

      <div className="rounded-lg bg-white p-2">
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          <GaugeChart
            ref={gaugeRef}
            value={(() => {
              const copusEvals = props.evaluations.filter((e: any) =>
                ["copus_1", "copus_2", "copus_3"].includes(e.evaluation_type),
              );
              let sum = 0,
                count = 0;
              copusEvals.forEach((ev: any) => {
                const perc = props.evaluationTallies[ev.id]?.activeLearningPercentage;
                if (typeof perc === "number") {
                  sum += perc;
                  count++;
                }
              });
              return count > 0 ? sum / count : 0;
            })()}
            label="Active Learning % (Avg)"
            color="#16a34a"
            onRendered={(img: string) => {
              setChartImages((prev) => ({ ...prev, gauge: img }));
            }}
          />
          <PieChartWithTable
            ref={pieRef}
            studentTallies={(() => {
              const copusEvals = props.evaluations.filter((e: any) =>
                ["copus_1", "copus_2", "copus_3"].includes(e.evaluation_type),
              );
              if (copusEvals.length > 0) {
                return props.evaluationTallies[copusEvals[0].id]?.studentTallies || {};
              }
              return {};
            })()}
            teacherTallies={(() => {
              const copusEvals = props.evaluations.filter((e: any) =>
                ["copus_1", "copus_2", "copus_3"].includes(e.evaluation_type),
              );
              if (copusEvals.length > 0) {
                return props.evaluationTallies[copusEvals[0].id]?.teacherTallies || {};
              }
              return {};
            })()}
          />
        </div>
        <CopusSummaryTable {...props} />
      </div>
    </div>
  );
};

export default CopusSummaryTableWithPDF;
