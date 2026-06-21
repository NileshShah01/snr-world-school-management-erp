const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'js', 'firebase-config.js');
if (!fs.existsSync(configPath)) {
    console.error('ERROR: js/firebase-config.js not found.');
    console.error('This file contains your Firebase project configuration and is required for deployment.');
    console.error('Create it from js/firebase-config.js.example or your Firebase console.');
    process.exit(1);
}

const content = fs.readFileSync(configPath, 'utf-8');
const hasApiKey = content.includes('apiKey');
if (!hasApiKey) {
    console.error('ERROR: js/firebase-config.js appears to be missing apiKey.');
    process.exit(1);
}

console.log('Firebase config check passed.');
