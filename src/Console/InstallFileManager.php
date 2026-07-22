<?php

namespace Teksite\FileManager\Console;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

#[Signature('install:filemanager')]
#[Description('install Authorize migrations')]
class InstallFileManager extends Command
{

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $stubPath = __DIR__ . '/../stub';

        $stubFiles = [
            'migration' => $stubPath . '/2026_01_01_100100_create_file_table.stub',
            'model'     => $stubPath . '/FileManager.stub',
        ];

        $targetPaths = [
            'migration' => database_path('migrations'),
            'model'     => app_path('models'),
        ];


        foreach ($targetPaths as $type => $targetPath) {
            if (!File::isDirectory($targetPath)) {
                File::makeDirectory($targetPath, 0755, true);
            }
        }
        $targetPaths = [
            'permission' => $targetPath . '/0001_01_01_100100_create_permissions_table.php',
            'role'       => $targetPath . '/0001_01_01_100101_create_roles_table.php',
        ];

        foreach ($targetPaths as $key => $target) {
            if (!File::exists($target)) {
                File::copy($stubFiles[$key], $target);
                $this->info('Created migration: ' . $target);
            } else {
                $this->warn('Migration already exists: ' . $target);
            }

        }
    }
}
