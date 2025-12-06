import { z } from 'zod';

/**
 * Validation error response type
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  error: string;
  errors?: ValidationError[];
}

/**
 * Validates request body against a Zod schema
 * Returns parsed data if valid, or throws a formatted error response
 */
export async function validateRequestBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Response(
        JSON.stringify({
          error: 'Invalid content type. Expected application/json',
        } as ErrorResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new Response(
        JSON.stringify({
          error: 'Validation failed',
          errors: validationErrors,
        } as ErrorResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Re-throw if it's already a Response
    if (error instanceof Response) {
      throw error;
    }

    // Handle other errors
    throw new Response(
      JSON.stringify({
        error: 'Invalid request body',
      } as ErrorResponse),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Validates URL search params against a Zod schema
 */
export function validateSearchParams<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  try {
    const params = Object.fromEntries(searchParams.entries());
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new Response(
        JSON.stringify({
          error: 'Invalid query parameters',
          errors: validationErrors,
        } as ErrorResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Response(
      JSON.stringify({
        error: 'Invalid query parameters',
      } as ErrorResponse),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Validates route params against a Zod schema
 */
export function validateRouteParams<T extends z.ZodType>(
  params: Record<string, string>,
  schema: T
): z.infer<T> {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new Response(
        JSON.stringify({
          error: 'Invalid route parameters',
          errors: validationErrors,
        } as ErrorResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Response(
      JSON.stringify({
        error: 'Invalid route parameters',
      } as ErrorResponse),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Creates a JSON response with proper headers
 */
export function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Creates an error response with proper headers
 */
export function errorResponse(
  error: string,
  status = 400,
  errors?: ValidationError[]
): Response {
  return new Response(
    JSON.stringify({
      error,
      errors,
    } as ErrorResponse),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
