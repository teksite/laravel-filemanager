<?php

namespace Teksite\FileManager\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Services\ThumbnailService;

class GenerateThumbnails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    /** The file may be deleted before the job runs. */
    public bool $deleteWhenMissingModels = true;

    public function __construct(public UploadFile $file) {}

    public function handle(ThumbnailService $thumbnails): void
    {
        $thumbnails->generate($this->file);
    }
}
