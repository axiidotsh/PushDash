import { createFileRoute } from '@tanstack/react-router';
import { jsonResponse } from '../../lib/api-helpers';

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      /**
       * GET /api/health
       * Health check endpoint for monitoring and CLI connectivity tests
       */
      GET: async () => {
        return jsonResponse({
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'pushdash-api',
          version: '1.0.0',
        });
      },
    },
  },
});
