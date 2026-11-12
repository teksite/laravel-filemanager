<?php

namespace Teksite\FileManager\Http\Exceptions;

use Throwable;

final class FileUploadException extends FileManagerException
{
    public function __construct(string $message = 'The file could not be stored.', ?Throwable $previous = null)
    {
        parent::__construct($message, 0, $previous);
    }
}
