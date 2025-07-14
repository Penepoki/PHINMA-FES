// New component: CreateEvaluationForm.tsx
import { useState, useEffect } from "react";
import api from "../../utils/api.ts";

interface CreateEvaluationProps {
	onSuccess: (evaluation: any) => void;
	schedules: Schedule[];
	initialInstructor?: User | null;
	initialCopusType?: string;
}
interface User {
	id: number;
	first_name: string;
	last_name: string;
}
const getToday = () => {
	  const today = new Date();
	  return today.toISOString().split('T')[0];
	};
const CreateEvaluationForm: React.FC<CreateEvaluationProps> = ({
	onSuccess,
	schedules,
	initialInstructor = null,
	initialCopusType = "copus_1",
}) => {
	const [formData, setFormData] = useState({
	  schedule: "",
	  observation_date: getToday(), // <-- set to today
	  evaluation_type: initialCopusType || "copus_1",
	  instructor: "",
	  additional_comments: "",
	});
	const [loading, setLoading] = useState(false);
	const [instructors, setInstructors] = useState<User[]>([]);
	const [selectedInstructor, setSelectedInstructor] = useState<User | null>(
		initialInstructor,
	);
	const [error, setError] = useState("");

	// Set selectedInstructor if initialInstructor changes
	useEffect(() => {
		if (initialInstructor) {
			setSelectedInstructor(initialInstructor);
		}
	}, [initialInstructor]);

	// Set evaluation_type if initialCopusType changes
	useEffect(() => {
		if (initialCopusType) {
			setFormData((f) => ({ ...f, evaluation_type: initialCopusType }));
		}
	}, [initialCopusType]);

	// Fetch instructors when component mounts
	useEffect(() => {
		const fetchInstructors = async () => {
			try {
				const response = await api.get("/users/professors/");
				setInstructors(response.data);
			} catch (err) {
				console.error("Error fetching instructors:", err);
				setError("Failed to load instructors");
			}
		};

		fetchInstructors();
	}, []);

	// When instructor changes, clear schedule and filter schedules
	const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);



	useEffect(() => {
		if (selectedInstructor) {
			const filtered = schedules.filter(
				(s) => s.instructor === selectedInstructor.id
			);
			setFilteredSchedules(filtered);
			// Clear schedule selection if it doesn't belong to this instructor
			if (!filtered.some((s) => String(s.id) === formData.schedule)) {
				setFormData((f) => ({ ...f, schedule: "" }));
			}
		} else {
			setFilteredSchedules([]);
			setFormData((f) => ({ ...f, schedule: "" }));
		}
	}, [selectedInstructor, schedules]);

	// When schedule changes, update instructor to match the schedule's instructor
	useEffect(() => {
		if (formData.schedule) {
			const selectedSchedule = schedules.find(
				(s) => String(s.id) === formData.schedule,
			);
			if (selectedSchedule) {
				const instructor = instructors.find(
					(i) => i.id === selectedSchedule.instructor,
				);
				setFormData((f) => ({
					...f,
					instructor: selectedSchedule.instructor
						? String(selectedSchedule.instructor)
						: "",
				}));
				setSelectedInstructor(instructor || null);
			} else {
				setSelectedInstructor(null);
			}
		} else {
			setSelectedInstructor(null);
		}
	}, [formData.schedule, instructors, schedules]);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => {
		const { name, value } = e.target;
		if (name === "schedule") {
			// Find the selected schedule and set the instructor to match
			const selectedSchedule = schedules.find(
				(s) => String(s.id) === value,
			);
			setFormData({
				...formData,
				schedule: value,
				instructor: selectedSchedule
					? String(selectedSchedule.instructor)
					: "",
			});
		} else {
			setFormData({ ...formData, [name]: value });
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await api.post(
				"/evaluation/evaluations/",
				formData,
			);
			onSuccess(response.data.data);
			// Reset form
			setFormData({
			  schedule: "",
			  observation_date: getToday(),
			  evaluation_type: "copus_1",
  				instructor: selectedInstructor ? String(selectedInstructor.id) : "",
			  additional_comments: "",
			});
			setSelectedInstructor(initialInstructor || null);

		} catch (error) {
			console.error("Error creating evaluation:", error);
			setError("Failed to create evaluation. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && <div className="text-red-500">{error}</div>}

			<div>
			  <label className="block text-sm font-medium text-gray-700">
				Instructor
			  </label>
			  <select
				name="instructor_select"
				value={selectedInstructor ? selectedInstructor.id : ""}
				onChange={e => {
				  const instructor = instructors.find(i => String(i.id) === e.target.value);
				  setSelectedInstructor(instructor || null);
				}}
				className="mt-1 block w-full rounded-md border border-gray-300 p-2"
				required
				disabled={!!initialInstructor} // <-- disables if initialInstructor is set
			  >
				<option value="">Select an instructor</option>
				{instructors.map((instructor) => (
				  <option key={instructor.id} value={instructor.id}>
					{instructor.first_name} {instructor.last_name}
				  </option>
				))}
			  </select>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700">
					Schedule
				</label>
				<select
					name="schedule"
					value={formData.schedule}
					onChange={handleChange}
					className="mt-1 block w-full rounded-md border border-gray-300 p-2"
					required
					disabled={!selectedInstructor}
				>
					<option value="">{selectedInstructor ? "Select a schedule" : "Select an instructor first"}</option>
					{filteredSchedules.map((schedule) => (
						<option key={schedule.id} value={schedule.id}>
							{schedule.name} - {schedule.subject}
						</option>
					))}
				</select>
			</div>



			<div>
				<label className="block text-sm font-medium text-gray-700">
					Observation Date
				</label>
				<input
					type="date"
					name="observation_date"
					value={formData.observation_date}
					onChange={handleChange}
					className="mt-1 block w-full rounded-md border border-gray-300 p-2"
					required
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700">
					Evaluation Type
				</label>
				<select
					name="evaluation_type"
					value={formData.evaluation_type}
					onChange={handleChange}
					className="mt-1 block w-full rounded-md border border-gray-300 p-2"
					required
				>
					<option value="copus_1">COPUS 1</option>
					<option value="copus_2">COPUS 2</option>
					<option value="copus_3">COPUS 3</option>
				</select>
			</div>

			<div className="modal-action">
				<button type="submit" className="btn bg-[#1c402a] text-white">
					{loading ? "Creating..." : "Create Evaluation"}
				</button>
				<button
					type="button"
					className="btn btn-error"
					onClick={() => {
						(
							document.getElementById(
								"create_new_copus",
							) as HTMLDialogElement
						)?.close();
					}} // You'd need to add onClose to props
				>
					Cancel
				</button>
			</div>
		</form>
	);
};
export default CreateEvaluationForm;
