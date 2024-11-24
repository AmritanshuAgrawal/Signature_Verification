import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../images/bg.jpeg";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
        const response = await axios.post("http://localhost:8000/", formData);

        // Save JWT token in localStorage
        localStorage.setItem("token", response.data.token);

        navigate("/form", { state: { id: formData.email } });
    } catch (error) {
        if (error.response && error.response.data.message) {
            setError(error.response.data.message);
        } else {
            setError("An error occurred. Please try again.");
        }
    }
};

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minWidth: "1000px",
      }}
    >
      {/* Outer Container */}
      <div
        style={{
          display: "flex",
          width: "90%",
          maxWidth: "1200px",
          height: "80vh",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Left Section */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Blurred Inner Div */}
          <div
            style={{
              width: "80%",
              height: "70%",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              backdropFilter: "blur(15px)",
              WebkitBackdropFilter: "blur(15px)",
              padding: "20px",
              textAlign: "center",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              SignSecure
            </h1>
            <p style={{ fontSize: "18px", marginBottom: "20px" }}>
              We are <strong>Invite only right now.</strong>
            </p>
            <p style={{ fontSize: "16px" }}>
              Authenticating every stroke, <br /> Safeguarding every trust.
            </p>
            <p style={{ marginTop: "20px", fontSize: "14px" }}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{
                  color: "cyan",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px",
          }}
        >
          <form
            onSubmit={submit}
            style={{
              width: "100%",
              maxWidth: "400px",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              Login
            </h2>
            {error && (
              <div
                style={{
                  color: "red",
                  marginBottom: "10px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {error}
              </div>
            )}
            <div style={{ marginBottom: "15px" }}>
              <input
                type="email"
                name="email"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <input
                type="password"
                name="password"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                marginBottom: "10px",
              }}
            >
              Login →
            </button>
            <div style={{ textAlign: "center", margin: "10px 0" }}>or</div>
            <button
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#4285F4",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
