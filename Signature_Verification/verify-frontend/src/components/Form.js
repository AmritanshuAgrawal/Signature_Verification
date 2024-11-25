import React, { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import bgImage from "../images/bg.jpeg";

const Form = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [genuineImagePreview, setGenuineImagePreview] = useState(null);
  const [forgedImageFile, setForgedImageFile] = useState(null);
  const [forgedImagePreview, setForgedImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verificationResults, setVerificationResults] = useState({
    classification: "",
    confidence: 0,
    similarity: "",
  });

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "https://signature-verification-dtvv.onrender.com/get_users",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            mode: "cors", // Explicitly state we want CORS
          }
        );
        const data = await response.json();
        setUsers(data); // Remove .data since your endpoint returns the array directly
        console.log(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleUserSelection = (event) => {
    const userEmail = event.target.value;
    const user = users.find((user) => user.email === userEmail);
    setSelectedUser(user);
    if (user) {
      setGenuineImagePreview(user.signature_image);
    }
  };

  const handleForgedFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setForgedImagePreview(URL.createObjectURL(file));
      setForgedImageFile(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(forgedImageFile);
    reader.onload = async () => {
      const base64ForgedSignature = reader.result;
      try {
        const response = await fetch(
          "https://signature-verification-dtvv.onrender.com/verify_signature",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image1: selectedUser.signature_image,
              image2: base64ForgedSignature,
            }),
          }
        );
        const result = await response.json();
        setVerificationResults(result);
        setIsDialogOpen(true);
      } catch (error) {
        console.error("Error verifying signature:", error);
      } finally {
        setIsLoading(false);
        setGenuineImagePreview(null);
        setForgedImagePreview(null);
      }
    };
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
          Signature Verification
        </h1>

        <label
          htmlFor="user-select"
          style={{ display: "block", fontWeight: "bold", marginBottom: "10px" }}
        >
          Select User
        </label>
        <select
          id="user-select"
          onChange={handleUserSelection}
          value={selectedUser?.email || ""}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <option value="">-- Select a User --</option>
          {users.map((user) => (
            <option key={user.email} value={user.email}>
              {user.name}
            </option>
          ))}
        </select>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "45%",
              border: "2px dashed #ccc",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              height: "150px",
            }}
          >
            {genuineImagePreview ? (
              <img
                src={genuineImagePreview}
                alt="Genuine Signature"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            ) : (
              <p style={{ color: "#888", fontSize: "14px" }}>
                No Signature Loaded
              </p>
            )}
          </div>

          <div
            style={{
              width: "45%",
              border: "2px dashed #ccc",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              height: "150px",
            }}
          >
            {forgedImagePreview ? (
              <img
                src={forgedImagePreview}
                alt="Forged Signature"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            ) : (
              <label style={{ cursor: "pointer", color: "#007bff" }}>
                Upload Image
                <input
                  type="file"
                  onChange={handleForgedFileChange}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link
            to="/createUser"
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              textAlign: "center",
              flex: 1,
              marginRight: "10px",
            }}
          >
            Create User
          </Link>
          <button
            onClick={handleSubmit}
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "bold",
              flex: 1,
            }}
          >
            {isLoading ? "Processing..." : "Verify"}
          </button>
        </div>

        <Transition.Root show={isDialogOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setIsDialogOpen(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationTriangleIcon
                            className="h-6 w-6 text-green-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <Dialog.Title
                            as="h3"
                            className="text-lg leading-6 font-medium text-gray-900"
                          >
                            Verification Results
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Similarity: {verificationResults.similarity}
                            </p>
                            <p className="text-sm text-gray-500">
                              Classification:{" "}
                              {verificationResults.classification}
                            </p>
                            <p className="text-sm text-gray-500">
                              Confidence:{" "}
                              {verificationResults.confidence.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
    </div>
  );
};

export default Form;
