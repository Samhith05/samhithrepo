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
    name: "Robert Davis",
    specialty: "Heating, Ventilation, and Air Conditioning",
    available: true,
    contact: "robert@company.com",
  },
  {
    id: 5,
    name: "Emily Chen",
    specialty: "Civil Structures",
    available: true,
    contact: "emily@company.com",
  },
  {
    id: 6,
    name: "Carlos Martinez",
    specialty: "Common Area Maintenance/Housekeeping",
    available: true,
    contact: "carlos@company.com",
  },
  {
    id: 7,
    name: "Lisa Brown",
    specialty: "General",
    available: true,
    contact: "lisa@company.com",
  },
];

// 🎯 Auto-assign technician based on issue category
export default function assignTechnician(category) {
  try {
    // Normalize category for better matching
    const normalizedCategory = category.toLowerCase().trim();

    // Find available technician with matching specialty
    let assignedTech = technicians.find((tech) => {
      const techSpecialty = tech.specialty.toLowerCase();

      // Direct match
      if (techSpecialty === normalizedCategory && tech.available) {
        return true;
      }

      // Handle HVAC variations
      if (
        (normalizedCategory.includes("hvac") ||
          normalizedCategory.includes("heating") ||
          normalizedCategory.includes("ventilation") ||
          normalizedCategory.includes("air conditioning")) &&
        (techSpecialty.includes("hvac") ||
          techSpecialty.includes(
            "heating, ventilation, and air conditioning"
          )) &&
        tech.available
      ) {
        return true;
      }

      // Handle housekeeping variations
      if (
        (normalizedCategory.includes("housekeeping") ||
          normalizedCategory.includes("common area")) &&
        techSpecialty.includes("common area maintenance/housekeeping") &&
        tech.available
      ) {
        return true;
      }

      return false;
    });

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
