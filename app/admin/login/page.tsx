'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@/lib/zodResolver';
import dayjs from 'dayjs';
import { AdminAuthSchema } from '@/lib/validators';
import { useToast } from '@/components/ui/toaster';

type FormData = z.infer<typeof AdminAuthSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
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
      toast({ title: 'התחברת בהצלחה' });
      const plan = dayjs().format('YYYY-MM');
      router.push(`/admin/plan/${plan}`);
    } else {
      const json = await res.json().catch(() => null);
      setServerError(json?.message || 'שגיאה');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold text-center">התחברות מנהל</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="block">
            אימייל
          </label>
          <input
            id="email"
            type="email"
            className="w-full border p-2"
            {...register('email')}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block">
            סיסמה
          </label>
          <input
            id="password"
            type="password"
            className="w-full border p-2"
            {...register('password')}
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password.message}</p>
          )}
        </div>
        {serverError && (
          <p className="text-red-600 text-sm text-center">{serverError}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          התחבר
        </button>
      </form>
    </div>
  );
}
