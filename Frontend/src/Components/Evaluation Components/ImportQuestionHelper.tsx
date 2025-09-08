import React from "react";
import { QuestionData, mapTypeToFrontend } from "./CreateStudentQuestion";
import api from "../../utils/api.ts";

interface ImportQuestionProps {
  allQuestions: any[]; // Accept raw backend data
  importedQuestions: QuestionData[];
  onImport: (q: QuestionData) => void;
}

const ImportQuestionHelper: React.FC<ImportQuestionProps> = ({
  allQuestions,
  importedQuestions,
  onImport,
}) => {
  // Normalize backend questions to frontend format
  const normalizedQuestions: QuestionData[] = allQuestions.map((q) => ({
    id: q.id,
    question: q.question,
    type: mapTypeToFrontend(q.type),
    choices: q.options || [],
  }));

  // Only show questions not already imported
  const availableToImport = normalizedQuestions.filter(
      (q) => !importedQuestions.some((iq) => iq.id === q.id),
  );

  return (
    <div>
      <h4>Import Question</h4>
      <ul>
        {availableToImport.map((q) => (
          <li key={q.id}>
            {q.question} ({q.type})
              <button onClick={() => onImport(q)} className="btn btn-xs btn-accent ml-2">
              Import
            </button>
          </li>
        ))}
        {availableToImport.length === 0 && <li>No questions available to import.</li>}
      </ul>
    </div>
  );
};

export default ImportQuestionHelper;
