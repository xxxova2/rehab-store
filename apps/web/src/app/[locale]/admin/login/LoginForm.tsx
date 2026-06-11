'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { adminLogin } from './actions';
import styles from './login.module.css';

interface LoginFormProps {
  locale: 'ar' | 'en';
}

export function LoginForm({ locale }: LoginFormProps) {
  const router = useRouter();
  const t = useTranslations('admin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await adminLogin(email, password);
      router.replace(`/${locale}/admin/products`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>{t('login.emailLabel')}</label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          className={styles.input}
          placeholder={t('login.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>{t('login.passwordLabel')}</label>
        <input
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          className={styles.input}
          placeholder={t('login.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>

      {error && (<p id="login-error" className={styles.error} role="alert">{error}</p>)}

      <button type="submit" className={styles.submitBtn} disabled={isLoading}>
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
        {isLoading ? t('login.loading') : t('login.submit')}
      </button>
    </form>
  );
}