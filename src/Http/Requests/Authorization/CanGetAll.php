<?php

namespace Teksite\FileManager\Http\Requests\Authorization;

use Teksite\FileManager\Contracts\AuthorizeRequestInterface;

class CanGetAll implements AuthorizeRequestInterface
{
    static function authorize(mixed $payload = null): bool
    {
        return true;
    }
}
