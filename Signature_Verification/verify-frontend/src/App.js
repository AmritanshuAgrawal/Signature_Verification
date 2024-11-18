import Form from "./components/Form";
import Navbar from "./components/Navbar";
import { BrowserRouter as Routes, Route } from "react-router-dom";
import Login from "./Login/Login";
import Signup from "./Login/Signup";

function App() {
  return (
    <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/form" 
            element={
              <>
                <Navbar />
                <Form />
              </>
            } 
          />
        </Routes>
    </div>
  );
}

export default App;
