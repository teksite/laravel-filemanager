<?php

namespace Teksite\FileManager\Support;

use Teksite\FileManager\Strategies\OriginalFileNameStrategy;
use Teksite\FileManager\Strategies\RandomFileNameStrategy;
use Teksite\FileManager\Strategies\TimestampFileNameStrategy;
use Teksite\FileManager\Strategies\UUIDFileNameStrategy;

class FileNameResolver {
    public static function resolve(?string $strategy = null) : string
    {
        $selectedStrategy = is_null($strategy) ? config('filemanager.default_strategy' ,'uuid') : $strategy;
        return match($selectedStrategy){
            'random'=> app(RandomFileNameStrategy::class),
            'timestamp'=> app(TimestampFileNameStrategy::class),
            'original'=> app(OriginalFileNameStrategy::class),
            default=> app(UUIDFileNameStrategy::class)
        };
    }
}
