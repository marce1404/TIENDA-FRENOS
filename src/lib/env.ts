
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
 * with environment variables. Settings from the database take precedence ONLY if they are not null/empty.
 * This is the single source of truth for dynamic application configuration.
 */
export async function getEnvSettings(): Promise<AppSettings> {
    noStore(); // Ensure settings are always fresh and not cached

    // Start with Vercel/system environment variables as the base
    const finalSettings: Record<string, any> = { ...process.env };

    try {
        const dbResult = await db.select().from(settingsTable);
        
        if (dbResult.length > 0) {
            // Intelligently merge database settings over environment variables
            for (const { key, value } of dbResult) {
                // Only override the environment variable if the database value is valid (not null, undefined, or an empty string)
                if (value) {
                    finalSettings[key] = value;
                }
            }
        }
    } catch (error) {
        // This is not a critical error, as we can still use env vars.
        // It likely means the settings table doesn't exist yet.
        console.warn(`Could not read from settings table, falling back to environment variables. Error: ${error}`);
    }
    
    const users = [];
    for (let i = 1; i <= 3; i++) {
        users.push({
            username: finalSettings[`ADMIN_USER_${i}_USERNAME`],
            password: finalSettings[`ADMIN_USER_${i}_PASSWORD`],
        });
    }

    // Logic to determine `secure` based on the port, prioritizing 465.
    // This makes the configuration robust regardless of the checkbox in the UI.
    const isSecure = finalSettings.SMTP_PORT === '465';

    return { 
        users,
        SMTP_HOST: finalSettings.SMTP_HOST,
        SMTP_PORT: finalSettings.SMTP_PORT,
        SMTP_USER: finalSettings.SMTP_USER,
        SMTP_PASS: finalSettings.SMTP_PASS,
        SMTP_RECIPIENTS: finalSettings.SMTP_RECIPIENTS,
        SMTP_SECURE: isSecure,
        CLOUDINARY_CLOUD_NAME: finalSettings.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: finalSettings.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: finalSettings.CLOUDINARY_API_SECRET,
        WHATSAPP_NUMBER: finalSettings.WHATSAPP_NUMBER,
        WHATSAPP_CONTACT_NAME: finalSettings.WHATSAPP_CONTACT_NAME,
        DEFAULT_PASTILLA_IMAGE_URL: finalSettings.DEFAULT_PASTILLA_IMAGE_URL,
        DEFAULT_DISCO_IMAGE_URL: finalSettings.DEFAULT_DISCO_IMAGE_URL,
    };
}
