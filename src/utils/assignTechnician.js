// src/utils/assignTechnician.js

// 👷‍♂️ Mock technician database
const technicians = [
  {
    id: 1,
    name: "John Smith",
    specialty: "Plumbing",
    available: true,
    contact: "john@company.com",
  },
  {
    id: 2,
    name: "Sarah Jones",
    specialty: "Electrical",
    available: true,
    contact: "sarah@company.com",
  },
  {
    id: 3,
    name: "Mike Wilson",
    specialty: "HVAC",
    available: true,
    contact: "mike@company.com",
  },
  {
    id: 4,
    name: "Lisa Brown",
    specialty: "General",
    available: true,
    contact: "lisa@company.com",
  },
];

// 🎯 Auto-assign technician based on issue category
export default function assignTechnician(category) {
  try {
    // Find available technician with matching specialty
    let assignedTech = technicians.find(
      (tech) =>
        tech.specialty.toLowerCase() === category.toLowerCase() &&
        tech.available
    );

    // If no specialist available, assign general technician
    if (!assignedTech) {
      assignedTech = technicians.find(
        (tech) => tech.specialty === "General" && tech.available
      );
    }

    // If still no one available, assign first available
    if (!assignedTech) {
      assignedTech = technicians.find((tech) => tech.available);
    }

    return (
      assignedTech || {
        name: "No technician available",
        contact: "Please contact admin",
        id: null,
      }
    );
  } catch (error) {
    console.error("Error assigning technician:", error);
    return {
      name: "Assignment failed",
      contact: "Please contact admin",
      id: null,
    };
  }
}
