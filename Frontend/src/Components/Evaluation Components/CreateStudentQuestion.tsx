import { useEffect, useRef, useState } from "react";

export interface QuestionData {
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
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // Populate fields when editing
  useEffect(() => {
    if (questionToEdit) {
      setQuestionText(questionToEdit.question);
      setQuestionType(questionToEdit.type);
      setChoices(questionToEdit.choices || ["", ""]);
    } else {
      setQuestionText("");
      setQuestionType("mcq");
      setChoices(["", ""]);
    }
  }, [questionToEdit]);

  // Dialog control
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog?.open) {
      dialog.close();
    }
  }, [open]);

  const handleSubmit = () => {
    if (!questionText.trim()) return;

    const newQuestion: QuestionData = {
      question: questionText,
      type: questionType,
      ...(questionType === "mcq" && { choices: choices.filter((c) => c.trim()) }),
    };

    if (questionToEdit && onUpdate && editIndex !== null) {
      onUpdate(newQuestion, editIndex);
    } else {
      onAdd(newQuestion);
    }

    onClose();
  };

  return (
    <dialog ref={dialogRef} id="create_question_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-2">
          {questionToEdit ? "Edit Question" : "Add a Question"}
        </h3>

        <label className="label">Question</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />

        <label className="label mt-4">Question Type</label>
        <select
          className="select select-bordered w-full"
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as any)}
        >
          <option value="mcq">Multiple Choice</option>
          <option value="rating">Rating Scale</option>
          <option value="comment">Comment Box</option>
        </select>

        {questionType === "mcq" && (
          <div className="mt-4">
            <label className="label">Choices</label>
            {choices.map((choice, i) => (
              <input
                key={i}
                type="text"
                className="input input-bordered w-full mb-2"
                value={choice}
                onChange={(e) => {
                  const newChoices = [...choices];
                  newChoices[i] = e.target.value;
                  setChoices(newChoices);
                }}
              />
            ))}
            <button
              type="button"
              className="btn btn-sm btn-outline mt-1"
              onClick={() => setChoices([...choices, ""])}
            >
              + Add Choice
            </button>
          </div>
        )}

        <div className="modal-action">
          <button className="btn btn-success" onClick={handleSubmit}>
            {questionToEdit ? "Update" : "Add"}
          </button>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default CreateStudentQuestion;