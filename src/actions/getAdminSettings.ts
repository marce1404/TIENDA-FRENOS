
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
    
    // Ensure we always have an array of 3 users for the form, using their existing usernames.
    const formUsers = Array.from({ length: 3 }, (_, index) => ({
        username: settings.users[index]?.username,
    }));

    return {
        users: formUsers,
        smtp: {
            host: settings.SMTP_HOST,
            port: settings.SMTP_PORT,
            user: settings.SMTP_USER,
            recipients: settings.SMTP_RECIPIENTS,
            secure: settings.SMTP_SECURE === 'true',
        },
    };
}
