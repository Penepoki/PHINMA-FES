// New component: CreateEvaluationForm.tsx
import { useState, useEffect } from 'react';
import api from '../../utils/api.ts';

interface CreateEvaluationProps {
  onSuccess: (evaluation: any) => void;
  schedules: Schedule[];
}
interface User {
  id: number;
  first_name: string;
  last_name: string;
}

const CreateEvaluationForm: React.FC<CreateEvaluationProps> = ({ onSuccess, schedules }) => {
  const [formData, setFormData] = useState({
    schedule: '',
    observation_date: '',
    evaluation_type: 'copus_1',
    instructor: '',
    additional_comments: ''
  });
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [error, setError] = useState('');

 // Fetch instructors when component mounts
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await api.get('/users/professors/');
        setInstructors(response.data);
      } catch (err) {
        console.error('Error fetching instructors:', err);
        setError('Failed to load instructors');
      }
    };

    fetchInstructors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/evaluation/evaluations/', formData);
      onSuccess(response.data.data);
      // Reset form
      setFormData({
        schedule: '',
        observation_date: '',
        evaluation_type: 'copus_1',
        instructor: '',
        additional_comments: ''
      });
    } catch (error) {
      console.error('Error creating evaluation:', error);
      setError('Failed to create evaluation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Schedule</label>
        <select
          name="schedule"
          value={formData.schedule}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        >
          <option value="">Select a schedule</option>
          {schedules.map((schedule) => (
            <option key={schedule.id} value={schedule.id}>
              {schedule.name} - {schedule.subject}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Instructor</label>
                <select
          name="instructor"
          value={formData.instructor}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        >
          <option value="">Select an instructor (optional)</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.first_name} {instructor.last_name}
            </option>
          ))}
        </select>

        <p className="text-xs text-gray-500 mt-1">
          If not selected, the schedule's instructor will be used
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Observation Date</label>
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
        <label className="block text-sm font-medium text-gray-700">Evaluation Type</label>
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Additional Comments</label>
        <textarea
          name="additional_comments"
          value={formData.additional_comments}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          rows={4}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-[#1c402a] px-4 py-2 text-white hover:bg-[#2a5e3e]"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Evaluation'}
      </button>
    </form>
  );
};
export default CreateEvaluationForm;