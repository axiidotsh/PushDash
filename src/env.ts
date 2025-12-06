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

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  BETTER_AUTH_SECRET: z
    .string()
    .min(
      32,
      'BETTER_AUTH_SECRET is required and must be at least 32 characters long'
    )
    .regex(
      /^[a-zA-Z0-9]+$/,
      'BETTER_AUTH_SECRET must contain only letters and numbers'
    ),
  APP_URL: z.string().url('APP_URL must be a valid URL'),
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
      const errorMessages = error.issues.map(
        (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
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

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
