'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin, rowsAs, adminUsersTable } from '@/lib/supabase';
import { getSession } from '@/lib/supabase-auth';
import type { AdminUserRow } from '@/lib/db-types';

export type { AdminUserRow };

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');

  const supabase = getSupabaseAdmin();
  const { data, error } = await adminUsersTable(supabase)
    .select('id, email, role, created_at')
    .order('created_at', { ascending: true });

  if (error) throw new Error('Failed to load admin users');
  return rowsAs<AdminUserRow>(data);
}

export async function inviteAdminUser(
  email: string,
  password: string,
  role: 'admin' | 'member' | 'developer',
) {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');

  const supabase = getSupabaseAdmin();

  // 1. Create the user in Supabase Auth
  const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    if (createError.message.includes('already registered')) {
      throw new Error('This email is already registered');
    }
    throw new Error(createError.message);
  }

  if (!authUser.user) throw new Error('Failed to create user');

  // 2. Insert into admin_users table with the specified role
  const { error: insertError } = await adminUsersTable(supabase)
    .insert({ id: authUser.user.id, email, role });

  if (insertError) {
    // Rollback: delete the auth user if admin_users insert fails
    await supabase.auth.admin.deleteUser(authUser.user.id).catch(() => {});
    throw new Error('Failed to create admin user');
  }

  revalidatePath('/[locale]/admin/users', 'page');
  return { success: true };
}

export async function updateAdminUserRole(
  userId: string,
  role: 'admin' | 'member' | 'developer',
) {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');

  // Prevent self-demotion
  if (userId === session.user.id) {
    throw new Error('You cannot change your own role');
  }

  const supabase = getSupabaseAdmin();
  const { error } = await adminUsersTable(supabase)
    .update({ role })
    .eq('id', userId);

  if (error) throw new Error('Failed to update role');

  revalidatePath('/[locale]/admin/users', 'page');
  return { success: true };
}

export async function deleteAdminUser(userId: string) {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');

  // Prevent self-deletion
  if (userId === session.user.id) {
    throw new Error('You cannot delete your own account');
  }

  const supabase = getSupabaseAdmin();

  // Delete from admin_users first
  const { error: deleteError } = await adminUsersTable(supabase)
    .delete()
    .eq('id', userId);

  if (deleteError) throw new Error('Failed to delete admin user');

  // Also delete the auth user
  await supabase.auth.admin.deleteUser(userId).catch(() => {});

  revalidatePath('/[locale]/admin/users', 'page');
  return { success: true };
}
