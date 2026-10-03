const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');

async function testPush() {
  console.log('Attempting git push to origin main...');
  try {
    const res = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      onAuth: () => {
        console.log('GitHub requested credentials...');
        return undefined; // no credentials yet
      }
    });
    console.log('Push result:', res);
  } catch (err) {
    console.log('Push error code:', err.code);
    console.log('Push error message:', err.message);
  }
}

testPush();
