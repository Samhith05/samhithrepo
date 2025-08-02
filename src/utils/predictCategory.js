// src/utils/predictCategory.js

import * as tmImage from "@teachablemachine/image";

// 🔗 Your Teachable Machine model URL (replace with your own)
// IMPORTANT: Update this URL to your new 5-category model that includes:
// 1. Plumbing, 2. Electrical, 3. Civil Structures,
// 4. Common Area Maintenance/Housekeeping, 5. Heating, Ventilation, and Air Conditioning
const modelURL = "https://teachablemachine.withgoogle.com/models/jkm8RlkVB/"; // ← Updated with new 5-category model URL

let model; // cache model after first load

// 🚀 Load the model once and reuse
async function loadModel() {
  if (!model) {
    model = await tmImage.load(
      modelURL + "model.json",
      modelURL + "metadata.json"
    );
  }
}

// 🧠 Predict category from uploaded image
// Expected categories from the updated model:
// - Plumbing
// - Electrical
// - Civil Structures
// - Common Area Maintenance/Housekeeping
// - Heating, Ventilation, and Air Conditioning
export default async function predictCategory(file) {
  try {
    await loadModel(); // ensure model is loaded

    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);

      // Wait for the image to load
      img.onload = async () => {
        try {
          const predictions = await model.predict(img);

          // 🐛 Debug: Log all predictions to see what the model is returning
          console.log("🤖 AI Model Predictions:", predictions);

          // Sort predictions by probability (highest first)
          const sortedPredictions = predictions.sort((a, b) => b.probability - a.probability);
          console.log("📊 Sorted predictions:", sortedPredictions);

          // Pick the label with highest probability
          const best = sortedPredictions[0];
          console.log("🎯 Best prediction:", best);
          console.log("🏷️ Predicted category:", best.className);
          console.log("📈 Confidence:", (best.probability * 100).toFixed(2) + "%");

          // 🔧 Map the predicted category to your 5 expected categories
          const mappedCategory = mapToExpectedCategory(best.className);
          console.log("🗂️ Mapped category:", mappedCategory);

          // Return both category and confidence
          resolve({
            category: mappedCategory,
            confidence: best.probability,
            confidencePercent: (best.probability * 100).toFixed(2)
          });
        } catch (error) {
          console.error("Error during prediction:", error);
          reject(error);
        }
      };

      img.onerror = () => {
        console.error("Error loading image for prediction");
        reject(new Error("Failed to load image"));
      };
    });
  } catch (error) {
    console.error("Error loading model:", error);
    throw error;
  }
}

// 🗂️ Map predicted categories to your expected 5 categories
function mapToExpectedCategory(predictedCategory) {
  const category = predictedCategory.toLowerCase().trim();

  // Your 5 expected categories
  const validCategories = [
    "Plumbing",
    "Electrical",
    "HVAC",
    "Common Area Maintenance/Housekeeping",
    "Civil Structures"
  ];

  // Direct match (case insensitive)
  const directMatch = validCategories.find(
    valid => valid.toLowerCase() === category
  );
  if (directMatch) return directMatch;

  // Pattern matching for variations
  if (category.includes("plumb")) return "Plumbing";
  if (category.includes("electric") || category.includes("wiring")) return "Electrical";
  if (category.includes("hvac") || category.includes("heating") ||
    category.includes("ventilation") || category.includes("air conditioning")) return "HVAC";
  if (category.includes("housekeep") || category.includes("common area") ||
    category.includes("cleaning")) return "Common Area Maintenance/Housekeeping";
  if (category.includes("civil") || category.includes("structural") ||
    category.includes("building")) return "Civil Structures";

  // Default fallback
  console.warn(`⚠️ Unknown category "${predictedCategory}", defaulting to Civil Structures`);
  return "Civil Structures";
}
