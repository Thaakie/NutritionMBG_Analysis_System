# Data Folder Guide

## Runtime (dipakai sistem)
- `nutrition.csv`
  - Dataset kerja final untuk seed ke database.
  - Perubahan di file ini langsung berpengaruh ke sistem saat proses seed dijalankan.

## Reference (tidak dipakai runtime harian)
- `reference/tkpi-2017.pdf`
  - Sumber referensi dokumen TKPI.
- `reference/tkpi-reference.csv`
  - Hasil ekstraksi/normalisasi dari referensi TKPI.
  - Dipakai hanya untuk merge/validasi, bukan untuk UI runtime.

## Reports (opsional, untuk audit/laporan)
- `reports/validation-report.csv`
  - Hasil pembandingan `nutrition.csv` vs `reference/tkpi-reference.csv`.
  - Digunakan untuk bukti validasi data ke dosen/penguji.

## Command yang terkait
- `npm run db:seed`
  - Seed database dari `nutrition.csv` (runtime).
- `npm run data:extract-tkpi-pdf`
  - Ekstrak PDF referensi -> `reference/tkpi-reference.csv`.
- `npm run data:merge-tkpi`
  - Merge data referensi ke `nutrition.csv` (opsional).
- `npm run data:validate-report`
  - Generate laporan validasi -> `reports/validation-report.csv`.
