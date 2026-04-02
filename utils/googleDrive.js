const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

// Lista archivos dentro de una carpeta
async function listFiles(folderId) {
    const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, size, webViewLink, mimeType)',
        orderBy: 'name',
        pageSize: 100,
    });
    return response.data.files;
}

// Busca una subcarpeta por nombre dentro de la carpeta raíz
async function findSubfolder(rootFolderId, folderName) {
    const response = await drive.files.list({
        q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)',
    });

    const folders = response.data.files;
    // Busca coincidencia exacta o parcial del nombre del circuito
    return folders.find(f => f.name.toLowerCase() === folderName.toLowerCase()) ||
           folders.find(f => f.name.toLowerCase().includes(folderName.toLowerCase()));
}

// Descarga un archivo
async function downloadFile(fileId, fileName) {
    const destPath = path.join('./temp', fileName);
    fs.mkdirSync('./temp', { recursive: true });

    const dest = fs.createWriteStream(destPath);
    const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
    );

    return new Promise((resolve, reject) => {
        response.data
            .on('end', () => resolve(destPath))
            .on('error', (err) => {
                if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                reject(err);
            })
            .pipe(dest);
    });
}

module.exports = { listFiles, findSubfolder, downloadFile };