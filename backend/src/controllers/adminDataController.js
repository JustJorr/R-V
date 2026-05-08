const XLSX = require("xlsx");
const { FIELD_MAP, REVERSE_MAP } = require("../../fieldmap");
const Rating = require("../models/Rating");
const { KPI_FIELDS } = require("../constants/kpiFields");
const { getMonthKey } = require("../utils/dateKeys");

function mapFieldsForExport(data, lang = "en") {
  return data.map((row) => {
    const mapped = {};
    Object.keys(row).forEach((key) => {
      if (FIELD_MAP[key]) mapped[FIELD_MAP[key][lang]] = row[key];
      else mapped[key] = row[key];
    });
    return mapped;
  });
}

function mapFieldsForImport(row) {
  const mapped = {};
  Object.keys(row).forEach((key) => {
    const normalizedKey = REVERSE_MAP[key] || key;
    mapped[normalizedKey] = row[key];
  });
  return mapped;
}

async function exportExcel(req, res) {
  try {
    const lang = req.query.lang || "en";
    const scope = req.query.scope === "overall" ? "overall" : "month";
    const month = req.query.month || getMonthKey();
    const filter = scope === "overall" ? {} : { dateKey: month };

    const ratings = await Rating.find(filter)
      .populate("ratedBy", "name")
      .populate("ratedUser", "name")
      .lean();

    const formatted = ratings.map((r) => {
      const scores = KPI_FIELDS.map((f) => Number(r[f]) || 0);
      const avg = scores.reduce((a, b) => a + b, 0) / KPI_FIELDS.length;

      return {
        Worker: r.ratedUser?.name || "-",
        Supervisor: r.ratedBy?.name || "-",
        Month: r.dateKey || "-",
        Average: Number(avg.toFixed(2)),
        ...KPI_FIELDS.reduce((acc, f) => {
          acc[f] = r[f];
          return acc;
        }, {})
      };
    });

    const mapped = mapFieldsForExport(formatted, lang);
    const worksheet = XLSX.utils.json_to_sheet(mapped);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ratings");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ratings_${scope === "overall" ? "overall" : month}_${lang}.xlsx`
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function importExcel(req, res) {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const mappedData = jsonData.map(mapFieldsForImport);
    await Rating.insertMany(mappedData);

    res.json({ message: "Import successful", count: mappedData.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  exportExcel,
  importExcel
};
