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
      let category, aiConfidence = null, needsReview = false;
      try {
        // Try Teachable Machine first
        const prediction = await predictCategory(file);
        category = prediction.category;
        aiConfidence = prediction.confidence;

        // Flag for review if confidence is below 70%
        needsReview = aiConfidence < 0.7;

        console.log(`🤖 AI Classification: ${category} (${prediction.confidencePercent}% confidence)`);
        if (needsReview) {
          console.log("⚠️ Low confidence - flagging for manual review");
        }
      } catch (predictionError) {
        console.warn(
          "Teachable Machine prediction failed, trying Gemini AI:",
          predictionError
        );

        // Fallback to Gemini AI with description
        try {
          const { analyzeIssueDescription } = await import("../api/gemini");
          category = await analyzeIssueDescription(desc, imageUrl);
          needsReview = true; // Always flag Gemini fallbacks for review
        } catch (geminiError) {
          console.warn("Gemini AI also failed, using default:", geminiError);
          category = "Common Area Maintenance/Housekeeping"; // fallback category
          needsReview = true; // Always flag defaults for review
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
        // AI Classification Data
        aiConfidence: aiConfidence,
        needsReview: needsReview,
        reviewedBy: null,
        reviewedAt: null,
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
    <div style={{ color: 'white' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'bounce 2s infinite'
        }}>
          <span style={{ fontSize: '24px' }}>🛠️</span>
        </div>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0',
            color: 'white'
          }}>Report New Issue</h3>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            margin: '4px 0 0 0'
          }}>AI-powered categorization & assignment</p>
        </div>
      </div>

      {/* Authentication Status */}
      {!user ? (
        <div style={{
          padding: '16px',
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '12px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔐</div>
          <p style={{
            fontSize: '14px',
            color: '#fcd34d',
            marginBottom: '12px'
          }}>Please log in to submit an issue</p>
          <button
            onClick={login}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Sign in with Google
          </button>
        </div>
      ) : !isApprovedUser ? (
        <div style={{
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
          <p style={{
            fontSize: '14px',
            color: '#fca5a5',
            marginBottom: '8px'
          }}>Account pending approval</p>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}>Logged in as: {user.displayName || user.email}</p>
        </div>
      ) : (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>✅</span>
          <p style={{
            fontSize: '12px',
            color: '#86efac',
            margin: '0'
          }}>Logged in as: {user.displayName || user.email}</p>
        </div>
      )}

      {/* File Upload */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: 'white'
        }}>📸 Upload Image:</label>
        <div style={{
          position: 'relative',
          border: '2px dashed #374151',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          background: file ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          cursor: !user || !isApprovedUser ? 'not-allowed' : 'pointer'
        }}
          onMouseEnter={(e) => {
            if (user && isApprovedUser) {
              e.target.style.borderColor = '#60a5fa';
              e.target.style.background = 'rgba(59, 130, 246, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#374151';
            e.target.style.background = file ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: !user || !isApprovedUser ? 'not-allowed' : 'pointer'
            }}
            disabled={!user || !isApprovedUser}
          />
          {file ? (
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <p style={{ color: '#22c55e', fontSize: '14px', fontWeight: 'bold' }}>
                {file.name}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '12px' }}>
                Click to change image
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                Click to select an image
              </p>
              <p style={{ color: '#6b7280', fontSize: '12px' }}>
                PNG, JPG up to 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: 'white'
        }}>📝 Description:</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Describe the issue in detail..."
          rows="4"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#1f2937',
            border: '2px solid #374151',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#60a5fa';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#374151';
          }}
          disabled={!user || !isApprovedUser}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!user || !isApprovedUser || isSubmitting || !file || !desc}
        style={{
          width: '100%',
          padding: '14px 20px',
          borderRadius: '12px',
          border: 'none',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: (user && isApprovedUser && !isSubmitting && file && desc) ? 'pointer' : 'not-allowed',
          background: (user && isApprovedUser && !isSubmitting && file && desc)
            ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
            : '#6b7280',
          color: 'white',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          if (user && isApprovedUser && !isSubmitting && file && desc) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        {isSubmitting ? (
          <>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Submitting...
          </>
        ) : (
          <>
            🚀 Submit Issue
          </>
        )}
      </button>

      {/* Status */}
      {status && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          borderRadius: '8px',
          background: status.includes('Error') ? 'rgba(239, 68, 68, 0.1)' :
            status.includes('✅') ? 'rgba(34, 197, 94, 0.1)' :
              'rgba(59, 130, 246, 0.1)',
          border: `1px solid ${status.includes('Error') ? 'rgba(239, 68, 68, 0.3)' :
            status.includes('✅') ? 'rgba(34, 197, 94, 0.3)' :
              'rgba(59, 130, 246, 0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>
            {status.includes('Error') ? '❌' : status.includes('✅') ? '✅' : '⏳'}
          </span>
          <p style={{
            fontSize: '14px',
            fontWeight: 'bold',
            margin: '0',
            color: status.includes('Error') ? '#fca5a5' :
              status.includes('✅') ? '#86efac' : '#93c5fd'
          }}>{status}</p>
        </div>
      )}

      {/* Prediction */}
      {prediction && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>🤖</span>
          <div>
            <p style={{
              fontSize: '12px',
              color: '#c4b5fd',
              margin: '0 0 2px 0'
            }}>AI Prediction</p>
            <p style={{
              fontSize: '14px',
              fontWeight: 'bold',
              margin: '0',
              color: '#a78bfa'
            }}>{prediction}</p>
          </div>
        </div>
      )}
    </div>
  );
}
