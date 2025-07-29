
'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { db } from './db/drizzle';
import { settings as settingsTable } from './db/schema';

// Define the shape of the settings object
export interface AppSettings {
    users: { username?: string; password?: string }[];
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_RECIPIENTS?: string;
    SMTP_SECURE: boolean; // Guarantee this is always a boolean
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    WHATSAPP_NUMBER?: string;
    WHATSAPP_CONTACT_NAME?: string;
    DEFAULT_PASTILLA_IMAGE_URL?: string;
    DEFAULT_DISCO_IMAGE_URL?: string;
}

/**
 * Reads all settings from the database 'settings' table and merges them
 * with environment variables. Settings from the database take precedence.
 * This is the single source of truth for dynamic application configuration.
 */
export async function getEnvSettings(): Promise<AppSettings> {
    noStore(); // Ensure settings are always fresh and not cached

    let dbSettings: Record<string, any> = {};

    try {
        const dbResult = await db.select().from(settingsTable);
        
        if (dbResult.length > 0) {
            // If we have settings in the DB, parse them into an object
            dbSettings = dbResult.reduce((acc, { key, value }) => {
                if (value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);
        }
    } catch (error) {
        // This is not a critical error, as we can still use env vars.
        // It likely means the settings table doesn't exist yet.
        console.warn(`Could not read from settings table, falling back to environment variables. Error: ${error}`);
    }

    // Combine database settings with process.env, giving DB precedence
    const combinedSettings = {
        // Start with Vercel/system environment variables
        ...process.env,
        // Override with settings from the database
        ...dbSettings,
    };
    
    const users = [];
    for (let i = 1; i <= 3; i++) {
        users.push({
            username: combinedSettings[`ADMIN_USER_${i}_USERNAME`],
            password: combinedSettings[`ADMIN_USER_${i}_PASSWORD`],
        });
    }

    // Logic to determine `secure` based on the port, prioritizing 465.
    const isSecure = combinedSettings.SMTP_PORT === '465';

    return { 
        users,
        SMTP_HOST: combinedSettings.SMTP_HOST,
        SMTP_PORT: combinedSettings.SMTP_PORT,
        SMTP_USER: combinedSettings.SMTP_USER,
        SMTP_PASS: combinedSettings.SMTP_PASS,
        SMTP_RECIPIENTS: combinedSettings.SMTP_RECIPIENTS,
        SMTP_SECURE: isSecure,
        CLOUDINARY_CLOUD_NAME: combinedSettings.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: combinedSettings.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: combinedSettings.CLOUDINARY_API_SECRET,
        WHATSAPP_NUMBER: combinedSettings.WHATSAPP_NUMBER,
        WHATSAPP_CONTACT_NAME: combinedSettings.WHATSAPP_CONTACT_NAME,
        DEFAULT_PASTILLA_IMAGE_URL: combinedSettings.DEFAULT_PASTILLA_IMAGE_URL,
        DEFAULT_DISCO_IMAGE_URL: combinedSettings.DEFAULT_DISCO_IMAGE_URL,
    };
}
