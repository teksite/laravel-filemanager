<?php

namespace Teksite\FileManager\Http\Requests\Authorization;

use Teksite\FileManager\Contracts\AuthorizeRequestInterface;

class CanGetBrowser implements AuthorizeRequestInterface
{
    static function authorize(mixed $payload = null): bool
    {
        return true;
    }
}
