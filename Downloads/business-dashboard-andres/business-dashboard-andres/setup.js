#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Business Dashboard Frontend...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, 'env.local.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env.local from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env.local created successfully!');
  } else {
    console.log('❌ env.local.example not found. Creating basic .env.local...');
    const envContent = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_NAME=Business Dashboard
NEXT_PUBLIC_APP_DESCRIPTION=Manage your business operations efficiently
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local created successfully!');
  }
} else {
  console.log('✅ .env.local already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('\n📦 Installing dependencies...');
  console.log('Run: npm install');
} else {
  console.log('✅ Dependencies already installed');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Make sure your backend server is running on http://localhost:3001');
console.log('2. Run: npm run dev');
console.log('3. Open http://localhost:3000 in your browser');
console.log('4. Login with: eliss@mail.com / 2dfe98f0');
console.log('\n📚 See README.md for more information'); 