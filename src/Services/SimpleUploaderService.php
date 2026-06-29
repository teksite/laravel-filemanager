<?php

namespace Teksite\FileManager\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Teksite\FileManager\Models\UploadFile;

class SimpleUploaderService
{
    protected string $disk;

    protected bool $overwrite;

    protected bool $keepFileName;

    protected bool $slugifyNames;

    protected string $uploadPath;

    protected string $namingStrategy;

    protected int $randomLength;

    public function __construct(?string $disk = null)
    {
        $this->disk = !is_null($disk) ? $disk : config('filemanager.default_store_disk', 'public');

        $this->overwrite = config('filemanager.overwrite', false);

        $this->keepFileName = config('filemanager.keep_file_name', false);

        $this->slugifyNames = config('filemanager.slugify_names', false);

        $this->uploadPath = config('filemanager.upload_path', 'uploads');

        $this->namingStrategy = config('filemanager.naming_strategy', 'uuid');

        $this->randomLength = config('filemanager.random_name_length', 32);
    }

    public static function make(?string $disk = null): static
    {
        return new static($disk);
    }

    public function disk(string $disk): static
    {
        $this->disk = $disk;
        return $this;
    }

    public function overwrite(bool $status = false): static
    {
        $this->overwrite = $status;
        return $this;
    }

    public function keepFileName(bool $status = true): static
    {
        $this->keepFileName = $status;
        return $this;
    }

    public function enableSlugifyName(bool $status = true): static
    {
        $this->slugifyNames = $status;
        return $this;
    }

    public function namingStrategy(string $strategy = 'uuid'): static
    {
        $this->namingStrategy = $strategy;
        return $this;
    }

    public function randomLength(int $length = 32): static
    {
        $this->randomLength = $length;
        return $this;
    }

    public function uploadPath(string $path = 'uploads'): static
    {
        $this->slugifyNames = $path;
        return $this;
    }

    public function upload(UploadedFile $file, ?string $path = null, ?string $title = null): UploadFile|false
    {
        DB::beginTransaction();

        try {

            $directory = $this->prepareDirectory($path);
            $filename = $this->generateFilename($file, $directory);

            $storedPath = Storage::disk($this->disk)->putFileAs($directory, $file, $filename);

            if (!$storedPath) throw new \Exception('File could not be stored');

            $model = UploadFile::query()->create([
                'original_name' => $file->getClientOriginalName(),
                'title'         => $title,
                'path'          => $storedPath,
                'disk'          => $this->disk,
                'mime_type'     => $file->getMimeType(),
                'size'          => $file->getSize(),
                'extension'     => $file->extension(),
                'hash'          => md5_file($file->getRealPath()),
            ]);

            DB::commit();
            return $model;

        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('[FileManager] ' . $e->getMessage(), ['trace' => $e->getTraceAsString(),]);

            if (isset($storedPath)) {
                Storage::disk($this->disk)->delete($storedPath);
            }

            return false;
        }
    }

    protected function prepareDirectory(?string $path): string
    {
        return trim($this->uploadPath . '/' . ($path ?: Carbon::now()->format('Y/m/d')), '/');
    }

    protected function generateFilename(UploadedFile $file, string $directory): string
    {
        $extension = $file->extension();

        $name = $this->resolveBaseName($file);

        $filename = "{$name}.{$extension}";

        if ($this->overwrite) return $filename;

        return $this->resolveUniqueFilename($directory, $name, $extension);
    }

    protected function resolveBaseName(UploadedFile $file): string
    {
        if (!$this->keepFileName) {
            return match ($this->namingStrategy) {
                'timestamp' => now()->timestamp,
                'random'    => Str::random($this->randomLength),
                default     => Str::uuid()
            };
        }
        $name = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

        return $this->slugifyNames ? Str::slug($name) : $name;
    }

    protected function resolveUniqueFilename(string $directory, string $name, string $extension): string
    {
        $counter = 1;

        $filename = "{$name}.{$extension}";

        while (Storage::disk($this->disk)->exists("{$directory}/{$filename}")) {
            $filename = "{$name}-{$counter}.{$extension}";
            $counter++;
        }
        return $filename;
    }

    public function delete(UploadFile|string $file): bool
    {
        $model = $file instanceof UploadFile ? $file : UploadFile::find($file);

        if (!$model) {
            return false;
        }

        DB::transaction(function () use ($model) {
            Storage::disk($model->disk)->delete($model->path);
            $model->delete();
        });

        return true;
    }

}
