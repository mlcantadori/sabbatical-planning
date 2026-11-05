// Google Calendar sync configuration — OPTIONAL override.
// The trip's OAuth Client ID is baked into calendar.jsx, so this file is
// only needed if you ever rotate the ID: copy to `calendar-config.js`
// (gitignored, never committed) and set window.SABBATICAL_CALENDAR_CLIENT_ID.
//
// Authorized JavaScript origins on the Client ID must include:
//   https://mlcantadori.github.io
//   http://localhost:8000   (local testing)
//
// The same Client ID also powers the Tasks sync (Sync ▾ → Tasks) once the
// Google Tasks API is enabled on the same Cloud project.

window.SABBATICAL_CALENDAR_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
