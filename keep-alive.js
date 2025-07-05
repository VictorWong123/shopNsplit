// Keep-alive script for Render.com free tier
// Run this locally to prevent your service from sleeping

const https = require('https');

function pingService() {
    const url = 'https://shopnsplit.onrender.com/ping';

    https.get(url, (res) => {
        console.log(`✅ Ping successful: ${res.statusCode} - ${new Date().toISOString()}`);
    }).on('error', (err) => {
        console.error(`❌ Ping failed: ${err.message} - ${new Date().toISOString()}`);
    });
}

// Ping every 10 minutes (600000ms)
const PING_INTERVAL = 10 * 60 * 1000;

console.log(`🚀 Keep-alive script started. Pinging every ${PING_INTERVAL / 60000} minutes...`);
console.log(`📡 Target: https://shopnsplit.onrender.com/ping`);

// Initial ping
pingService();

// Set up recurring pings
setInterval(pingService, PING_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Keep-alive script stopped');
    process.exit(0);
}); 