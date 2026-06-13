'use server';

import { signIn, signOut } from '@/lib/supabase-auth';
import { getSupabaseAdmin, rowAs, adminUsersTable } from '@/lib/supabase';
import type { AdminUserRole } from '@/lib/db-types';
import { revalidatePath } from 'next/cache';

export async function adminLogin(email: string, password: string) {
  try {
    const data = await signIn(email, password);

    // Verify this user exists in admin_users table (not just any Supabase Auth user)
    const supabase = getSupabaseAdmin();
    const { data: adminUser, error: adminError } = await adminUsersTable(supabase)
      .select('role')
      .eq('id', data.user.id)
      .single();

    const user = rowAs<{ role: AdminUserRole }>(adminUser);
    if (adminError || !user) {
      await signOut().catch(() => {});
      throw new Error('Access denied. This account does not have admin privileges.');
    }

    revalidatePath('/[locale]/admin', 'layout');
    return { success: true, role: user.role };
  } catch (error) {
    if (error instanceof Error) {
      // Surface Supabase errors cleanly
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
    throw new Error('Login failed');
  }
}
