<?php

namespace Teksite\FileManager\Contracts;

interface AuthorizeRequestInterface
{
    static function authorize(mixed $payload = null): bool;
}
