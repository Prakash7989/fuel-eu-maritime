import fs from 'fs';
import path from 'path';
import { pool } from './connection';

async function runSeed() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        // Split combined sql by ';' if needed or just run them
        // pg driver doesn't natively support multiple statements separated by ';'
        // in one query call sometimes, but for simple schemas string split works
        const statements = sql.split(';').filter(stmt => stmt.trim() !== '');

        console.log('Running schema setup and seeding...');
        for (const stmt of statements) {
            if (stmt.trim()) {
                await pool.query(stmt);
            }
        }
        console.log('Seed completed successfully.');
    } catch (err) {
        console.error('Error seeding DB:', err);
    } finally {
        await pool.end();
    }
}

runSeed();
