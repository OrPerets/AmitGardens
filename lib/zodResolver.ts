import type { Resolver, FieldErrors } from 'react-hook-form';
import { z, ZodTypeAny } from 'zod';

type FieldError = { type: string; message: string };

export function zodResolver<TSchema extends ZodTypeAny>(
  schema: TSchema,
): Resolver<z.infer<TSchema>> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const formErrors: FieldErrors<z.infer<TSchema>> = {} as FieldErrors<
      z.infer<TSchema>
    >;
    result.error.errors.forEach((err) => {
      const path = String(err.path[0] ?? 'root');
      // @ts-expect-error - index signature for FieldErrors is complex; runtime shape is fine
      formErrors[path] = { type: 'validation', message: err.message } satisfies FieldError;
    });
    return { values: {}, errors: formErrors };
  };
}
