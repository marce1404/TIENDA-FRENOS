
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
    
    // Explicitly map to the required structure to avoid any serialization issues with extra properties.
    const usersForForm = settings.users.map(u => ({ username: u.username }));

    return {
        users: usersForForm,
        smtp: {
            host: settings.SMTP_HOST,
            port: settings.SMTP_PORT,
            user: settings.SMTP_USER,
            recipients: settings.SMTP_RECIPIENTS,
            secure: settings.SMTP_SECURE === 'true',
        },
    };
}
