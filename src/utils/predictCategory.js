// src/utils/predictCategory.js

import * as tmImage from "@teachablemachine/image";

// 🔗 Your Teachable Machine model URL (replace with your own)
const modelURL = "https://teachablemachine.withgoogle.com/models/aBot4tINb/"; // ← Replace this

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

          // Pick the label with highest probability
          const best = predictions.reduce((a, b) =>
            a.probability > b.probability ? a : b
          );

          resolve(best.className); // e.g., "Plumbing"
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
