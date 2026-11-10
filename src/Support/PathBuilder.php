<?php

namespace Teksite\FileManager\Support;

use InvalidArgumentException;

/** Builds storage paths on the server; clients can never influence them. */
final class PathBuilder
{
    public static function directory(string|int|null $userId = null): string
    {
        $now = now();

        $path = strtr((string)config('filemanager.storage.path', 'uploads/{Y}/{m}'), [
            '{Y}'    => $now->format('Y'),
            '{y}'    => $now->format('y'),
            '{m}'    => $now->format('m'),
            '{d}'    => $now->format('d'),
            '{H}'    => $now->format('H'),
            '{i}'    => $now->format('i'),
            '{user}' => preg_replace('/[^A-Za-z0-9_-]/', '', (string)($userId ?? 'guest')) ?: 'guest',
        ]);
        return self::assertSafe($path);
    }

    /**
     * Guarantees a relative path with no traversal, null bytes or backslashes.
     *
     * @throws InvalidArgumentException
     */
    public static function assertSafe(string $path): string
    {
        $path = trim(str_replace('\\', '/', $path), '/');

        if ($path === '' || str_contains($path, "\0"))  throw new InvalidArgumentException('Invalid storage path.');


        foreach (explode('/', $path) as $segment) {
            if ($segment === '' || $segment === '.' || $segment === '..') {
                throw new InvalidArgumentException('Invalid storage path.');
            }
        }

        return $path;
    }
}
