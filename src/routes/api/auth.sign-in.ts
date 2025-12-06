import { createFileRoute } from '@tanstack/react-router';
import { auth } from '../../auth';
import { signInSchema } from '../../schemas/auth.schema';
import { validateRequestBody } from '../../lib/validation';

export const Route = createFileRoute('/api/auth/sign-in')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Validate request body before passing to better-auth
        await validateRequestBody(request, signInSchema);

        // Pass to better-auth for authentication
        return auth.handler(request);
      },
    },
  },
});
