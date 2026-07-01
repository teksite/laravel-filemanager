<?php

namespace Teksite\FileManager\Support;

use Teksite\FileManager\Contracts\AuthorizeRequestInterface;

class AuthorizeRequestResolver
{
    public static function resolve(string $action, mixed $payload = null): bool
    {
        $class = config("filemanager.authorization.$action");

        if (!$class) throw new \RuntimeException("Authorization action [$action] not found.");


        $instance = app($class);

        if (!$instance instanceof AuthorizeRequestInterface) throw new \RuntimeException("{$class} must implement AuthorizationInterface");

        return $instance->authorize($payload);
    }
}
