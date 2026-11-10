<?php

namespace Teksite\FileManager\Exceptions;

final class InvalidDiskException extends FileManagerException
{
    public static function notAllowed(string $disk): self
    {
        return new self("The disk [{$disk}] is not allowed.");
    }

    public static function notConfigured(string $disk): self
    {
        return new self("The disk [{$disk}] is not defined in filesystems.disks.");
    }
}
