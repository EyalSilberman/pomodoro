// =================================================================
//      CONFIGURATION - USERS MUST EDIT THIS SECTION
// =================================================================

// 1. Add a secret key to protect your web app from unauthorized access.
//    This MUST be the same key you enter into the Chrome Extension.
const SECRET_KEY = "CHANGE_THIS_TO_A_STRONG_PASSWORD";

// 2. Enter the ID of the Google Sheet you want to write to.
//    You can get this from the URL of your sheet:
//    https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit
const SHEET_ID = "ENTER_YOUR_GOOGLE_SHEET_ID_HERE";

// =================================================================
//      SCRIPT LOGIC - DO NOT EDIT BELOW THIS LINE
// =================================================================

/**
 * This is the function that runs when your extension sends data.
 * It's the core of the Web App.
 */
function doPost(e) {
  try {
    // Parse the data sent from the extension
    const requestData = JSON.parse(e.postData.contents);

    // Security check: Ensure the request includes the correct secret key
    if (requestData.secret !== SECRET_KEY) {
      return ContentService
        .createTextOutput(JSON.stringify({ "status": "error", "message": "Invalid secret key." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Open the spreadsheet and the first sheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheets()[0]; // Or specify a sheet name: .getSheetByName("Logs")

    // Get the data to log from the request
    const logEntry = requestData.data; // e.g., ["2024-07-09", "10:00 PM", "Development"]

    // Append the new row
    sheet.appendRow(logEntry);

    // Return a success response
    return ContentService
      .createTextOutput(JSON.stringify({ "status": "success", "message": "Row appended." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return an error response if something went wrong
    return ContentService
      .createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}