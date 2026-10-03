const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');
const token = process.argv[2] || process.env.GITHUB_TOKEN;

if (!token) {
  console.error('Usage: node scripts/git_push_with_token.cjs <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>');
  process.exit(1);
}

async function pushWithToken() {
  console.log('Pushing to https://github.com/cuongnguyennguyen1408-hash/ph-th-n.git...');
  try {
    const res = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      onAuth: () => ({
        username: token,
        password: ''
      })
    });
    console.log('✅ Pushed successfully to GitHub!');
    console.log(res);
  } catch (err) {
    console.error('❌ Push error:', err.message);
  }
}

pushWithToken();
