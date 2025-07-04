
'use server';

import { getEnvSettings } from '@/lib/env';

export interface AdminSettingsForForm {
    users: { username: string | undefined }[];
    smtp: {
        host: string | undefined;
        port: string | undefined;
        user: string | undefined;
        recipients: string | undefined;
        secure: boolean;
    };
}


export async function getAdminSettingsForForm(): Promise<AdminSettingsForForm> {
    const settings = await getEnvSettings();
    
    // settings.users is now an array of 3 user objects, which matches the required structure.
    return {
        users: settings.users,
        smtp: {
            host: settings.SMTP_HOST,
            port: settings.SMTP_PORT,
            user: settings.SMTP_USER,
            recipients: settings.SMTP_RECIPIENTS,
            secure: settings.SMTP_SECURE === 'true',
        },
    };
}
