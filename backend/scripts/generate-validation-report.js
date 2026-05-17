const fs = require("fs");
const path = require("path");

const NUTRITION_PATH = path.join(__dirname, "..", "data", "nutrition.csv");
const REFERENCE_PATH = path.join(__dirname, "..", "data", "reference", "tkpi-reference.csv");
const OUTPUT_PATH = path.join(__dirname, "..", "data", "reports", "validation-report.csv");

const FIELDS = ["calories", "proteins", "fat", "carbohydrate"];
const TOLERANCE = 0.01;

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out;
}

function toCsvCell(value) {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8").replace(/\r/g, "");
  const lines = raw.split("\n").filter((line) => line.trim() !== "");
  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    header.forEach((key, idx) => {
      row[key] = cells[idx] ?? "";
    });
    return row;
  });
  return { header, rows };
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function parseNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function nearlyEqual(a, b, tolerance = TOLERANCE) {
  return Math.abs(a - b) <= tolerance;
}

function main() {
  if (!fs.existsSync(NUTRITION_PATH)) {
    throw new Error(`nutrition.csv tidak ditemukan: ${NUTRITION_PATH}`);
  }
  if (!fs.existsSync(REFERENCE_PATH)) {
    throw new Error(`tkpi-reference.csv tidak ditemukan: ${REFERENCE_PATH}`);
  }

  const nutrition = readCsv(NUTRITION_PATH);
  const reference = readCsv(REFERENCE_PATH);
  const refMap = new Map(reference.rows.map((row) => [normalizeName(row.name), row]));

  const outHeader = [
    "name",
    "status",
    "match_fields",
    "diff_fields",
    ...FIELDS.flatMap((field) => [
      `nutrition_${field}`,
      `reference_${field}`,
      `delta_${field}`,
    ]),
  ];

  let matchCount = 0;
  let diffCount = 0;
  let missingRefCount = 0;

  const outRows = nutrition.rows.map((nRow) => {
    const key = normalizeName(nRow.name);
    const rRow = refMap.get(key);

    if (!rRow) {
      missingRefCount += 1;
      return {
        name: nRow.name,
        status: "MISSING_REF",
        match_fields: "0",
        diff_fields: String(FIELDS.length),
        ...Object.fromEntries(
          FIELDS.flatMap((field) => [
            [`nutrition_${field}`, parseNum(nRow[field])],
            [`reference_${field}`, ""],
            [`delta_${field}`, ""],
          ]),
        ),
      };
    }

    let matched = 0;
    const values = {};
    for (const field of FIELDS) {
      const nVal = parseNum(nRow[field]);
      const rVal = parseNum(rRow[field]);
      const delta = Number((nVal - rVal).toFixed(4));
      if (nearlyEqual(nVal, rVal)) matched += 1;

      values[`nutrition_${field}`] = nVal;
      values[`reference_${field}`] = rVal;
      values[`delta_${field}`] = delta;
    }

    const status = matched === FIELDS.length ? "MATCH" : "DIFF";
    if (status === "MATCH") matchCount += 1;
    else diffCount += 1;

    return {
      name: nRow.name,
      status,
      match_fields: String(matched),
      diff_fields: String(FIELDS.length - matched),
      ...values,
    };
  });

  const lines = [outHeader.join(",")];
  for (const row of outRows) {
    lines.push(outHeader.map((key) => toCsvCell(row[key])).join(","));
  }
  fs.writeFileSync(OUTPUT_PATH, `${lines.join("\n")}\n`, "utf-8");

  console.log("Validation report berhasil dibuat.");
  console.log(`Output: ${OUTPUT_PATH}`);
  console.log(`Total baris nutrition: ${nutrition.rows.length}`);
  console.log(`MATCH: ${matchCount}`);
  console.log(`DIFF: ${diffCount}`);
  console.log(`MISSING_REF: ${missingRefCount}`);
}

main();
