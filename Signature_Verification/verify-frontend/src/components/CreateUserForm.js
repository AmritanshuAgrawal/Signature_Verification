import React, { useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";
import bgImage from "../images/bg.jpeg";

const CreateUserForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [genuineImagePreview, setGenuineImagePreview] = useState(null);
  const [genuineImageFile, setGenuineImageFile] = useState(null);

  const resetGenuineImage = () => {
    setGenuineImagePreview(null);
    setGenuineImageFile(null);
  };

  const handleGenuineFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGenuineImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setGenuineImageFile(file); // Set the file
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      name,
      email,
      genuineSignature: genuineImagePreview, // Base64 encoded string
    };

    const response = await fetch(
      "https://signature-verification-dtvv.onrender.com/create_user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );
    const data = await response.json();
    console.log(data);

    // reset form
    setName("");
    setEmail("");
    resetGenuineImage();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        paddingTop: "50px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "20px",
          borderRadius: "16px",
          width: "60%",
          maxWidth: "800px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
          textAlign: "center",
        }}
      >
        <h1
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
        >
          Create a User
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="name"
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Name
            </label>
            <input
              type="text"
              required
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "16px",
                marginBottom: "10px",
              }}
            />
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "16px",
                marginBottom: "10px",
              }}
            />
          </div>

          {/* Genuine Signature Upload */}
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="genuine-signature"
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Genuine Signature
            </label>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                border: "2px dashed #ccc",
                borderRadius: "8px",
                padding: "20px",
                height: "150px",
                marginBottom: "20px",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              {genuineImagePreview ? (
                <div style={{ textAlign: "center" }}>
                  <img
                    src={genuineImagePreview}
                    alt="Genuine Signature Preview"
                    style={{ maxHeight: "100%", maxWidth: "100%" }}
                  />
                  <button
                    type="button"
                    onClick={resetGenuineImage}
                    style={{
                      marginTop: "10px",
                      backgroundColor: "white",
                      color: "#007bff",
                      padding: "5px 10px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="genuine-signature"
                  style={{
                    cursor: "pointer",
                    color: "#007bff",
                    textDecoration: "underline",
                  }}
                >
                  Upload Signature
                  <input
                    type="file"
                    id="genuine-signature"
                    accept="image/*"
                    onChange={handleGenuineFileChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              type="submit"
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: "bold",
                width: "100%",
                textAlign: "center",
              }}
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserForm;
