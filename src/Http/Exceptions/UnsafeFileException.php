<?php

namespace Teksite\FileManager\Exceptions;

/** Thrown when an uploaded file fails the server-side security inspection. */
final class UnsafeFileException extends FileManagerException
{
    public static function because(string $reason): self
    {
        return new self($reason);
    }
}
