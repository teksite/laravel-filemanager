<?php

namespace Teksite\FileManager\Exceptions;

final class FolderException extends FileManagerException
{
    public static function duplicate(string $name): self
    {
        return new self("A folder named [{$name}] already exists here.");
    }

    public static function cycle(): self
    {
        return new self('A folder cannot be moved into itself or one of its descendants.');
    }

    public static function tooDeep(int $max): self
    {
        return new self("Folders can be nested at most {$max} levels deep.");
    }
}
