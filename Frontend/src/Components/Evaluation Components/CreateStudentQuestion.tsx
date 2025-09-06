import { useEffect, useRef, useState } from "react";

export interface QuestionData {
  id?: number; // Make id optional for new questions
  question: string;
  type: "mcq" | "rating" | "comment";
  choices?: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (question: QuestionData) => void;
  onUpdate?: (updated: QuestionData, index: number) => void;
  questionToEdit?: QuestionData | null;
  editIndex?: number | null;
}

// Helper function to map frontend types to backend types
export const mapTypeToBackend = (frontendType: string): string => {
  const typeMap: Record<string, string> = {
    mcq: "MCQ",
    rating: "RATING",
    comment: "TEXT",
  };
  return typeMap[frontendType] || "TEXT";
};

// Helper function to map backend types to frontend types
export const mapTypeToFrontend = (backendType: string): "mcq" | "rating" | "comment" => {
  const normalized = backendType?.toUpperCase();
  const typeMap: Record<string, "mcq" | "rating" | "comment"> = {
    MCQ: "mcq",
    RATING: "rating",
    TEXT: "comment",
  };
  return typeMap[normalized] || "comment";
};

function CreateStudentQuestion({
  open,
  onClose,
  onAdd,
  onUpdate,
  questionToEdit,
  editIndex,
}: Props) {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"mcq" | "rating" | "comment">("mcq");
  const [choices, setChoices] = useState<string[]>(["", ""]);
  const [errors, setErrors] = useState<{ question?: string; choices?: string }>({});
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // Dialog control
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog?.open) {
      dialog.close();
    }
  }, [open]);

  const resetForm = () => {
    setQuestionText("");
    setQuestionType("mcq");
    setChoices(["", ""]);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { question?: string; choices?: string } = {};

    if (!questionText.trim()) {
      newErrors.question = "Question text is required";
    }

    if (questionType === "mcq") {
      const validChoices = choices.filter((c) => c.trim());
      if (validChoices.length < 2) {
        newErrors.choices = "At least 2 choices are required for multiple choice questions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const newQuestion: QuestionData = {
      question: questionText.trim(),
      type: questionType,
      ...(questionType === "mcq" && {
        choices: choices.filter((c) => c.trim()),
      }),
      ...(questionToEdit?.id && { id: questionToEdit.id }),
    };

    if (questionToEdit && onUpdate && editIndex !== null && editIndex !== undefined) {
      onUpdate(newQuestion, editIndex);
    } else {
      onAdd(newQuestion);
    }

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addChoice = () => {
    setChoices([...choices, ""]);
  };

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      setChoices(choices.filter((_, i) => i !== index));
    }
  };

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  // Populate fields when editing
  useEffect(() => {
    if (questionToEdit) {
      setQuestionText(questionToEdit.question ?? "");
      setQuestionType(questionToEdit.type);
      setChoices(questionToEdit.choices || ["", ""]);
    } else {
      resetForm();
    }
  }, [questionToEdit]);

  return (
    <dialog ref={dialogRef} id="create_question_modal" className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="mb-4 text-lg font-bold">
          {questionToEdit ? "Edit Question" : "Add a Question"}
        </h3>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Question *</span>
          </label>
          <textarea
            className={`textarea textarea-bordered w-full ${errors.question ? "textarea-error" : ""}`}
            placeholder="Enter your question here..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={3}
          />
          {errors.question && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.question}</span>
            </label>
          )}
        </div>

        <div className="form-control mt-4 w-full">
          <label className="label">
            <span className="label-text">Question Type *</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as "mcq" | "rating" | "comment")}
          >
            <option value="mcq">Multiple Choice</option>
            <option value="rating">Rating Scale (1-5)</option>
            <option value="comment">Text Response</option>
          </select>
        </div>

        {questionType === "mcq" && (
          <div className="mt-4">
            <label className="label">
              <span className="label-text">Answer Choices *</span>
            </label>
            <div className="space-y-2">
              {choices.map((choice, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder={`Choice ${i + 1}`}
                    value={choice}
                    onChange={(e) => updateChoice(i, e.target.value)}
                  />
                  {choices.length > 2 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-error"
                      onClick={() => removeChoice(i)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.choices && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.choices}</span>
              </label>
            )}
            <button type="button" className="btn btn-sm btn-outline mt-2" onClick={addChoice}>
              + Add Choice
            </button>
          </div>
        )}

        {questionType === "rating" && (
          <div className="bg-base-200 mt-4 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              This will create a 1-5 rating scale question where:
              <br />• 1 = Poor/Strongly Disagree
              <br />• 5 = Excellent/Strongly Agree
            </p>
          </div>
        )}

        {questionType === "comment" && (
          <div className="bg-base-200 mt-4 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              This will create a text area where students can provide written feedback.
            </p>
          </div>
        )}

        <div className="modal-action">
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={!questionText.trim()}
          >
            {questionToEdit ? "Update Question" : "Add Question"}
          </button>
          <button className="btn btn-cancel" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default CreateStudentQuestion;
