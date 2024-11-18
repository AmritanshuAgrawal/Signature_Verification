import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(e) {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/signup", { email, password })
        .then(res => {
          if (res.data === "exist") {
            alert("User already exists");
          } else if (res.data === "notexist") {
            navigate("/form", { state: { id: email } });
          }
        })
        .catch(e => {
          alert("Wrong details");
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  }

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
          width: "400px", // Box size
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
          SIGN-UP
        </h1>
        <form onSubmit={submit}>
          <div style={{ marginBottom: "15px" }}>
            <input
              type="email"
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
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <input
              type="password"
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
              onChange={(e) => setPassword(e.target.value)}
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
            Signup
          </button>
        </form>
        <div style={{ marginTop: "15px", fontSize: "14px", color: "white" }}>
        Already have an account?{" "}
        <Link
            to="/"
            style={{ color: "cyan", textDecoration: "none", fontWeight: "bold" }}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;