#!/usr/bin/env node
/**
 * Test IGDB API Connection
 * Quick script to verify IGDB credentials are working
 */

const axios = require('axios');
require('dotenv').config();

const clientId = process.env.IGDB_CLIENT_ID;
const accessToken = process.env.IGDB_ACCESS_TOKEN;

console.log('\n=== IGDB API Test ===\n');

// Check if credentials are set
if (!clientId || !accessToken) {
  console.error('❌ IGDB credentials not found in .env file');
  console.log('   IGDB_CLIENT_ID:', clientId ? '✓ Set' : '✗ Missing');
  console.log('   IGDB_ACCESS_TOKEN:', accessToken ? '✓ Set' : '✗ Missing');
  process.exit(1);
}

console.log('✓ Credentials found');
console.log(`  Client ID: ${clientId.substring(0, 8)}...`);
console.log(`  Token: ${accessToken.substring(0, 8)}...\n`);

// Test API call
const testSearch = async () => {
  console.log('Testing IGDB API...');

  try {
    const response = await axios.post(
      'https://api.igdb.com/v4/games',
      'search "Super Mario"; fields name, cover.url; limit 3;',
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✓ API connection successful!\n');
    console.log('Sample results:');
    response.data.forEach((game, i) => {
      console.log(`  ${i + 1}. ${game.name}`);
      if (game.cover) {
        console.log(`     Cover: https:${game.cover.url}`);
      }
    });
    console.log('\n✅ IGDB API is working correctly!\n');

  } catch (error) {
    console.error('❌ API test failed\n');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);

      if (error.response.status === 401) {
        console.log('\n⚠ Your access token may have expired.');
        console.log('   Generate a new token with:');
        console.log('   ./get-igdb-token.sh\n');
      }
    } else if (error.request) {
      console.error('Network error - no response received');
      console.error('Check your internet connection');
    } else {
      console.error('Error:', error.message);
    }

    process.exit(1);
  }
};

testSearch();
