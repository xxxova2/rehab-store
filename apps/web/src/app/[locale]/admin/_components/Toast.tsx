'use client';

import { useEffect, useState } from 'react';
import styles from './toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
  onDismiss: (id: number) => void;
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
};

export function Toast({ id, message, type, duration, onDismiss }: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration <= 0) return;
    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        window.clearInterval(interval);
        setIsLeaving(true);
      }
    }, 50);

    const timeout = window.setTimeout(() => {
      setIsLeaving(true);
    }, duration);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [duration]);

  useEffect(() => {
    if (!isLeaving) return;
    const t = window.setTimeout(() => onDismiss(id), 180);
    return () => window.clearTimeout(t);
  }, [isLeaving, id, onDismiss]);

  const handleClose = () => {
    setIsLeaving(true);
  };

  return (
    <div
      role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`${styles.toast} ${styles[type]} ${
        isLeaving ? styles.leaving : ''
      }`}
    >
      <span className={styles.icon} aria-hidden="true">
        {ICONS[type]}
      </span>
      <p className={styles.message}>{message}</p>
      <button
        type="button"
        onClick={handleClose}
        className={styles.close}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
      {duration > 0 && (
        <div
          className={styles.progress}
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
