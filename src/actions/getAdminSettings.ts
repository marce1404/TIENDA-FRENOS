
'use server';

import { getEnvSettings } from '@/lib/env';
import { unstable_noStore as noStore } from 'next/cache';

export interface AdminSettingsForForm {
    users: { username: string | undefined }[];
    smtp: {
        host: string | undefined;
        port: string | undefined;
        user: string | undefined;
        recipients: string | undefined;
        secure: boolean;
    };
    whatsapp: {
        number: string | undefined;
        contactName: string | undefined;
    };
    defaultImages: {
        pastillaUrl: string | undefined;
        discoUrl: string | undefined;
        otroUrl: string | undefined;
    };
    cloudinary: {
        cloudName: string | undefined;
        apiKey: string | undefined;
    };
}


export async function getAdminSettingsForForm(): Promise<AdminSettingsForForm> {
    noStore();
    const settings = await getEnvSettings();
    
    // Explicitly map to the required structure to avoid any serialization issues with extra properties.
    const usersForForm = settings.users.map(u => ({ username: u.username }));

    return {
        users: usersForForm,
        smtp: {
            host: settings.SMTP_HOST,
            port: settings.SMTP_PORT,
            user: settings.SMTP_USER,
            recipients: settings.SMTP_RECIPIENTS,
            secure: settings.SMTP_SECURE,
        },
        whatsapp: {
            number: settings.WHATSAPP_NUMBER,
            contactName: settings.WHATSAPP_CONTACT_NAME,
        },
        defaultImages: {
            pastillaUrl: settings.DEFAULT_PASTILLA_IMAGE_URL,
            discoUrl: settings.DEFAULT_DISCO_IMAGE_URL,
            otroUrl: settings.DEFAULT_OTRO_IMAGE_URL,
        },
        cloudinary: {
            cloudName: settings.CLOUDINARY_CLOUD_NAME,
            apiKey: settings.CLOUDINARY_API_KEY,
        }
    };
}

    