<?php

namespace Teksite\FileManager\Services;

use Illuminate\Http\UploadedFile;
use Symfony\Component\Mime\MimeTypes;
use Teksite\FileManager\DTO\InspectedFile;
use Teksite\FileManager\Http\Exceptions\UnsafeFileException;
use Teksite\FileManager\Support\FilenameSanitizer;

/**
 * Server-side security gate for every upload.
 *
 * Nothing coming from the client (mime type, extension, name) is trusted:
 * the mime type is detected from the content, the extension that gets stored
 * is derived from that detected type, and blocked / double extensions are
 * rejected before the file ever touches a disk.
 */
class FileInspector
{
    /** Raster formats that must decode as a valid image. */
    private const array STRICT_IMAGES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

    /** Bytes scanned for embedded server side code in images. */
    private const int SCAN_BYTES = 131_072;

    /**
     * @throws UnsafeFileException
     */
    public function inspect(UploadedFile $file): InspectedFile
    {
        if (!$file->isValid()) throw UnsafeFileException::because($file->getErrorMessage());

        $path = $file->getRealPath();
        if ($path === false || !is_file($path)) throw UnsafeFileException::because('The uploaded file could not be read.');

        $size = (int)$file->getSize();
        $this->assertSize($size);

        $clientName = $file->getClientOriginalName();
        $this->assertNoBlockedExtension($clientName);

        $mime = $this->detectMime($path);
        $this->assertMimeAllowed($mime, FilenameSanitizer::extensions($clientName));

        $extension = $this->resolveExtension($mime, $clientName);
        $this->assertAllowed($mime, $extension);

        [$width, $height] = $this->inspectImage($path, $mime);

        if (str_starts_with($mime, 'image/')) $this->assertNoEmbeddedCode($path);

        return new InspectedFile(
            mime     : $mime,
            extension: $extension,
            size     : $size,
            hash     : (string)hash_file('sha256', $path),
            width    : $width,
            height   : $height,
        );
    }

    private function assertSize(int $bytes): void
    {
        $kb = $bytes / 1024;
        $max = config('filemanager.upload.max_size_kb');
        $min = config('filemanager.upload.min_size_kb');

        if ($bytes <= 0) throw UnsafeFileException::because('The uploaded file is empty.');

        if ($max !== null && $kb > (int)$max) throw UnsafeFileException::because("The file is larger than the allowed {$max} KB.");

        if ($min !== null && $kb < (int)$min) throw UnsafeFileException::because("The file is smaller than the allowed {$min} KB.");

    }

    /** Rejects "evil.php", "evil.php.jpg", "evil.jpg.php" and RTL-override tricks. */
    private function assertNoBlockedExtension(string $clientName): void
    {
        $blocked = $this->lowerList('filemanager.upload.blocked_extensions');

        foreach (FilenameSanitizer::extensions($clientName) as $segment) {
            if (in_array($segment, $blocked, true)) throw UnsafeFileException::because("Files with the extension [.{$segment}] are not allowed.");

        }
    }

    private function detectMime(string $path): string
    {
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($path);

        return is_string($mime) && $mime !== '' ? strtolower($mime) : 'application/octet-stream';
    }

    /**
     * @param list<string> $clientExtensions
     */
    private function assertMimeAllowed(string $mime, array $clientExtensions): void
    {
        if (in_array($mime, $this->lowerList('filemanager.upload.blocked_mimes'), true)) {
            throw UnsafeFileException::because("Files of type [{$mime}] are not allowed.");
        }

        // For media the claimed extension must agree with the real content,
        // otherwise a polyglot / renamed file is being smuggled in.
        if ($clientExtensions !== [] && preg_match('#^(image|video|audio)/#', $mime)) {
            $claimed = end($clientExtensions);
            $known = MimeTypes::getDefault()->getMimeTypes($claimed);

            if ($known !== [] && !in_array($mime, $known, true) && !$this->isAlias($mime, $known)) {
                throw UnsafeFileException::because('The file extension does not match the file content.');
            }
        }
    }

    /** jpeg/jpg style aliases that share a group (e.g. image/jpeg vs image/pjpeg). */
    private function isAlias(string $mime, array $known): bool
    {
        foreach ($known as $candidate) {
            if (explode('/', $candidate)[0] === explode('/', $mime)[0]
                && (str_contains($candidate, explode('/', $mime)[1]) || str_contains($mime, explode('/', $candidate)[1]))) {
                return true;
            }
        }

        return false;
    }

    /**
     * The stored extension always comes from the detected content type. The
     * client extension is only kept when it is a valid extension for it.
     */
    private function resolveExtension(string $mime, string $clientName): string
    {
        $valid = array_map('strtolower', MimeTypes::getDefault()->getExtensions($mime));
        $client = strtolower((string)pathinfo(FilenameSanitizer::display($clientName), PATHINFO_EXTENSION));

        if ($client !== '' && in_array($client, $valid, true)) return $client;

        return $valid[0] ?? 'bin';
    }

    private function assertAllowed(string $mime, string $extension): void
    {
        $allowed = $this->lowerList('filemanager.upload.allowed_types');

        if ($allowed === []) return;


        foreach ($allowed as $rule) {
            if ($rule === $mime || $rule === $extension) return;

            if (str_ends_with($rule, '/*') && str_starts_with($mime, substr($rule, 0, -1))) return;
        }

        throw UnsafeFileException::because("This file type [{$mime}] is not allowed.");
    }

    /**
     * Reads only the image header (no pixel decoding) to learn the size and
     * to refuse decompression bombs.
     *
     * @return array{0: ?int, 1: ?int}
     */
    private function inspectImage(string $path, string $mime): array
    {
        if (!str_starts_with($mime, 'image/')) return [null, null];


        $info = @getimagesize($path);

        if ($info === false) {
            if (in_array($mime, self::STRICT_IMAGES, true)) throw UnsafeFileException::because('The image is corrupted or not a valid image.');

            return [null, null];
        }

        [$width, $height] = $info;
        $limit = config('filemanager.upload.max_image_pixels');

        if ($limit !== null && ($width * $height) > (int)$limit) throw UnsafeFileException::because('The image dimensions are too large.');

        return [(int)$width, (int)$height];
    }

    /** Defence in depth against images that hide server side code (polyglots). */
    private function assertNoEmbeddedCode(string $path): void
    {
        $handle = fopen($path, 'rb');
        if ($handle === false) return;

        $chunk = (string)fread($handle, self::SCAN_BYTES);
        fclose($handle);

        if (preg_match('/<\?(php|=)|<script\b/i', $chunk) === 1) throw UnsafeFileException::because('The file contains embedded executable code.');

    }

    /** @return list<string> */
    private function lowerList(string $key): array
    {
        return array_values(array_map('strtolower', array_filter((array)config($key, []), 'is_string')));
    }
}
