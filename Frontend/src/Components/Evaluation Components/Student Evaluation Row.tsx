import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

interface StudentEvaluationRowProps {
    name: string;
    isActive: boolean;
    onToggle: () => void;
    onEdit: () => void;
}

function StudentEvaluationRow({name, isActive, onToggle, onEdit}: StudentEvaluationRowProps) {
    return (
        <tr className="bg-black/20 text-wrap hover:bg-[#1b2e3e]/50">
            <td>
                <input type="checkbox" className="checkbox"/>
            </td>
            <td>{name}</td>
            <td></td>
            <td></td>
            <td>
                <input type="checkbox" checked={isActive} className="toggle" onChange={onToggle}/>
            </td>
            <td>
                <button
                    onClick={() =>
                        (document.getElementById("edit_student_eval") as HTMLDialogElement)?.showModal()
                    }
                    className="flex items-center gap-1 text-sm hover:underline"
                >
                    <PencilSquareIcon className="h-4 w-4"/>
                    Edit
                </button>

                <button
                    onClick={onEdit} // You might want a separate `onDelete` handler
                    className="flex items-center gap-1 text-sm hover:underline"
                >
                    <TrashIcon className="h-4 w-4"/>
                    Delete
                </button>
            </td>
        </tr>
    );
}

export default StudentEvaluationRow;
