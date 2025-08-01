// src/components/ContractorCategorySelector.jsx

import { useState } from "react";

const CONTRACTOR_CATEGORIES = [
  {
    id: "plumbing",
    name: "Plumbing",
    description: "Water pipes, leaks, drainage issues",
    icon: "🔧",
  },
  {
    id: "electrical",
    name: "Electrical",
    description: "Wiring, outlets, lighting, power issues",
    icon: "⚡",
  },
  {
    id: "civil",
    name: "Civil Structures",
    description: "Building repairs, structural issues, walls",
    icon: "🏗️",
  },
  {
    id: "housekeeping",
    name: "Common Area Maintenance/Housekeeping",
    description: "Cleaning, landscaping, general maintenance",
    icon: "🧹",
  },
  {
    id: "hvac",
    name: "Heating, Ventilation, and Air Conditioning",
    description: "AC, heating systems, ventilation",
    icon: "🌡️",
  },
];

export default function ContractorCategorySelector({
  onCategorySelect,
  onCancel,
}) {
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSubmit = () => {
    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }

    const category = CONTRACTOR_CATEGORIES.find(
      (cat) => cat.id === selectedCategory
    );
    onCategorySelect(category.name, selectedCategory);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border">
        {/* Header */}
        <div className="bg-green-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👷</span>
            <div>
              <h2 className="text-2xl font-bold">Contractor Registration</h2>
              <p className="text-green-100 text-sm mt-1">
                Select your area of expertise
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Choose Your Specialty Category
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Select the category that best matches your expertise. This will
              help us assign relevant maintenance tasks to you.
            </p>
          </div>

          {/* Category Options */}
          <div className="space-y-3 mb-6">
            {CONTRACTOR_CATEGORIES.map((category) => (
              <label
                key={category.id}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedCategory === category.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={selectedCategory === category.id}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-semibold text-gray-800">
                        {category.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-lg">ℹ️</span>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>
                    Your application will be sent to administrators for review
                  </li>
                  <li>You'll receive email notification once approved</li>
                  <li>
                    After approval, you'll be assigned relevant maintenance
                    tasks
                  </li>
                  <li>You can update task status and communicate with users</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!selectedCategory}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                selectedCategory
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Submit Application
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            By submitting this application, you agree to be contacted for
            maintenance tasks in your selected category.
          </p>
        </div>
      </div>
    </div>
  );
}
