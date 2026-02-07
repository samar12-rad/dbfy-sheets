import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'sheet_user',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'sheetdb',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    console.log('Connected to database!');

    try {
        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Created users table');

        // Create sheets table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS sheets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                owner_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                external_sheet_id VARCHAR(255),
                sync_status ENUM('idle', 'syncing', 'error') DEFAULT 'idle',
                last_synced_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Created sheets table');

        // Create google_oauth_tokens table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS google_oauth_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sheet_id INT NOT NULL UNIQUE,
                access_token TEXT NOT NULL,
                refresh_token TEXT,
                token_expiry TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Created google_oauth_tokens table');

        // Create rows table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`rows\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sheet_id INT NOT NULL,
                row_index INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_row (sheet_id, row_index),
                FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Created rows table');

        // Create cells table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS cells (
                id INT AUTO_INCREMENT PRIMARY KEY,
                row_id INT NOT NULL,
                column_key VARCHAR(10) NOT NULL,
                value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_cell (row_id, column_key),
                FOREIGN KEY (row_id) REFERENCES \`rows\`(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Created cells table');

        // Create activity_logs table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sheet_id INT NOT NULL,
                action VARCHAR(50) NOT NULL,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Created activity_logs table');

        console.log('\n✅ All tables created successfully!');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await connection.end();
    }
}

migrate();
