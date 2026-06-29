<?php

namespace Teksite\FileManager\Support;

use Teksite\FileManager\Contracts\FileNameGeneratorInterface;
use Teksite\FileManager\Strategies\OriginalFileNameStrategy;
use Teksite\FileManager\Strategies\RandomFileNameStrategy;
use Teksite\FileManager\Strategies\TimestampFileNameStrategy;
use Teksite\FileManager\Strategies\UUIDFileNameStrategy;


class FileNameResolver {
    public static function resolve(?string $strategy = null , array|null $options = null) : FileNameGeneratorInterface
    {
        $selectedStrategy = is_null($strategy) ? config('filemanager.default_strategy' ,'uuid') : $strategy;
        return match($selectedStrategy){
            'random'=> app(RandomFileNameStrategy::class ,[...$options]),
            'timestamp'=> app(TimestampFileNameStrategy::class ,[...$options]),
            'original'=> app(OriginalFileNameStrategy::class ,[...$options]),
            default=> app(UUIDFileNameStrategy::class ,[...$options])
        };
    }
}
