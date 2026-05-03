const FIELD_MAP = {
  workAreaCompliance: {
    en: "Work Area Compliance",
    id: "Kepatuhan Area Kerja"
  },
  taskCompletion: {
    en: "Task Completion",
    id: "Penyelesaian Tugas"
  },
  cleanliness: {
    en: "Cleanliness",
    id: "Kebersihan"
  },
  wasteManagement: {
    en: "Waste Management",
    id: "Pengelolaan Sampah"
  },
  organization: {
    en: "Organization",
    id: "Kerapihan"
  },
  uniformCompliance: {
    en: "Uniform Compliance",
    id: "Kepatuhan Seragam"
  },
  independence: {
    en: "Independence",
    id: "Kemandirian"
  },
  initiative: {
    en: "Initiative",
    id: "Inisiatif"
  },
  teamworkSupport: {
    en: "Teamwork Support",
    id: "Kerja Sama Tim"
  },
  punctuality: {
    en: "Punctuality",
    id: "Ketepatan Waktu"
  },
  attendance: {
    en: "Attendance",
    id: "Kehadiran"
  }
};

// Reverse map (for import)
const REVERSE_MAP = {};
Object.entries(FIELD_MAP).forEach(([key, val]) => {
  REVERSE_MAP[val.en] = key;
  REVERSE_MAP[val.id] = key;
});

module.exports = { FIELD_MAP, REVERSE_MAP };