
'use server';
// This file is no longer needed as the logic has been consolidated into uploadImage.ts
// It is kept to avoid breaking imports, but it does nothing.
// In a real scenario, you would delete this file and update any imports.

export async function uploadDefaultImage(formData: FormData): Promise<{ success: false; error: string }> {
  console.warn("uploadDefaultImage is deprecated and should not be used. Use uploadImage instead.");
  return { success: false, error: 'This function is deprecated.' };
}
