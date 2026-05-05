/**
 * Fungsi utama untuk merender halaman web
 */
function doGet() {
  // Mengambil template Index.html
  var template = HtmlService.createTemplateFromFile('Index');
  
  // Mengatur agar tampilan responsif di perangkat mobile
  return template.evaluate()
      .setTitle("Ujian Generator - Login")
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Fungsi pembantu untuk memisahkan file HTML/CSS/JS
 * (Sangat disarankan agar kode rapi)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * LOGIKA LOGIN (Placeholder untuk dihubungkan ke Sheets nanti)
 */
// GANTI ID INI dengan ID Spreadsheet Anda
const SPREADSHEET_ID = "1JN-5e9nrMCqRN-uqb5c20P7zw7j6QzKJQROhzcMFphs"; 
const SHEET_NAME = "users"; // Pastikan nama sheet/tab di bawah adalah 'users'

function processLogin(email, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  // Mengambil data dari baris 2 sampai baris terakhir
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { success: false, message: "Database kosong!" };
  
  const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  
  // Normalisasi input login (hapus spasi dan buat huruf kecil untuk email)
  const inputEmail = String(email).trim().toLowerCase();
  const inputPass = String(password).trim();

  for (var i = 0; i < data.length; i++) {
    let rowNama   = data[i][0];
    let rowEmail  = String(data[i][1]).trim().toLowerCase(); // Kolom B
    let rowPass   = String(data[i][2]).trim();               // Kolom C
    let rowRole   = String(data[i][3]).trim().toLowerCase(); // Kolom D
    let rowStatus = String(data[i][4]).trim().toLowerCase(); // Kolom E

    if (rowEmail === inputEmail && rowPass === inputPass) {
      if (rowStatus !== "active") {
        return { success: false, message: "Akun Anda belum aktif. Hubungi Admin." };
      }
      
      return { 
        success: true, 
        role: rowRole, 
        nama: rowNama 
      };
    }
  }
  
  return { success: false, message: "Email atau Password salah!" };
}


/**
 * FUNGSI REGISTRASI (Fungsi ini bertugas mengecek apakah email sudah terdaftar dan jika belum, akan menambahkannya ke baris baru.)
 */
function processRegistration(nama, email) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // 1. Cek apakah email sudah ada
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      return { success: false, message: "Email ini sudah terdaftar!" };
    }
  }
  
  // 2. Jika belum ada, masukkan data baru
  // Format: [nama, email, password, role, status]
  sheet.appendRow([
    nama, 
    email, 
    "MENUNGGU_KONFIRMASI", // Password sementara
    "user",                // Role default
    "pending"              // Status awal
  ]);
  
  return { success: true, message: "Registrasi berhasil! Silakan hubungi admin untuk mendapatkan password." };
}



/**
 * Dashboard Admin
 */
// Fungsi untuk mengambil semua user yang berstatus 'pending'
function getPendingUsers() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  let pendingUsers = [];
  
  // Looping mulai baris ke-2 (index 1)
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === "pending") {
      pendingUsers.push({
        row: i + 1, // Simpan nomor baris untuk mempermudah update nanti
        nama: data[i][0],
        email: data[i][1]
      });
    }
  }
  return pendingUsers;
}

// Fungsi untuk mengaktifkan user (Update password dan status)
function approveUser(row, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  // Update kolom Password (kolom 3) dan Status (kolom 5)
  sheet.getRange(row, 3).setValue(password);
  sheet.getRange(row, 5).setValue("active");
  
  return { success: true, message: "User berhasil diaktifkan!" };
}

function getSpreadsheetUrl() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    return ss.getUrl();
  } catch (e) {
    return null;
  }
}