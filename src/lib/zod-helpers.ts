import { z } from 'zod';

/**
 * Helper functions for working with Zod schemas
 */

/**
 * Creates a schema for partial updates (all fields optional)
 * Useful for PATCH endpoints
 */
export function createPartialSchema<T extends z.ZodObject<any>>(
  schema: T
): z.ZodObject<{
  [K in keyof T['shape']]: z.ZodOptional<T['shape'][K]>;
}> {
  return schema.partial() as any;
}

/**
 * Creates a schema with only specified fields required
 */
export function createPickSchema<
  T extends z.ZodObject<any>,
  K extends keyof T['shape'],
>(schema: T, keys: K[]): z.ZodObject<Pick<T['shape'], K>> {
  return schema.pick(
    keys.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<K, true>)
  ) as any;
}

/**
 * Creates a schema with specified fields omitted
 */
export function createOmitSchema<
  T extends z.ZodObject<any>,
  K extends keyof T['shape'],
>(schema: T, keys: K[]): z.ZodObject<Omit<T['shape'], K>> {
  return schema.omit(
    keys.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<K, true>)
  ) as any;
}

/**
 * Validates data without throwing, returns success/error object
 */
export function safeValidate<T extends z.ZodType>(
  schema: T,
  data: unknown
):
  | { success: true; data: z.infer<T> }
  | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Formats Zod errors into a user-friendly object
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });

  return formatted;
}

/**
 * Gets the first error message from a Zod error
 */
export function getFirstError(error: z.ZodError): string {
  return error.errors[0]?.message || 'Validation failed';
}

/**
 * Merges multiple Zod object schemas
 */
export function mergeSchemas<T extends z.ZodObject<any>[]>(
  ...schemas: T
): z.ZodObject<any> {
  return schemas.reduce((acc, schema) => acc.merge(schema)) as any;
}

/**
 * Creates a discriminated union schema (useful for polymorphic types)
 */
export function createDiscriminatedUnion<
  K extends string,
  T extends [z.ZodObject<any>, ...z.ZodObject<any>[]],
>(discriminator: K, schemas: T): z.ZodDiscriminatedUnion<K, T> {
  return z.discriminatedUnion(discriminator, schemas);
}

/**
 * Creates a preprocessed schema that trims strings before validation
 */
export function trimmedString(): z.ZodEffects<z.ZodString, string, string> {
  return z.preprocess((val) => {
    if (typeof val === 'string') {
      return val.trim();
    }
    return val;
  }, z.string()) as z.ZodEffects<z.ZodString, string, string>;
}

/**
 * Creates a preprocessed schema that converts empty strings to undefined
 */
export function emptyStringToUndefined<T extends z.ZodType>(
  schema: T
): z.ZodEffects<T, z.infer<T> | undefined, unknown> {
  return z.preprocess((val) => {
    if (val === '') {
      return undefined;
    }
    return val;
  }, schema) as z.ZodEffects<T, z.infer<T> | undefined, unknown>;
}

/**
 * Creates a schema that coerces a comma-separated string to an array
 */
export function commaSeparatedArray<T extends z.ZodType>(
  itemSchema: T
): z.ZodEffects<z.ZodType, z.infer<T>[], unknown> {
  return z.preprocess((val) => {
    if (typeof val === 'string') {
      return val.split(',').map((s) => s.trim());
    }
    return val;
  }, z.array(itemSchema)) as z.ZodEffects<z.ZodType, z.infer<T>[], unknown>;
}
