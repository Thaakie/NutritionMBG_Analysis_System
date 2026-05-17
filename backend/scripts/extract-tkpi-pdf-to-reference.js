require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const PDF_PATH = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "..", "data", "reference", "tkpi-2017.pdf");
const BASE_CSV_PATH = path.join(__dirname, "..", "data", "nutrition.csv");
const OUTPUT_CSV_PATH = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(__dirname, "..", "data", "reference", "tkpi-reference.csv");

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

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8").replace(/\r/g, "");
  const lines = raw.split("\n").filter((line) => line.trim() !== "");
  const header = parseCsvLine(lines[0]).map((s) => s.trim());
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

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function isNumericToken(token) {
  return /^-?\d+(?:\.\d+)?$/.test(token);
}

function cleanPdfLine(line) {
  return line
    .replace(/\s+/g, " ")
    .replace(/([A-Z]{3,}-)\s+(\d{4})/g, "$1$2")
    .trim();
}

function extractRowsFromPdfText(pdfText) {
  const lines = pdfText
    .replace(/\r/g, "")
    .split("\n")
    .map(cleanPdfLine)
    .filter(Boolean);

  const records = [];
  const codeStartPattern = /^[A-Z]{2}\d{3}\b/;

  for (let i = 0; i < lines.length; i += 1) {
    if (!codeStartPattern.test(lines[i])) continue;

    let candidate = lines[i];
    let j = i + 1;

    // Gabungkan jika baris record terpotong ke baris setelahnya.
    while (j < lines.length && !codeStartPattern.test(lines[j]) && j - i <= 2) {
      candidate = `${candidate} ${lines[j]}`;
      j += 1;
    }

    const tokens = candidate.split(" ");
    const code = tokens[0];

    // Cari deret 5 angka berurutan pertama (air, energi, protein, lemak, karbo).
    let firstNumIdx = -1;
    for (let t = 1; t <= tokens.length - 5; t += 1) {
      if (
        isNumericToken(tokens[t])
        && isNumericToken(tokens[t + 1])
        && isNumericToken(tokens[t + 2])
        && isNumericToken(tokens[t + 3])
        && isNumericToken(tokens[t + 4])
      ) {
        firstNumIdx = t;
        break;
      }
    }

    if (firstNumIdx < 3) continue;

    const nameTokens = tokens.slice(1, firstNumIdx - 1);
    const name = nameTokens.join(" ").trim();
    if (!name) continue;

    const energy = Number(tokens[firstNumIdx + 1]);
    const protein = Number(tokens[firstNumIdx + 2]);
    const fat = Number(tokens[firstNumIdx + 3]);
    const carbs = Number(tokens[firstNumIdx + 4]);

    if (![energy, protein, fat, carbs].every(Number.isFinite)) continue;

    records.push({
      code,
      name,
      calories: energy,
      proteins: protein,
      fat,
      carbohydrate: carbs,
    });
  }

  return records;
}

function writeCsv(filePath, header, rows) {
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(header.map((key) => toCsvCell(row[key])).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf-8");
}

async function main() {
  if (!fs.existsSync(PDF_PATH)) {
    throw new Error(`File PDF tidak ditemukan: ${PDF_PATH}`);
  }

  const base = readCsv(BASE_CSV_PATH);
  const baseByName = new Map(base.rows.map((row) => [normalizeName(row.name), row]));

  const pdfBuffer = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: pdfBuffer });
  const parsed = await parser.getText();
  await parser.destroy();

  const extracted = extractRowsFromPdfText(parsed.text);
  const extractedByName = new Map();
  extracted.forEach((item) => {
    const key = normalizeName(item.name);
    if (!key) return;
    if (!extractedByName.has(key)) {
      extractedByName.set(key, item);
    }
  });

  let matched = 0;
  let replaced = 0;

  const outRows = base.rows.map((row) => {
    const key = normalizeName(row.name);
    const ref = extractedByName.get(key);
    if (!ref) return row;

    matched += 1;
    const next = { ...row };
    const before = `${next.calories}|${next.proteins}|${next.fat}|${next.carbohydrate}`;
    next.calories = String(ref.calories);
    next.proteins = String(ref.proteins);
    next.fat = String(ref.fat);
    next.carbohydrate = String(ref.carbohydrate);
    const after = `${next.calories}|${next.proteins}|${next.fat}|${next.carbohydrate}`;
    if (before !== after) replaced += 1;
    return next;
  });

  writeCsv(OUTPUT_CSV_PATH, base.header, outRows);

  console.log("Ekstraksi TKPI dari PDF selesai.");
  console.log(`- Total baris terdeteksi dari PDF: ${extracted.length}`);
  console.log(`- Nama unik dari PDF            : ${extractedByName.size}`);
  console.log(`- Match ke nutrition.csv        : ${matched}`);
  console.log(`- Baris dengan nilai berubah    : ${replaced}`);
  console.log(`- Output                        : ${OUTPUT_CSV_PATH}`);
}

main().catch((error) => {
  console.error("Gagal ekstraksi:", error.message);
  process.exit(1);
});
