<?php

namespace Teksite\FileManager\Support;

use Teksite\FileManager\Contracts\FileNameGeneratorInterface;
use Teksite\FileManager\Strategies\OriginalFileNameStrategy;
use Teksite\FileManager\Strategies\RandomFileNameStrategy;
use Teksite\FileManager\Strategies\TimestampFileNameStrategy;
use Teksite\FileManager\Strategies\UUIDFileNameStrategy;


class FileNameResolver
{
    public static function resolve(?string $strategy = null, ?array $options = null): FileNameGeneratorInterface
    {
        $strategies ??= config('filemanager.naming_strategy', [
            'random'    => \Teksite\FileManager\Strategies\RandomFileNameStrategy::class,
            'timestamp' => \Teksite\FileManager\Strategies\TimestampFileNameStrategy::class,
            'original'  => \Teksite\FileManager\Strategies\OriginalFileNameStrategy::class,
            'uuid'      => \Teksite\FileManager\Strategies\UUIDFileNameStrategy::class,
        ]);
        $options ??= [];

        $class =$strategies[$strategy] ?? UUIDFileNameStrategy::class;

        return app($class, $options);
    }
}
