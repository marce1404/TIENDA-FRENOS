
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

    const envSettings = { ...process.env };
    let dbSettings: Record<string, any> = {};

    try {
        const dbResult = await db.select().from(settingsTable);
        if (dbResult.length > 0) {
            dbSettings = dbResult.reduce((acc, { key, value }) => {
                if (value) { // Only consider settings from DB if they have a non-empty value
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);
        }
    } catch (error) {
        console.warn(`Could not read from settings table, falling back to environment variables. Error: ${error}`);
    }

    // Merge environment settings and database settings, with database taking precedence for non-empty values.
    const finalSettings = { ...envSettings, ...dbSettings };
    
    const users = [];
    for (let i = 1; i <= 3; i++) {
        users.push({
            username: finalSettings[`ADMIN_USER_${i}_USERNAME`],
            password: finalSettings[`ADMIN_USER_${i}_PASSWORD`],
        });
    }

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
