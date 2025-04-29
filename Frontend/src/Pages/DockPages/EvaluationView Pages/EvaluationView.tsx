import { useState } from "react";

interface EvalProps {
  setActiveView: (view: string) => void;
}

function Evaluation({ setActiveView }: EvalProps) {
  const [tableData] = useState([
    { course: "Renzo Cua", roomSubject: "403 SSP", yearSem: "2023 2nd Sem" },
    {
      course: "Martin Espineda",
      roomSubject: "200 SIA",
      yearSem: "2022 1st Sem",
    },
    {
      course: "Chester Espineda",
      roomSubject: "190 MIA",
      yearSem: "2021 2nd Sem",
    },
  ]);

  return (
    <div className="custom-container gap-y-6">
      <div className="breadcrumbs text-md text-white">
        <ul>
          <li>
            <a onClick={() => setActiveView("home")}>Home</a>
          </li>
          <li>
            <a>Evaluation</a>
          </li>
        </ul>
      </div>
      <h2 className="text-3xl font-bold mt-4 text-white">
        Copus Evaluation Forms
      </h2>

      <div className="flex flex-row w-full justify-center items-center text-black backdrop-blur-lg py-5 px-4 gap-1 md:gap-6 mt-4 border-b-2 border-gray-600 shadow-xl">
        <input
          type="text"
          className="input"
          placeholder="Professor"
          list="professor-list"
        />
        <datalist id="professor-list">
          {tableData.map((row, index) => (
            <option key={index} value={row.course} />
          ))}
        </datalist>

        <input
          type="text"
          className="input"
          placeholder="Room & Subject"
          list="room-subject-list"
        />
        <datalist id="room-subject-list">
          {tableData.map((row, index) => (
            <option key={index} value={row.roomSubject} />
          ))}
        </datalist>

        <input
          type="text"
          className="input"
          placeholder="Year & Semester"
          list="year-semester-list"
        />
        <datalist id="year-semester-list">
          {tableData.map((row, index) => (
            <option key={index} value={row.yearSem} />
          ))}
        </datalist>
      </div>

      <div className="overflow-x-auto w-full text-white backdrop-blur-lg shadow-xl">
        <table className="table">
          <thead className="text-white text-xl font-bold bg-[#1c402a]/50 shadow-xl">
            <tr>
              <th>Course and Professor</th>
            </tr>
          </thead>
          <tbody className="text-white text-lg">
            {tableData.map((row, index) => {
              const modalId = `modal-${index}`;
              return (
                <tr key={index}>
                  <td>
                    <div className="collapse collapse-arrow backdrop-blur-lg border-gray-300 border rounded-md shadow-xl">
                      <input type="checkbox" />
                      <div className="collapse-title bg-[#1c402a]/50 font-semibold text-xl">
                        {row.course}
                      </div>
                      <div
                        className="gap-x-3 py-3 flex justify-center items-center bg-[#1c402a]/50"
                        onClick={(e) => e.stopPropagation()} // Stop collapse toggle
                      >
                        {/* Copus 1 */}
                        <label className="btn text-black cursor-pointer">
                          <input
                            name={`copus-${index}`}
                            className="hidden"
                            onClick={() =>
                              (
                                document.getElementById(
                                  modalId
                                ) as HTMLDialogElement
                              )?.showModal()
                            }
                          />
                          Copus 1
                        </label>

                        {/* Copus 2 */}
                        <label className="btn bg-white text-black cursor-pointer">
                          <input
                            name={`copus-${index}`}
                            className="hidden"
                            onClick={() => console.log("Copus 2 clicked")}
                          />
                          Copus 2
                        </label>

                        {/* Copus 3 */}
                        <label className="btn bg-white text-black cursor-pointer">
                          <input
                            name={`copus-${index}`}
                            className="hidden"
                            onClick={() => console.log("Copus 3 clicked")}
                          />
                          Copus 3
                        </label>
                      </div>
                      <div className="collapse-content flex text-lg">
                        <div className="avatar mt-5">
                          <div className="w-24 rounded-full">
                            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                          </div>
                        </div>
                        <div className="flex items-center ml-6">
                          Room and Subject: {row.roomSubject}
                          <br />
                          Year and Semester: {row.yearSem}
                        </div>
                      </div>
                    </div>

                    {/* Modal for Copus 1 */}
                    <dialog id={modalId} className="modal">
                      <div className="modal-box w-11/12 max-w-5xl">
                        <h3 className="font-bold text-lg">
                          {row.course} - Copus 1
                        </h3>
                        <p className="py-4">
                          This is Copus 1 content for {row.course}.
                        </p>
                        <div className="modal-action">
                          <form method="dialog">
                            <button type="submit" className="btn">
                              Close
                            </button>
                          </form>
                        </div>
                      </div>
                    </dialog>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Evaluation;
