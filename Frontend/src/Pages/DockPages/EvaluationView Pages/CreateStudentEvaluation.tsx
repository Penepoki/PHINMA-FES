import { useEffect, useState } from "react";
import axios from "axios";
import { FunnelIcon } from "@heroicons/react/24/solid";

interface CreateStudentEvalProps {
  setActiveView: (view: string) => void;
}

interface User {
  id: number;
  name: string;
}

function CreateStudentEvaluation({ setActiveView }: CreateStudentEvalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    axios
      .get("") // Replace with your actual Django API endpoint
      .then((response) => {
        setUsers(response.data); // Assuming the response is a list of users
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch users:", error);
        setError("Failed to load users.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="custom-container gap-y-6">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <ul>
          <li>
            <a onClick={() => setActiveView("home")}>Home</a>
          </li>
          <li>
            <a onClick={() => setActiveView("evaluation")}>Evaluation</a>
          </li>
          <li>Create Student Evaluations</li>
        </ul>
      </div>

      {/* Page Title */}
      <h2 className="text-3xl font-bold mt-4 text-white">
        Create Student Evaluation
      </h2>
      {/* Create New Evaluation Button */}

      <div className="flex w-full justify-center md:justify-end items-start pb-2 px-4 border-b-gray-600 border-b-2 shadow-xl">
        <button
          onClick={() =>
            (
              document.getElementById(
                "createstudentevaluation"
              ) as HTMLDialogElement
            )?.showModal()
          }
          className="flex bg-[#1c402a] shadow-xl text-white w-auto rounded-lg py-2 px-5 hover:scale-105 transition-transform whitespace-nowrap"
        >
          Create New Student Evaluation
        </button>
        <dialog id="createstudentevaluation" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="font-bold text-2xl mb-4 text-center">
              New Student Evaluation
            </h3>

            <form method="dialog" className="flex flex-col gap-6">
              {/* Schedule */}
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="md:w-1/6 text-lg font-bold text-left">
                  Schedule:
                </label>
                <input
                  type="text"
                  placeholder="Enter schedule"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Title */}
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="md:w-1/6 text-lg font-bold text-left">
                  Title:
                </label>
                <input
                  type="text"
                  placeholder="Enter title"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col md:flex-row md:items-start gap-2">
                <label className="md:w-1/6 text-lg font-bold text-left pt-2">
                  Description:
                </label>
                <textarea
                  placeholder="Enter description"
                  className="textarea textarea-bordered w-full"
                  required
                />
              </div>

              {/* Questions */}
              <div className="flex flex-col md:flex-row md:items-start gap-2">
                <label className="md:w-1/6 text-lg font-bold text-left pt-2">
                  Questions:
                </label>
                <textarea
                  placeholder="Enter questions separated by commas"
                  className="textarea textarea-bordered w-full"
                  required
                />
              </div>

              {/* Type */}
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="md:w-1/6 text-lg font-bold text-left">
                  Type:
                </label>
                <input
                  type="text"
                  placeholder="Enter type (e.g., Midterm, Final)"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="modal-action">
                <button type="submit" className="btn btn-success text-white">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    (
                      document.getElementById(
                        "createstudentevaluation"
                      ) as HTMLDialogElement
                    )?.close()
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex w-full justify-center items-start pb-2 px-4 border-b-gray-600 border-b-2 shadow-xl">
        <input
          type="text"
          className="input w-full max-w-md border border-gray-300 rounded-lg"
          placeholder="Search"
        />
        <div className="dropdown dropdown-end ml-2">
          <div
            tabIndex={0}
            role="button"
            className="btn shadow-xl bg-[#1c402a] border-0 text-white"
          >
            <FunnelIcon className="h-5 w-5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-sm"
          >
            <li>
              <a href="#">Item 1</a>
            </li>
            <li>
              <a href="#">Item 2</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto w-full text-white backdrop-blur-lg shadow-xl">
        {loading ? (
          <div className="text-center py-8 text-lg">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <table className="table">
            <thead className="text-white text-xl font-bold bg-[#1c402a]/50 shadow-xl">
              <tr>
                <th>
                  <input type="checkbox" className="checkbox" />
                </th>
                <th>ID</th>
                <th>Name</th>
                <th>Publish</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 text-lg">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#1b2e3e]/50">
                  <td>
                    <input type="checkbox" className="checkbox" />
                  </td>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>
                    <input type="checkbox" className="toggle" />
                  </td>
                  <td>Edit</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CreateStudentEvaluation;
