import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import { env } from '../../env';
import {
  jsonResponse,
  errorResponse,
  generateCliAuthCode,
  CLI_AUTH_EXPIRY_MS,
} from '../../lib/api-helpers';

export const Route = createFileRoute('/api/auth/cli/init')({
  server: {
    handlers: {
      /**
       * POST /api/auth/cli/init
       * Initialize CLI authentication flow
       * Returns a code and login URL for the user to complete auth in browser
       */
      POST: async () => {
        try {
          // Generate a unique auth code
          let code = generateCliAuthCode();
          let attempts = 0;
          const maxAttempts = 5;

          // Ensure code is unique
          while (attempts < maxAttempts) {
            const existing = await prisma.cliAuthRequest.findUnique({
              where: { code },
            });
            if (!existing) break;
            code = generateCliAuthCode();
            attempts++;
          }

          if (attempts >= maxAttempts) {
            return errorResponse(
              'Failed to generate unique code',
              500,
              'Internal Server Error'
            );
          }

          // Calculate expiration time
          const expiresAt = new Date(Date.now() + CLI_AUTH_EXPIRY_MS);

          // Create the auth request record
          await prisma.cliAuthRequest.create({
            data: {
              code,
              status: 'PENDING',
              expiresAt,
            },
          });

          // Generate the login URL for the browser
          const loginUrl = `${env.APP_URL}/cli/auth?code=${code}`;

          return jsonResponse({
            deviceCode: code, // CLI expects 'deviceCode'
            loginUrl,
            expiresAt: expiresAt.toISOString(),
          });
        } catch (error) {
          console.error('CLI auth init error:', error);
          return errorResponse(
            'Failed to initialize authentication',
            500,
            'Internal Server Error'
          );
        }
      },
    },
  },
});
