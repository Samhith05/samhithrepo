// src/components/UploadForm.jsx

import { useState } from "react";
import axios from "axios";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import predictCategory from "../utils/predictCategory";
import assignTechnician from "../utils/assignTechnician";
import { useAuth } from "../components/AuthContext";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dkupo9ghd/image/upload";
const UPLOAD_PRESET = "public_upload";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("");
  const [prediction, setPrediction] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submission state

  const { user, login, isApprovedUser } = useAuth();

  const handleSubmit = async () => {
    // Prevent double submissions
    if (isSubmitting) {
      console.log("Submit already in progress, ignoring");
      return;
    }

    // Check if user is authenticated and approved
    if (!user) {
      alert("Please log in first to submit an issue.");
      return;
    }

    if (!isApprovedUser) {
      alert(
        "Your account is not yet approved. Please wait for admin approval."
      );
      return;
    }

    if (!file || !desc) {
      alert("Please provide both image and description.");
      return;
    }

    try {
      setIsSubmitting(true); // Set submitting state
      setStatus("Uploading to Cloudinary...");
      console.log("Starting submission process...");

      // 🖼 Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await axios.post(CLOUDINARY_URL, formData);

      if (!res.data || !res.data.secure_url) {
        throw new Error("Failed to upload image to Cloudinary");
      }

      const imageUrl = res.data.secure_url;

      setStatus("Classifying...");
      let category;
      try {
        // Try Teachable Machine first
        category = await predictCategory(file);
      } catch (predictionError) {
        console.warn(
          "Teachable Machine prediction failed, trying Gemini AI:",
          predictionError
        );

        // Fallback to Gemini AI with description
        try {
          const { analyzeIssueDescription } = await import("../api/gemini");
          category = await analyzeIssueDescription(desc, imageUrl);
        } catch (geminiError) {
          console.warn("Gemini AI also failed, using default:", geminiError);
          category = "Common Area Maintenance/Housekeeping"; // fallback category
        }
      }

      setPrediction(category);

      const technician = assignTechnician(category);

      setStatus("Saving to Firestore...");
      console.log("About to save to Firestore with category:", category);

      const issueData = {
        userEmail: user.email || "anonymous@example.com",
        userName: user.displayName || user.email || "Anonymous User",
        imageUrl,
        description: desc,
        category,
        assignedTo: technician.name,
        contact: technician.contact,
        status: "Open",
        createdAt: Timestamp.now(),
      };

      console.log("Issue data to be saved:", issueData);
      await addDoc(collection(db, "issues"), issueData);
      console.log("Successfully saved to Firestore");

      setStatus("Submitted ✅");
      setFile(null);
      setDesc("");
      setPrediction("");
    } catch (err) {
      console.error("Upload error:", err);

      // Provide more specific error messages
      if (err.code === "permission-denied") {
        setStatus("Error: Permission denied. Check Firebase rules.");
      } else if (err.message?.includes("Cloudinary")) {
        setStatus("Error: Failed to upload image.");
      } else if (err.message?.includes("network")) {
        setStatus("Error: Network connection issue.");
      } else {
        setStatus(`Error submitting: ${err.message || "Unknown error"}`);
      }
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div className="bg-white border rounded p-4">
      <h2 className="text-xl font-semibold mb-4">Report an Issue</h2>

      {/* Authentication Status */}
      {!user ? (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800 mb-2">
            Please log in to submit an issue.
          </p>
          <button
            onClick={login}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sign in with Google
          </button>
        </div>
      ) : !isApprovedUser ? (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
          <p className="text-sm text-orange-800">
            Your account is pending approval. You cannot submit issues until
            approved by an admin.
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Logged in as: {user.displayName || user.email}
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">
            Logged in as: {user.displayName || user.email}
          </p>
        </div>
      )}

      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Upload Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border px-4 py-2"
          disabled={!user || !isApprovedUser}
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Description:</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Describe the issue..."
          rows="3"
          className="w-full border px-4 py-2"
          disabled={!user || !isApprovedUser}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className={`w-full px-4 py-2 rounded ${user && isApprovedUser && !isSubmitting
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
        disabled={!user || !isApprovedUser || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Issue"}
      </button>

      {/* Status */}
      {status && (
        <div className="mt-2 text-sm text-gray-600">
          <strong>Status:</strong> {status}
        </div>
      )}

      {/* Prediction */}
      {prediction && (
        <div className="mt-2 text-sm text-green-600">
          <strong>Predicted Category:</strong> {prediction}
        </div>
      )}
    </div>
  );
}
