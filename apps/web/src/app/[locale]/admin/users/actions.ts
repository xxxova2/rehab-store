'use server';

import { revalidatePath } from 'next/cache';
import { adminFetch } from '../_lib/api';
import type { ActionResult } from '../_lib/types';

export type { ActionResult };

export async function inviteUserAction(
  locale: string,
  formData: FormData
): Promise<ActionResult> {
  const email = ((formData.get('email') as string) ?? '').trim();
  const firstName = ((formData.get('first_name') as string) ?? '').trim();
  const lastName = ((formData.get('last_name') as string) ?? '').trim();
  const role = ((formData.get('role') as string) ?? 'member') as
    | 'admin'
    | 'member'
    | 'developer';

  if (!email) {
    return { error: 'Email is required' };
  }

  try {
    await adminFetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email, first_name: firstName, last_name: lastName, role }),
    });
  } catch (error) {
    console.error('Invite user error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to invite user',
    };
  }

  revalidatePath(`/${locale}/admin/users`);
  return { success: true };
}

export async function updateUserRoleAction(
  locale: string,
  userId: string,
  role: 'admin' | 'member' | 'developer'
): Promise<ActionResult> {
  try {
    await adminFetch(`/admin/users/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  } catch (error) {
    console.error('Update role error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to update role',
    };
  }

  revalidatePath(`/${locale}/admin/users`);
  return { success: true };
}

export async function deleteUserAction(
  locale: string,
  userId: string
): Promise<ActionResult> {
  try {
    await adminFetch(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete user',
    };
  }

  revalidatePath(`/${locale}/admin/users`);
  return { success: true };
}
