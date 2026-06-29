<?php

namespace Teksite\FileManager\Http\Exceptions;

class FileUploadException extends \Exception
{
    public function __construct(
        string $message = 'The file was not stored.',
        int $code = 0,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}

