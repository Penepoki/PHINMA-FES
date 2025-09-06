// Constant values
// Retrieve dean's id from local storage
const DEAN_ID = localStorage.getItem("faculty_id");

function SemestralEvalCards() {
  console.log("Dean ID:", DEAN_ID);
  return <div>SemestralEvalCards</div>;
}

export default SemestralEvalCards;
