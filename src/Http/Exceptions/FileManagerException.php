<?php

namespace Teksite\FileManager\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

/**
 * Base class for every exception thrown by the package. These are expected,
 * user-facing failures (validation-like), so they render as 422 and are not
 * reported as application errors.
 */
class FileManagerException extends RuntimeException
{
    public function render(Request $request): Response|false
    {
        if (! $request->expectsJson()) {
            return false;
        }

        return new JsonResponse(['success' => false, 'message' => $this->getMessage()], 422);
    }

    public function report(): bool
    {
        // Returning true stops the default reporter: nothing to log for a rejected upload.
        return true;
    }
}
