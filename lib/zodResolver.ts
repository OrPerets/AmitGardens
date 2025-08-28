import type { Resolver } from 'react-hook-form';
import { ZodTypeAny } from 'zod';

export function zodResolver<T extends ZodTypeAny>(schema: T): Resolver {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const formErrors: Record<string, any> = {};
    result.error.errors.forEach((err) => {
      const path = err.path[0] as string;
      formErrors[path] = { type: 'validation', message: err.message };
    });
    return { values: {}, errors: formErrors };
  };
}
