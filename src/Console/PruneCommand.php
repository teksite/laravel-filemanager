<?php

namespace Teksite\FileManager\Console;

use Illuminate\Console\Command;
use Teksite\FileManager\Models\UploadFile;

class PruneCommand extends Command
{
    protected $signature = 'filemanager:prune {--days= : Days a file stays in the trash (defaults to config)}';

    protected $description = 'Permanently delete trashed files older than the retention period';

    public function handle(): int
    {
        $days = (int)($this->option('days') ?? config('filemanager.trash.retention_days', 30));
        $cutoff = now()->subDays(max(0, $days));
        $count = 0;

        UploadFile::onlyTrashed()
                  ->where('deleted_at', '<', $cutoff)
                  ->chunkById(100, function ($files) use (&$count) {
                      foreach ($files as $file) {
                          $file->forceDelete();
                          $count++;
                      }
                  });

        $this->components->info("Permanently deleted {$count} file(s).");
        return self::SUCCESS;
    }
}
