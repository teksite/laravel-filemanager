<?php

namespace Teksite\FileManager\Http\Exceptions;

use Exception;
use Throwable;

class InvalidDiskException extends Exception
{
    public function __construct(
        string $message = 'The selected disk is invalid or not defined in the filesystem.disks configuration.',
        int $code = 0,
        ?Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
