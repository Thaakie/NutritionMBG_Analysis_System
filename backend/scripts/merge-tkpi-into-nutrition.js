require("dotenv").config();

const fs = require("fs");
const path = require("path");

const BASE_CSV_PATH = path.join(__dirname, "..", "data", "nutrition.csv");
const TKPI_CSV_PATH = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "..", "data", "reference", "tkpi-reference.csv");
const OUTPUT_CSV_PATH = process.argv[3]
  ? path.resolve(process.argv[3])
  : BASE_CSV_PATH;

// Hanya field yang ada di nutrition.csv
const ALLOWED_FIELDS = ["id", "calories", "proteins", "fat", "carbohydrate", "name", "image", "price"];
const NUMERIC_FIELDS = ["calories", "proteins", "fat", "carbohydrate", "price"];

function parseCsvLine(line) {
  const result = [];
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
      result.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  result.push(current);
  return result;
}

function toCsvCell(value) {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumeric(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8").replace(/\r/g, "");
  const lines = raw.split("\n").filter((line) => line.trim() !== "");
  if (lines.length < 2) {
    throw new Error(`CSV kosong atau tidak valid: ${filePath}`);
  }

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

function buildTkpiIndex(rows) {
  const byName = new Map();

  for (const row of rows) {
    const key = normalizeName(row.name);
    if (!key) continue;

    const candidate = {
      calories: parseNumeric(row.calories),
      proteins: parseNumeric(row.proteins),
      fat: parseNumeric(row.fat),
      carbohydrate: parseNumeric(row.carbohydrate),
      name: row.name || "",
      image: row.image || "",
      id: row.id || "",
    };

    // Jika duplikat nama, pilih yang total zat gizi lebih informatif.
    const score = candidate.calories + candidate.proteins + candidate.fat + candidate.carbohydrate;
    const prev = byName.get(key);
    if (!prev || score > prev.score) {
      byName.set(key, { ...candidate, score });
    }
  }

  return byName;
}

function mergeRows(baseRows, tkpiByName) {
  let matched = 0;
  let updatedCells = 0;

  const mergedRows = baseRows.map((row) => {
    const key = normalizeName(row.name);
    const ref = tkpiByName.get(key);
    if (!ref) return row;

    matched += 1;
    const next = { ...row };

    for (const field of NUMERIC_FIELDS) {
      const baseValue = parseNumeric(next[field]);
      const refValue = parseNumeric(ref[field]);

      // Aturan: isi hanya jika base kosong/0 dan referensi > 0
      if (baseValue <= 0 && refValue > 0) {
        next[field] = String(refValue);
        updatedCells += 1;
      }
    }

    // Isi image jika kosong
    if ((!next.image || !String(next.image).trim()) && ref.image && String(ref.image).trim()) {
      next.image = ref.image;
      updatedCells += 1;
    }

    return next;
  });

  return { mergedRows, matched, updatedCells };
}

function validateHeader(header, filePath) {
  const missing = ALLOWED_FIELDS.filter((field) => !header.includes(field));
  if (missing.length) {
    throw new Error(
      `Header ${filePath} tidak cocok. Field kurang: ${missing.join(", ")}. Harus mengandung: ${ALLOWED_FIELDS.join(", ")}`,
    );
  }
}

function writeCsv(filePath, header, rows) {
  const outputHeader = header.filter((h) => ALLOWED_FIELDS.includes(h));
  const lines = [outputHeader.join(",")];

  for (const row of rows) {
    const line = outputHeader.map((key) => toCsvCell(row[key])).join(",");
    lines.push(line);
  }

  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf-8");
}

function main() {
  console.log("Mulai merge TKPI -> nutrition.csv (field terbatas)...");
  console.log(`Base   : ${BASE_CSV_PATH}`);
  console.log(`Ref    : ${TKPI_CSV_PATH}`);
  console.log(`Output : ${OUTPUT_CSV_PATH}`);

  const base = readCsv(BASE_CSV_PATH);
  const tkpi = readCsv(TKPI_CSV_PATH);

  validateHeader(base.header, BASE_CSV_PATH);
  validateHeader(tkpi.header, TKPI_CSV_PATH);

  const tkpiIndex = buildTkpiIndex(tkpi.rows);
  const { mergedRows, matched, updatedCells } = mergeRows(base.rows, tkpiIndex);

  writeCsv(OUTPUT_CSV_PATH, base.header, mergedRows);

  console.log("");
  console.log("Selesai.");
  console.log(`- Total baris base        : ${base.rows.length}`);
  console.log(`- Nama yang match         : ${matched}`);
  console.log(`- Jumlah field terupdate  : ${updatedCells}`);
  console.log(`- Field yang dipakai      : ${ALLOWED_FIELDS.join(", ")}`);
}

main();
