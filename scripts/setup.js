#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up RGAP v2.0...\n');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, errorMessage) {
    try {
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        log(`❌ ${errorMessage}`, 'red');
        return false;
    }
}

// 1. Check prerequisites
log('📋 Checking prerequisites...', 'blue');

try {
    execSync('node --version', { stdio: 'pipe' });
    log('✅ Node.js is installed', 'green');
} catch {
    log('❌ Node.js is not installed. Please install Node.js 18+ first.', 'red');
    process.exit(1);
}

try {
    execSync('docker --version', { stdio: 'pipe' });
    log('✅ Docker is installed', 'green');
} catch {
    log('⚠️  Docker is not installed. You can still run the app, but you\'ll need a PostgreSQL server.', 'yellow');
}

// 2. Check if .env.local exists
log('\n📝 Setting up environment variables...', 'blue');
if (!fs.existsSync('.env.local')) {
    log('Creating .env.local from .env.example...', 'blue');
    fs.copyFileSync('.env.example', '.env.local');
    log('✅ .env.local created', 'green');
} else {
    log('✅ .env.local already exists', 'green');
}

// 3. Install dependencies
log('\n📦 Installing dependencies...', 'blue');
if (!exec('npm install', 'Failed to install dependencies')) {
    process.exit(1);
}
log('✅ Dependencies installed', 'green');

// 4. Start Docker services (optional)
log('\n🐳 Starting Docker services...', 'blue');
try {
    execSync('docker --version', { stdio: 'pipe' });

    log('Starting PostgreSQL container...', 'blue');
    if (exec('docker compose up -d', 'Failed to start Docker services')) {
        log('✅ PostgreSQL is starting...', 'green');
        log('⏳ Waiting 10 seconds for database initialization...', 'yellow');

        // Wait for database to be ready
        setTimeout(() => {
            log('✅ Database should be ready now!', 'green');
        }, 10000);
    }
} catch {
    log('⚠️  Skipping Docker setup (Docker not available)', 'yellow');
}

// 5. Final instructions
log('\n✅ Setup complete!', 'green');
log('\n📚 Next steps:', 'blue');
log('1. Make sure the database is running:', 'reset');
log('   docker compose up -d\n', 'yellow');
log('2. Start the development server:', 'reset');
log('   npm run dev\n', 'yellow');
log('3. Open your browser to:', 'reset');
log('   http://localhost:3000\n', 'yellow');

log('🔍 Optional: View database with PgAdmin:', 'blue');
log('   docker compose --profile tools up -d pgadmin', 'yellow');
log('   Then visit: http://localhost:5050', 'yellow');
log('   Login: admin@rgap.local / admin\n', 'yellow');

log('📖 Read README.md for more information!', 'blue');
log('🎉 Happy coding!\n', 'green');