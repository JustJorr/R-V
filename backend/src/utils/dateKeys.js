function getMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getPreviousMonthKey() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getAllowedMonthsForRole(role) {
  const currentMonth = getMonthKey();
  const previousMonth = getPreviousMonthKey();
  if (role === "worker") return new Set([previousMonth]);
  return new Set([currentMonth, previousMonth]);
}

module.exports = {
  getMonthKey,
  getPreviousMonthKey,
  getAllowedMonthsForRole
};
