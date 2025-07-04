
import fs from 'fs/promises';
import path from 'path';

export type SmtpConfig = {
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_RECIPIENTS?: string;
    SMTP_SECURE?: string;
};

export type AdminUser = {
    username?: string;
    password?: string;
}

export type AdminConfig = {
    users: AdminUser[];
};

type EnvConfig = SmtpConfig & AdminConfig;

async function readEnvFile(): Promise<Record<string, string>> {
  const envPath = path.resolve(process.cwd(), '.env');
  try {
    const content = await fs.readFile(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    content.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key) {
          let value = valueParts.join('=').trim();
          // remove quotes if they exist
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
             value = value.slice(1, -1);
          }
          envVars[key.trim()] = value;
        }
      }
    });
    return envVars;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {}; // File doesn't exist, return empty object
    }
    console.error('Error reading .env file:', error);
    return {};
  }
}

/**
 * Reads settings from the .env file dynamically.
 * This should be used in server actions to get the most up-to-date values
 * without requiring a server restart.
 * It merges values from the .env file with those in process.env,
 * with the .env file taking precedence.
 */
export async function getEnvSettings(): Promise<EnvConfig> {
    const envFromFile = await readEnvFile();
    
    // Values from .env file override any existing process.env values.
    const combinedEnv = { ...process.env, ...envFromFile };

    const users: AdminUser[] = [];
    const maxUsers = 3;

    for (let i = 1; i <= maxUsers; i++) {
        const usernameKey = `ADMIN_USER_${i}_USERNAME`;
        const passwordKey = `ADMIN_USER_${i}_PASSWORD`;
        
        let username = combinedEnv[usernameKey];
        let password = combinedEnv[passwordKey];

        // Migration for user 1 from old variables if new ones don't exist
        if (i === 1 && username === undefined && combinedEnv.ADMIN_USERNAME) {
            username = combinedEnv.ADMIN_USERNAME;
            password = combinedEnv.ADMIN_PASSWORD;
        }

        users.push({ username, password });
    }

    return { 
        users,
        SMTP_HOST: combinedEnv.SMTP_HOST,
        SMTP_PORT: combinedEnv.SMTP_PORT,
        SMTP_USER: combinedEnv.SMTP_USER,
        SMTP_PASS: combinedEnv.SMTP_PASS,
        SMTP_RECIPIENTS: combinedEnv.SMTP_RECIPIENTS,
        SMTP_SECURE: combinedEnv.SMTP_SECURE,
    };
}
