import { HashRouter as Router, Routes, Route } from "react-router";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard/dean" element={<Dashboard role="Dean" />} />
        <Route path="Dashboard/hr" element={<Dashboard role="HR" />} />
        <Route path="/Dashboard/student" element={<Dashboard role="Student" />} />
        <Route path="/Dashboard/professor" element={<Dashboard role="Professor" />} />"
      </Routes>
    </Router>
  );
}

export default App;
