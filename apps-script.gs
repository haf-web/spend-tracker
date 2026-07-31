/**
 * SETUP:
 * 1. Go to https://script.google.com → New project (this can be a standalone
 *    script — it targets the spreadsheet below by ID, so it doesn't need to
 *    be created from inside the sheet itself).
 * 2. Delete the placeholder code and paste this in.
 * 3. Change SHEET_NAME below to the exact tab name your expenses table (F16:H100) lives on.
 * 4. Click Deploy → New deployment → type: Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL it gives you — paste it into SCRIPT_URL in index.html.
 * 6. Every time you edit this file, you must re-deploy (Deploy → Manage deployments → Edit → New version)
 *    for changes to take effect.
 * 7. The first time you run/deploy it, Google will ask you to authorize access
 *    to this specific spreadsheet — approve it.
 *
 * Table layout this targets: F16:H100 = Category | Date | Amount
 */

const SPREADSHEET_ID = '1Z3DiJNoDTpn_B5PMBUlJ1OPk1fQZJq2wes_2DHIG4-c';
const SHEET_NAME = 'Sheet1'; // <-- change to your actual tab name
const TABLE_START_ROW = 16;
const TABLE_END_ROW = 100;
const TABLE_START_COL = 6; // column F

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    const range = sheet.getRange(TABLE_START_ROW, TABLE_START_COL, TABLE_END_ROW - TABLE_START_ROW + 1, 1); // column F only
    const categoryColumn = range.getValues();

    let targetRow = -1;
    for (let i = 0; i < categoryColumn.length; i++) {
      if (categoryColumn[i][0] === '' || categoryColumn[i][0] === null) {
        targetRow = TABLE_START_ROW + i;
        break;
      }
    }

    if (targetRow === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Table F16:H100 is full — no empty row left' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Convert incoming YYYY-MM-DD to DD-MM-YYYY
    const [year, month, day] = data.date.split('-');
    const formattedDate = `${day}-${month}-${year}`;

    // F, G, H = Category, Date, Amount
    sheet.getRange(targetRow, TABLE_START_COL, 1, 3).setValues([[
      data.category,
      formattedDate,
      parseFloat(data.amount)
    ]]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', row: targetRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
