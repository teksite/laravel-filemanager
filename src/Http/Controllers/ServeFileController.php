<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Teksite\FileManager\Http\Requests\ShouldAuthorize;
use Teksite\FileManager\Models\UploadFile;

/**
 * Permission checked delivery for private files. Content is streamed (never
 * loaded in memory) and always sent with hardening headers.
 */
class ServeFileController
{
    use ShouldAuthorize;

    /** Types a browser may render inline; everything else is forced to download. */
    private const string INLINE = '#^(image/(jpeg|png|gif|webp|avif|bmp)|video/(mp4|webm|ogg)|audio/(mpeg|ogg|wav|webm|mp4)|application/pdf)$#';

    public function serve(Request $request, UploadFile $file): StreamedResponse
    {
        $this->userAuthorize('view', $file);

        $variant = $request->query('variant');

        $path = is_string($variant) && isset($file->variants[$variant]) ? $file->variants[$variant]['path'] : $file->path;
        $disk = Storage::disk($file->disk);

        abort_unless($disk->exists($path), 404);

        $inline = preg_match(self::INLINE, $path === $file->path ? $file->mime_type : (string)$disk->mimeType($path)) === 1;

        return $disk->response(
            $path,
            $file->original_name,
            $this->headers(),
            $inline ? 'inline' : 'attachment',
        );
    }

    public function download(UploadFile $file): StreamedResponse
    {
        $this->userAuthorize('view', $file);

        abort_unless(Storage::disk($file->disk)->exists($file->path), 404);
        return $file->download($this->headers());

    }

    /** @return array<string, string> */
    private function headers(): array
    {
        return [
            'X-Content-Type-Options'  => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; style-src 'unsafe-inline'; sandbox",
            'Cache-Control'           => 'private, max-age=3600',
        ];
    }
}
