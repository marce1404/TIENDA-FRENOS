
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

export type AdminConfig = {
    ADMIN_PASSWORD?: string;
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
    return { ...process.env, ...envFromFile };
}
