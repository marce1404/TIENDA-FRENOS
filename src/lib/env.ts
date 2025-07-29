
'use server';

import { unstable_noStore as noStore } from 'next/cache';

// This file reads configuration directly from Vercel's environment variables.
// The 'settings' table approach was removed due to schema synchronization issues.

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

export type WhatsAppConfig = {
    WHATSAPP_NUMBER?: string;
    WHATSAPP_CONTACT_NAME?: string;
}

export type DefaultImagesConfig = {
    DEFAULT_PASTILLA_IMAGE_URL?: string;
    DEFAULT_DISCO_IMAGE_URL?: string;
}

export type AdminUser = {
    username?: string;
    password?: string;
}

export type AdminConfig = {
    users: AdminUser[];
};

type AllConfig = AdminConfig & SmtpConfig & CloudinaryConfig & WhatsAppConfig & DefaultImagesConfig;

/**
 * Reads all settings from process.env.
 * This is the single source of truth for dynamic application configuration in a serverless environment like Vercel.
 */
export async function getEnvSettings(): Promise<AllConfig> {
    noStore(); // Ensure settings are always fresh

    const users: AdminUser[] = [];
    const maxUsers = 3;

    for (let i = 1; i <= maxUsers; i++) {
        const username = process.env[`ADMIN_USER_${i}_USERNAME`];
        const password = process.env[`ADMIN_USER_${i}_PASSWORD`];
        
        if (username) {
            users.push({ username, password });
        } else {
            users.push({});
        }
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
