<?php

namespace Teksite\FileManager\Services;

use GdImage;
use Teksite\FileManager\Models\UploadFile;
use Throwable;

/**
 * Generates resized copies of images with the GD extension (no packages).
 * Everything is optional: without GD, or for unsupported formats, files are
 * simply left without variants and the original is used.
 */
class ThumbnailService
{
    public function __construct(protected StorageService $storage) {}

    public function supported(): bool
    {
        return function_exists('imagecreatefromstring') && function_exists('imagecopyresampled');
    }

    /** Creates every configured variant and stores them on the file's disk. */
    public function generate(UploadFile $file): void
    {
        if (! $this->supported() || ! $file->isImage())  return;

        $sizes = (array) config('filemanager.thumbnails.sizes', []);
        $limit = (int) config('filemanager.thumbnails.max_source_pixels', 16_000_000);

        if ($sizes === [] || ($file->width && $file->height && $file->width * $file->height > $limit))  return;

        $disk = $this->storage->disk($file->disk);
        $contents = $disk->get($file->path);
        $source = is_string($contents) ? @imagecreatefromstring($contents) : false;
        unset($contents);

        if ($source === false) return;

        $source = $this->applyExifOrientation($source, $file);
        $variants = [];

        try {
            foreach ($sizes as $name => [$maxWidth, $maxHeight]) {
                $variant = $this->resize($source, (int) $maxWidth, (int) $maxHeight);
                [$binary, $extension] = $this->encode($variant['image'], $file->mime_type);
                imagedestroy($variant['image']);

                $path = $this->variantPath($file, (string) $name, $extension);
                $disk->put($path, $binary, ['visibility' => $file->isPrivate() ? 'private' : 'public']);

                $variants[$name] = ['path' => $path, 'width' => $variant['width'], 'height' => $variant['height']];
            }
        } catch (Throwable $e) {
            report($e);
        } finally {
            imagedestroy($source);
        }

        if ($variants !== []) {
            // Saved quietly: this is bookkeeping, not a user edit.
            $file->forceFill(['variants' => $variants])->saveQuietly();
        }
    }

    /** @return array{image: GdImage, width: int, height: int} */
    private function resize(GdImage $source, int $maxWidth, int $maxHeight): array
    {
        $width = imagesx($source);
        $height = imagesy($source);

        // Never upscale.
        $ratio = min($maxWidth / $width, $maxHeight / $height, 1);
        $newWidth = max(1, (int) round($width * $ratio));
        $newHeight = max(1, (int) round($height * $ratio));

        $target = imagecreatetruecolor($newWidth, $newHeight);
        imagealphablending($target, false);
        imagesavealpha($target, true);
        imagefill($target, 0, 0, imagecolorallocatealpha($target, 0, 0, 0, 127));
        imagecopyresampled($target, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        return ['image' => $target, 'width' => $newWidth, 'height' => $newHeight];
    }

    /** @return array{0: string, 1: string} binary + extension */
    private function encode(GdImage $image, string $sourceMime): array
    {
        $quality = (int) config('filemanager.thumbnails.quality', 82);

        ob_start();

        if (function_exists('imagewebp')) {
            imagewebp($image, null, $quality);
            $extension = 'webp';
        } elseif (in_array($sourceMime, ['image/png', 'image/gif'], true)) {
            imagepng($image);
            $extension = 'png';
        } else {
            // JPEG has no alpha: flatten onto white.
            $flat = imagecreatetruecolor(imagesx($image), imagesy($image));
            imagefill($flat, 0, 0, imagecolorallocate($flat, 255, 255, 255));
            imagecopy($flat, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));
            imagejpeg($flat, null, $quality);
            imagedestroy($flat);
            $extension = 'jpg';
        }

        return [(string) ob_get_clean(), $extension];
    }

    private function variantPath(UploadFile $file, string $variant, string $extension): string
    {
        $info = pathinfo($file->path);
        $directory = ($info['dirname'] ?? '.') === '.' ? '' : $info['dirname'].'/';

        return "{$directory}{$info['filename']}-{$variant}.{$extension}";
    }

    private function applyExifOrientation(GdImage $image, UploadFile $file): GdImage
    {
        if ($file->mime_type !== 'image/jpeg' || ! function_exists('exif_read_data') || ! function_exists('imagerotate')) {
            return $image;
        }

        try {
            $stream = $file->readStream();
            $exif = is_resource($stream) ? @exif_read_data($stream) : false;
            is_resource($stream) && fclose($stream);
        } catch (Throwable) {
            return $image;
        }

        $angle = match ($exif['Orientation'] ?? 1) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };

        if ($angle === 0)  return $image;


        $rotated = imagerotate($image, $angle, 0);

        if ($rotated === false)return $image;

        imagedestroy($image);

        return $rotated;
    }
}
