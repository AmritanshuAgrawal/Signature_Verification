import { BrowserRouter as Routes, Route } from "react-router-dom";
import Login from "./Login/Login";
import Signup from "./Login/Signup";

function App() {
  return (
    <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
    </div>
  );
}

export default App;
