const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');

async function run() {
  console.log('1. Initializing Git repository in:', dir);
  await git.init({ fs, dir, defaultBranch: 'main' });

  console.log('2. Adding remote origin...');
  try {
    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: 'https://github.com/cuongnguyennguyen1408-hash/ph-th-n.git',
      force: true
    });
  } catch (e) {
    console.log('Remote note:', e.message);
  }

  console.log('3. Staging files...');
  // Read all files ignoring node_modules and .git
  const ignoreList = ['node_modules', '.git', 'dist', '.env'];

  function getAllFiles(currentDir, relativePath = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      if (ignoreList.includes(entry.name)) continue;
      const fullPath = path.join(currentDir, entry.name);
      const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        files = files.concat(getAllFiles(fullPath, rel));
      } else {
        files.push(rel);
      }
    }
    return files;
  }

  const filesToAdd = getAllFiles(dir);
  console.log(`Found ${filesToAdd.length} files to stage.`);

  for (const file of filesToAdd) {
    await git.add({ fs, dir, filepath: file });
  }

  console.log('4. Creating commit...');
  const sha = await git.commit({
    fs,
    dir,
    message: 'feat: Complete Pho Thin Bo Ho website with Supabase backend and admin portal',
    author: {
      name: 'cuongnguyennguyen1408-hash',
      email: 'cuongnguyen@users.noreply.github.com'
    }
  });

  console.log('Commit created successfully! SHA:', sha);

  // Check branch
  const branch = await git.currentBranch({ fs, dir });
  console.log('Current branch:', branch);
}

run().catch(console.error);
