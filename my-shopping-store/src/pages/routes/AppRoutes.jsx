import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "../Main/Dashboard";
import SigninPage from "../Auth/signinPage";  // ✅ Correct Path

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signin" element={<SigninPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
