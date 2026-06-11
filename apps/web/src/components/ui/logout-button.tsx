'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/en/admin/login');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/20 glass-btn"
    >
      Log out
    </button>
  );
}
