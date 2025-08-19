import React from "react";
import GaugeChart from "./GaugeChart";

type TalliesPerEval = {
    [evaluationId: number]: {
        activeLearningPercentage?: number;
    };
};

interface Props {
    evaluations: { id: number; name?: string; evaluation_type: string }[];
    evaluationTallies: TalliesPerEval;
    totalActiveLearningPercentage?: number; // from API
}

const CopusActiveSummary: React.FC<Props> = ({evaluations, evaluationTallies, totalActiveLearningPercentage = 0}) => {
    // choose a color by percentage
    const pick = (v: number) => (v < 40 ? "#ef4444" : v < 70 ? "#facc15" : "#22c55e");

    return (
        <div className="w-full rounded-xl border p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-4">
                    <GaugeChart value={totalActiveLearningPercentage} label="Active Learning % (Overall)"
                                color={pick(totalActiveLearningPercentage)}/>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                    {evaluations.map((ev, idx) => {
                        const v = evaluationTallies[ev.id]?.activeLearningPercentage ?? 0;
                        return (
                            <GaugeChart
                                key={ev.id}
                                value={v}
                                label={`${ev.name || `COPUS ${idx + 1}`}`}
                                color={pick(v)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CopusActiveSummary;