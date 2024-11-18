import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post("http://localhost:8000/", formData);

      if (response.data === "exist") {
        navigate("/form", { state: { id: formData.email } });
      } else if (response.data === "notexist") {
        setError("User has not signed up");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundImage: `url('https://st2.depositphotos.com/11337508/46659/v/450/depositphotos_466592170-stock-illustration-character-signing-digital-signature-online.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.2)", // Glass effect
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)", // Safari compatibility
          border: "1px solid rgba(255, 255, 255, 0.3)",
          padding: "30px",
          textAlign: "center",
          width: "400px", // Increased box size
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "20px",
          }}
        >
          LOGIN
        </h1>
        <form onSubmit={submit}>
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
                border: "none",
                borderRadius: "8px",
                boxSizing: "border-box",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                color: "black",
                fontSize: "16px",
              }}
              placeholder="Username"
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
                border: "none",
                borderRadius: "8px",
                boxSizing: "border-box",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                color: "black",
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
              backgroundColor: "black",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Login
          </button>
        </form>
        <div style={{ marginTop: "15px", fontSize: "14px", color: "white" }}>
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{ color: "cyan", textDecoration: "none", fontWeight: "bold" }}
          >
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;