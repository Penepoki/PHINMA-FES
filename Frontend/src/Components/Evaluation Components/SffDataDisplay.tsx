import React from "react";

interface SffDataDisplayProps {
  sffData: any;
}

const SffDataDisplay: React.FC<SffDataDisplayProps> = ({ sffData }) => {
  // If sffData is an array and has all_questions, render them
  if (Array.isArray(sffData) && sffData.length > 0 && sffData[0].all_questions) {
    return (
      <div>
          <h5 className="mb-2 font-bold">{sffData[0].title}</h5>
        <p className="mb-2 text-gray-600">{sffData[0].description}</p>
        <ul className="list-decimal pl-5">
          {sffData[0].all_questions.map((q: any, idx: number) => (
            <li key={q.id || idx} className="mb-4">
              <div className="font-semibold">{q.question}</div>
              {q.type === "MCQ" && q.options && (
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {q.options.map((opt: string, cidx: number) => (
                    <li key={cidx}>{opt}</li>
                  ))}
                </ul>
              )}
              {/* Add more types as needed */}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // fallback for unexpected structure
  return <pre className="whitespace-pre-wrap">{JSON.stringify(sffData, null, 2)}</pre>;
};

export default SffDataDisplay;
