import { z } from 'zod';

/**
 * Environment variables validation schema
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .url('DATABASE_URL must be a valid URL'),

  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Optional: Better-auth secret (recommended for production)
  BETTER_AUTH_SECRET: z.string().optional(),

  // Optional: Base URL for the application
  BETTER_AUTH_URL: z.string().url().optional(),
});

/**
 * Validate and export environment variables
 * This will fail fast on app startup if required env vars are missing
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `  - ${err.path.join('.')}: ${err.message}`
      );

      console.error('❌ Invalid environment variables:');
      console.error(errorMessages.join('\n'));
      console.error(
        '\nPlease check your .env.local file and fix the issues above.'
      );

      throw new Error('Invalid environment variables');
    }
    throw error;
  }
}

/**
 * Validated environment variables
 * Type-safe access to environment variables throughout the application
 */
export const env = validateEnv();

/**
 * Type for environment variables
 */
export type Env = z.infer<typeof envSchema>;
