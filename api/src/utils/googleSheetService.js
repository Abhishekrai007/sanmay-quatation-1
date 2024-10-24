const { google } = require('googleapis');
const sheets = google.sheets('v4');
const path = require('path');
// Configure Google Sheets credentials
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = '1MjAwmmZxCGlxpm8_ExD3Sm_qDSim_k6qASnwwTz0UWM'; // Replace with your spreadsheet ID
const SHEET_NAME = 'Warsto Quotation';

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../utils/quixotic-card-428217-m6-991872c2add4.json'),
    // Replace with your credentials file path
    scopes: SCOPES,
});

async function appendToSheet(formData) {
    try {
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });

        // Format the selected options
        const formattedOptions = Object.entries(formData.selectedOptions || {})
            .map(([room, options]) => `${room}: ${Array.isArray(options) ? options.join(', ') : options}`)
            .join('\n');

        const values = [
            [
                new Date().toLocaleString(), // More readable timestamp
                formData.bhkType || '',
                formattedOptions || '',
                formData.carpetArea || '',
                formData.name || '',
                formData.email || '',
                formData.phoneNumber || '',
                formData.propertyName || ''
            ]
        ];

        const request = {
            spreadsheetId: SPREADSHEET_ID,
            range: 'A:H', // Simplified range format
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: { values },
        };

        console.log('Attempting to append data:', values); // Debug log

        const response = await googleSheets.spreadsheets.values.append(request);
        console.log('Append response:', response.data); // Debug log
        return response.data;

    } catch (error) {
        console.error('Error in appendToSheet:', error);
        throw new Error(`Error appending to sheet: ${error.message}`);
    }
}


module.exports = { appendToSheet };