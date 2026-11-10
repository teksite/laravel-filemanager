<?php

namespace Teksite\FileManager\Enums;

/**
 * Coarse file categories used by the type filter. The mime prefixes are always
 * matched from the start of the column (index friendly), never with a leading
 * wildcard.
 */
enum MediaType: string
{
    case Image    = 'image';
    case Video    = 'video';
    case Audio    = 'audio';
    case Text     = 'text';
    case Document = 'document';
    case Archive  = 'archive';

    /** @return list<string> LIKE patterns / exact mimes belonging to this type. */
    public function patterns(): array
    {
        return match ($this) {
            self::Image    => ['image/%'],
            self::Video    => ['video/%'],
            self::Audio    => ['audio/%'],
            self::Text     => ['text/%'],
            self::Document => [
                'application/pdf', 'application/msword', 'application/rtf',
                'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.%',
                'application/vnd.oasis.opendocument.%',
            ],
            self::Archive  => [
                'application/zip', 'application/gzip', 'application/x-tar',
                'application/x-7z-compressed', 'application/vnd.rar', 'application/x-rar-compressed',
            ],
        };
    }

    /**
     * Resolve a filter value (category or explicit mime) into LIKE patterns.
     *
     * @return list<string>
     */
    public static function patternsFor(string $value): array
    {
        $value = strtolower(trim($value));

        if ($type = self::tryFrom($value)) return $type->patterns();

        if (preg_match('#^[a-z0-9.+-]+/(\*|[a-z0-9.+-]+)$#', $value)) return [str_replace('*', '%', $value)];

        return [];
    }
}
