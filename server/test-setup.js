#!/usr/bin/env node

/**
 * Test script to verify backend setup
 * Run with: node test-setup.js
 */

require('dotenv').config();

console.log('🧪 Testing ShopNsplit Backend Setup\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ SET' : '❌ NOT SET'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log(`SESSION_SECRET: ${process.env.SESSION_SECRET ? '✅ SET' : '❌ NOT SET'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`PORT: ${process.env.PORT || 5001}\n`);

// Check if required env vars are missing
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Missing required environment variables!');
    console.log('Please create a .env file with:');
    console.log('SUPABASE_URL=your_supabase_url');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
    console.log('SESSION_SECRET=your_session_secret');
    process.exit(1);
}

// Test Supabase connection
async function testSupabase() {
    try {
        console.log('🔌 Testing Supabase Connection...');
        const { setupDatabase } = require('./supabase');
        await setupDatabase();
        console.log('✅ Supabase connection successful!\n');
        return true;
    } catch (error) {
        console.log('❌ Supabase connection failed:', error.message);
        console.log('\nPossible solutions:');
        console.log('1. Check your Supabase URL and service role key');
        console.log('2. Ensure your Supabase project is active');
        console.log('3. Run the database schema setup in Supabase SQL Editor');
        return false;
    }
}

// Test server startup
async function testServer() {
    try {
        console.log('🚀 Testing Server Startup...');
        const app = require('./index');

        // Wait a moment for server to start
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('✅ Server started successfully!\n');
        return true;
    } catch (error) {
        console.log('❌ Server startup failed:', error.message);
        return false;
    }
}

// Test API endpoints
async function testEndpoints() {
    try {
        console.log('🌐 Testing API Endpoints...');

        const baseUrl = `http://localhost:${process.env.PORT || 5001}`;

        // Test health endpoint
        const healthResponse = await fetch(`${baseUrl}/health`);
        if (healthResponse.ok) {
            console.log('✅ Health endpoint working');
        } else {
            console.log('❌ Health endpoint failed');
        }

        // Test database endpoint
        const dbResponse = await fetch(`${baseUrl}/api/test-db`);
        if (dbResponse.ok) {
            console.log('✅ Database test endpoint working');
        } else {
            console.log('❌ Database test endpoint failed');
        }

        console.log('\n');
        return true;
    } catch (error) {
        console.log('❌ API endpoint test failed:', error.message);
        console.log('Make sure the server is running on the correct port');
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('Starting tests...\n');

    const supabaseOk = await testSupabase();
    if (!supabaseOk) {
        console.log('❌ Supabase test failed. Please fix the issues above.');
        process.exit(1);
    }

    const serverOk = await testServer();
    if (!serverOk) {
        console.log('❌ Server test failed. Please fix the issues above.');
        process.exit(1);
    }

    await testEndpoints();

    console.log('🎉 All tests completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the frontend: npm start (from root directory)');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Test user registration and receipt creation');
    console.log('4. Check the testing checklist in DEPLOYMENT_GUIDE.md');
}

// Run tests
runTests().catch(console.error); 