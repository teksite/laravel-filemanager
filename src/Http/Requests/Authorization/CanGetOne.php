<?php

namespace Teksite\FileManager\Http\Requests\Authorization;

use Teksite\FileManager\Contracts\AuthorizeRequestInterface;

class CanGetOne implements AuthorizeRequestInterface {
    static function authorize(mixed $payload = null): bool {
        return true;
    }
}
