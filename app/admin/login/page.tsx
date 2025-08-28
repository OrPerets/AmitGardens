'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@/lib/zodResolver';
import dayjs from 'dayjs';
import { AdminAuthSchema } from '@/lib/validators';
import { useToast } from '@/components/ui/toaster';
import { useState as useReactState } from 'react';

type FormData = z.infer<typeof AdminAuthSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useReactState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(AdminAuthSchema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.token) {
        localStorage.setItem('admin_token', json.token);
      }
      toast({ title: 'התחברת בהצלחה' });
      const plan = dayjs().format('YYYY-MM');
      window.location.href = `/admin/plan/${plan}`;
    } else {
      const json = await res.json().catch(() => null);
      setServerError(json?.message || 'שגיאה');
    }
  };

  return (
    <div className="container max-w-md mx-auto p-6">
      <div className="card">
        <div className="card-header text-center">התחברות מנהל</div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="label">אימייל</label>
              <input
                id="email"
                type="email"
                className="input"
                autoComplete="username"
                inputMode="email"
                placeholder="name@example.com"
                aria-invalid={!!errors.email || undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email ? (
                <p id="email-error" className="error-text">{errors.email.message}</p>
              ) : (
                <p className="help-text">נשתמש בזה לאימות מנהלים בלבד</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="label">סיסמה</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password || undefined}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 left-2 my-auto btn btn-ghost h-7 px-2"
                  aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  tabIndex={-1}
                >
                  {showPassword ? 'הסתר' : 'הצג'}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="error-text">{errors.password.message}</p>
              )}
            </div>
            {serverError && (
              <div className="badge bg-destructive/10 text-destructive w-full justify-center py-2" role="alert">
                {serverError}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full"
            >
              {isSubmitting ? 'מתחבר…' : 'התחבר'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
