const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Paths to JSON files
const BUGS_PATH = path.join(__dirname, 'chatbot_backend', 'data', 'bugs.json');
const RESERVATIONS_PATH = path.join(__dirname, 'chatbot_backend', 'data', 'reservations.json');

// Clear bugs older than 2 weeks
function clearOldBugs() {
    if (!fs.existsSync(BUGS_PATH)) return;
    let bugs = [];
    try {
        bugs = JSON.parse(fs.readFileSync(BUGS_PATH, 'utf-8'));
    } catch {
        bugs = [];
    }
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const filtered = bugs.filter(bug => {
        const bugDate = new Date(`${bug.date}T${bug.time}`);
        return bugDate.getTime() >= twoWeeksAgo;
    });
    fs.writeFileSync(BUGS_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
}

// Remove reservations after their date and time has passed
function clearOldReservations() {
    if (!fs.existsSync(RESERVATIONS_PATH)) return;
    let reservations = [];
    try {
        reservations = JSON.parse(fs.readFileSync(RESERVATIONS_PATH, 'utf-8'));
    } catch {
        reservations = [];
    }
    const now = Date.now();
    const filtered = reservations.filter(res => {
        // Assumes reservation has date, start, end fields
        // date: "YYYY-MM-DD", start: hour (int), end: hour (int)
        const endHour = res.end || res.start;
        const resDateTime = new Date(res.date);
        resDateTime.setHours(endHour, 0, 0, 0);
        return resDateTime.getTime() > now;
    });
    fs.writeFileSync(RESERVATIONS_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
}

// Run cleaning
function runCleaning() {
    clearOldBugs();
    clearOldReservations();
    console.log("Data cleaning completed at", new Date().toLocaleString());
}

// Schedule to run once a day at 2:00 AM
cron.schedule('0 2 * * *', runCleaning);

// Optionally, run once immediately when script starts
runCleaning();