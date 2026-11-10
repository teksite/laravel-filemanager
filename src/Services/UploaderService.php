<?php

namespace Teksite\FileManager\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Teksite\FileManager\DTO\UploadOptions;
use Teksite\FileManager\Events\FileDeleted;
use Teksite\FileManager\Events\FileDeleting;
use Teksite\FileManager\Events\FileRestored;
use Teksite\FileManager\Events\FileUpdated;
use Teksite\FileManager\Events\FileUpdating;
use Teksite\FileManager\Events\FileUploaded;
use Teksite\FileManager\Events\FileUploading;
use Teksite\FileManager\Exceptions\FileManagerException;
use Teksite\FileManager\Exceptions\FileUploadException;
use Teksite\FileManager\Jobs\GenerateThumbnails;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Models\UploadFolder;
use Teksite\FileManager\Support\FilenameSanitizer;
use Teksite\FileManager\Support\PathBuilder;
use Throwable;

/**
 * Application service for the whole file life cycle. Controllers stay thin and
 * every rule (inspection, naming, cleanup, events) lives here.
 */
class UploaderService
{
    public function __construct(protected StorageService $storage, protected FileInspector $inspector, protected FileNameResolver $names) {}

    /*
    |--------------------------------------------------------------------------
    | Upload
    |--------------------------------------------------------------------------
    */

    /**
     * @throws FileManagerException
     */
    public function upload(UploadedFile $file, UploadOptions|array $options = []): UploadFile
    {
        $options = $options instanceof UploadOptions ? $options : UploadOptions::fromArray($options);

        event(new FileUploading($file));

        $inspected = $this->inspector->inspect($file);

        $disk = $options->disk ?? (string)config('filemanager.default_disk', 'public');
        $this->storage->assertUploadDisk($disk);

        if ($options->folderId !== null) {
            abort_unless(UploadFolder::query()->whereKey($options->folderId)->exists(), 422, 'The selected folder does not exist.');
        }

        if ($existing = $this->findDuplicate($inspected->hash, $disk, $options)) return $existing;

        $generator = $this->names->resolve($options->strategy);
        $directory = PathBuilder::directory($options->userId);
        $filename = $this->storage->uniqueName(
            $disk,
            $directory,
            $generator->generate($file, ['slugify' => $options->slugify, 'length' => $options->length]),
            $inspected->extension,
            $generator->isUnique(),
            $options->overwrite ?? (bool)config('filemanager.storage.overwrite', false),
        );

        $stored = $this->storage->store($file, $disk, $directory, $filename, $options->visibilityPrivate);

        try {
            $upload = UploadFile::query()->create([
                'user_id'       => $options->userId,
                'folder_id'     => $options->folderId,
                'original_name' => FilenameSanitizer::display($file->getClientOriginalName()),
                'title'         => $options->title !== null ? trim($options->title) : null,
                'alt'           => $options->alt,
                'path'          => $stored,
                'disk'          => $disk,
                'mime_type'     => $inspected->mime,
                'extension'     => $inspected->extension,
                'size'          => $inspected->size,
                'hash'          => $inspected->hash,
                'width'         => $inspected->width,
                'height'        => $inspected->height,
            ]);
        } catch (Throwable $e) {
            // Never leave an orphan on the disk when the insert fails.
            $this->storage->delete($disk, $stored);
            Log::error($e);

            throw new FileUploadException(previous: $e);
        }

        event(new FileUploaded($upload));

        $this->queueThumbnails($upload);

        return $upload;
    }

    /**
     * Uploads several files, collecting failures instead of aborting the batch.
     *
     * @param iterable<UploadedFile> $files
     * @return array{uploaded: Collection<int, UploadFile>, failed: array<string, string>}
     */
    public function uploadMany(iterable $files, UploadOptions $options): array
    {
        $uploaded = new Collection();
        $failed = [];

        foreach ($files as $file) {
            try {
                $uploaded->push($this->upload($file, $options));
            } catch (Throwable $e) {
                $failed[FilenameSanitizer::display($file->getClientOriginalName())] = $e instanceof FileManagerException
                    ? $e->getMessage()
                    : 'The file could not be uploaded.';

                if (!$e instanceof FileManagerException) report($e);

            }
        }

        return ['uploaded' => $uploaded, 'failed' => $failed];
    }

    private function findDuplicate(string $hash, string $disk, UploadOptions $options): ?UploadFile
    {
        if (!config('filemanager.upload.deduplicate', false)) return null;

        return UploadFile::query()
                         ->where('hash', $hash)
                         ->where('disk', $disk)
                         ->when($options->userId !== null, fn($q) => $q->where('user_id', $options->userId))
                         ->first();
    }

    private function queueThumbnails(UploadFile $file): void
    {
        if (!$file->isImage() || !config('filemanager.thumbnails.enabled', true) || !function_exists('imagecreatefromstring')) {
            return;
        }

        $queue = config('filemanager.thumbnails.queue');

        $queue === null
            ? GenerateThumbnails::dispatch($file)->afterResponse()
            : GenerateThumbnails::dispatch($file)->onQueue($queue);
    }

    /*
    |--------------------------------------------------------------------------
    | Update / move
    |--------------------------------------------------------------------------
    */

    /** @param array{title?: ?string, alt?: ?string, description?: ?string, meta?: ?array, folder_id?: ?string} $attributes */
    public function update(UploadFile $file, array $attributes): UploadFile
    {
        event(new FileUpdating($file));

        $file->fill(array_intersect_key($attributes, array_flip(['title', 'alt', 'description', 'meta', 'folder_id'])))->save();

        event(new FileUpdated($file));

        return $file->refresh();
    }

    /**
     * Moves files to a folder (null = root) with one UPDATE query.
     *
     * @param Collection<int, UploadFile> $files
     */
    public function move(Collection $files, ?string $folderId): int
    {
        if ($files->isEmpty()) return 0;

        $count = UploadFile::query()->whereKey($files->modelKeys())->update(['folder_id' => $folderId, 'updated_at' => now()]);

        $files->each(fn(UploadFile $f) => event(new FileUpdated($f->refresh())));

        return $count;
    }

    /*
    |--------------------------------------------------------------------------
    | Delete / restore
    |--------------------------------------------------------------------------
    */

    /** Moves the file to the trash, or removes it for good when the trash is disabled. */
    public function delete(UploadFile $file): bool
    {
        event(new FileDeleting($file));

        $result = config('filemanager.trash.enabled', true) ? $file->delete() : $file->forceDelete();

        event(new FileDeleted($file));

        return (bool)$result;
    }

    public function restore(UploadFile $file): bool
    {
        $restored = $file->restore();

        $restored && event(new FileRestored($file));

        return $restored;
    }

    /** Permanently removes the record; the model event deletes the physical files. */
    public function forceDelete(UploadFile $file): bool
    {
        event(new FileDeleting($file));

        $result = (bool)$file->forceDelete();

        event(new FileDeleted($file));

        return $result;
    }

    /**
     * @param Collection<int, UploadFile> $files
     * @return int number of files processed
     */
    public function deleteMany(Collection $files, bool $permanent = false): int
    {
        return $files->filter(fn(UploadFile $file) => $permanent ? $this->forceDelete($file) : $this->delete($file))->count();
    }
}
