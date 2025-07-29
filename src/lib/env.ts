
'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { db } from './db/drizzle';
import { settings as settingsTable } from './db/schema';
import { eq } from 'drizzle-orm';

// Define the shape of the settings object
export interface AppSettings {
    users: { username?: string; password?: string }[];
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_RECIPIENTS?: string;
    SMTP_SECURE?: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    WHATSAPP_NUMBER?: string;
    WHATSAPP_CONTACT_NAME?: string;
    DEFAULT_PASTILLA_IMAGE_URL?: string;
    DEFAULT_DISCO_IMAGE_URL?: string;
}

/**
 * Reads all settings from the database 'settings' table.
 * Falls back to environment variables if the database is unavailable or the table is empty.
 * This is the single source of truth for dynamic application configuration.
 */
export async function getEnvSettings(): Promise<AppSettings> {
    noStore(); // Ensure settings are always fresh

    try {
        const dbSettings = await db.select().from(settingsTable);
        
        if (dbSettings.length > 0) {
            // If we have settings in the DB, parse them into an object
            const settings: Record<string, any> = dbSettings.reduce((acc, { key, value }) => {
                if (value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);
            
            const users = [];
            for (let i = 1; i <= 3; i++) {
                users.push({
                    username: settings[`ADMIN_USER_${i}_USERNAME`],
                    password: settings[`ADMIN_USER_${i}_PASSWORD`],
                });
            }

            return {
                users,
                SMTP_HOST: settings.SMTP_HOST,
                SMTP_PORT: settings.SMTP_PORT,
                SMTP_USER: settings.SMTP_USER,
                SMTP_PASS: settings.SMTP_PASS,
                SMTP_RECIPIENTS: settings.SMTP_RECIPIENTS,
                SMTP_SECURE: settings.SMTP_SECURE,
                CLOUDINARY_CLOUD_NAME: settings.CLOUDINARY_CLOUD_NAME,
                CLOUDINARY_API_KEY: settings.CLOUDINARY_API_KEY,
                CLOUDINARY_API_SECRET: settings.CLOUDINARY_API_SECRET,
                WHATSAPP_NUMBER: settings.WHATSAPP_NUMBER,
                WHATSAPP_CONTACT_NAME: settings.WHATSAPP_CONTACT_NAME,
                DEFAULT_PASTILLA_IMAGE_URL: settings.DEFAULT_PASTILLA_IMAGE_URL,
                DEFAULT_DISCO_IMAGE_URL: settings.DEFAULT_DISCO_IMAGE_URL,
            };
        }

    } catch (error) {
        console.warn(`Could not read from settings table, falling back to environment variables. Error: ${error}`);
    }

    // Fallback logic: read from process.env if DB fails or is empty
    const users = [];
    for (let i = 1; i <= 3; i++) {
        users.push({
            username: process.env[`ADMIN_USER_${i}_USERNAME`],
            password: process.env[`ADMIN_USER_${i}_PASSWORD`],
        });
    }

    return { 
        users,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        SMTP_RECIPIENTS: process.env.SMTP_RECIPIENTS,
        SMTP_SECURE: process.env.SMTP_SECURE,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER,
        WHATSAPP_CONTACT_NAME: process.env.WHATSAPP_CONTACT_NAME,
        DEFAULT_PASTILLA_IMAGE_URL: process.env.DEFAULT_PASTILLA_IMAGE_URL,
        DEFAULT_DISCO_IMAGE_URL: process.env.DEFAULT_DISCO_IMAGE_URL,
    };
}
