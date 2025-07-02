import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadResume(file: File, userId: string): Promise<string> {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `resumes/${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Resume upload error:', uploadError);
    throw new Error('Failed to upload resume');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadProfileImage(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const filePath = `profile-images/${userId}/profile.${fileExt}`;
  const { error } = await supabase.storage.from('profile-images').upload(filePath, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('profile-images').getPublicUrl(filePath);
  return data?.publicUrl || '';
}