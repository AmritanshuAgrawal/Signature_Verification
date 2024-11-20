import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../images/bg.jpeg";

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      await axios
        .post("http://localhost:8000/signup", { email, password })
        .then((res) => {
          if (res.data === "exist") {
            alert("User already exists");
          } else if (res.data === "notexist") {
            navigate("/form", { state: { id: email } });
          }
        })
        .catch((e) => {
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
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
              alignItems: "center"
            }}
          >
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              THEGOOD NETWORK
            </h1>
            <p style={{ fontSize: "18px", marginBottom: "20px" }}>
              We are <strong>Invite only right now.</strong>
            </p>
            <p style={{ fontSize: "16px" }}>
              10 Million+ people have joined our network. <br /> We invite you
              to join the tribe.
            </p>
            <p style={{ marginTop: "20px", fontSize: "14px" }}>
              Already have an account?{" "}
              <Link
                to="/"
                style={{
                  color: "cyan",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Login
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
              Sign up
            </h2>
            <div style={{ marginBottom: "15px" }}>
              <input
                type="email"
                required
                placeholder="Email address"
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <input
                type="password"
                required
                placeholder="Set password"
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
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
              Sign up →
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

export default Signup;