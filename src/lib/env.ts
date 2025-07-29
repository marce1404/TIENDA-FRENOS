
'use server';

import { db } from './db/drizzle';
import { settings as settingsTable } from './db/schema';
import { unstable_noStore as noStore } from 'next/cache';

export type SmtpConfig = {
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_RECIPIENTS?: string;
    SMTP_SECURE?: string;
};

export type CloudinaryConfig = {
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
};

export type AdminUser = {
    username?: string;
    password?: string;
}

export type AdminConfig = {
    users: AdminUser[];
};

type AllConfig = AdminConfig & SmtpConfig & CloudinaryConfig;

/**
 * Reads all settings from the 'settings' table in the database.
 * This is now the single source of truth for dynamic application configuration.
 * It also falls back to process.env for values that might be set there,
 * with database values taking precedence.
 */
export async function getEnvSettings(): Promise<AllConfig> {
    noStore(); // Ensure settings are always fresh

    let dbSettings: Record<string, string> = {};
    try {
        const settingsResult = await db.select().from(settingsTable);
        settingsResult.forEach(row => {
            if (row.value !== null) {
                dbSettings[row.key] = row.value;
            }
        });
    } catch (error) {
        // This might happen if the table doesn't exist yet (e.g., first run before migration)
        console.warn('Could not read from settings table. Falling back to environment variables.', error);
    }
    
    // Combine environment variables and database settings.
    // Database values override environment variables.
    const combinedConfig = { ...process.env, ...dbSettings };
    
    const users: AdminUser[] = [];
    const maxUsers = 3;

    for (let i = 1; i <= maxUsers; i++) {
        const username = combinedConfig[`ADMIN_USER_${i}_USERNAME`];
        const password = combinedConfig[`ADMIN_USER_${i}_PASSWORD`];
        
        // Only add user if username is present.
        if (username) {
            users.push({ username, password });
        } else {
            // Push an empty object as a placeholder for the admin form.
            users.push({});
        }
    }

    return { 
        users,
        SMTP_HOST: combinedConfig.SMTP_HOST,
        SMTP_PORT: combinedConfig.SMTP_PORT,
        SMTP_USER: combinedConfig.SMTP_USER,
        SMTP_PASS: combinedConfig.SMTP_PASS,
        SMTP_RECIPIENTS: combinedConfig.SMTP_RECIPIENTS,
        SMTP_SECURE: combinedConfig.SMTP_SECURE,
        CLOUDINARY_CLOUD_NAME: combinedConfig.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: combinedConfig.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: combinedConfig.CLOUDINARY_API_SECRET,
    };
}
