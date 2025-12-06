import { createFileRoute } from '@tanstack/react-router';
import { auth } from '../../auth';
import { signUpSchema } from '../../schemas/auth.schema';
import { validateRequestBody } from '../../lib/validation';

export const Route = createFileRoute('/api/auth/sign-up')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Validate request body before passing to better-auth
        await validateRequestBody(request, signUpSchema);

        // Pass to better-auth for user creation
        return auth.handler(request);
      },
    },
  },
});
