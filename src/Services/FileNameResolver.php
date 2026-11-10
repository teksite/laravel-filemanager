<?php

namespace Teksite\FileManager\Services;

use InvalidArgumentException;
use Teksite\FileManager\Contracts\FileNameGeneratorInterface;

/** Resolves a naming strategy by key from the container-configured registry. */
class FileNameResolver
{
    public function resolve(?string $key = null): FileNameGeneratorInterface
    {
        $strategies = (array) config('filemanager.storage.strategies', []);
        $key ??= (string) config('filemanager.storage.default_strategy', 'uuid');

        $class = $strategies[$key] ?? null;

        if ($class === null) throw new InvalidArgumentException("Unknown file naming strategy [{$key}].");


        $instance = app($class);

        if (! $instance instanceof FileNameGeneratorInterface)  throw new InvalidArgumentException("[{$class}] must implement ".FileNameGeneratorInterface::class.'.');

        return $instance;
    }
}
