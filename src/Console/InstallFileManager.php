<?php

namespace Teksite\FileManager\Console;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

#[Signature('install:filemanager')]
#[Description('Install FileManager migrations')]
class InstallFileManager extends Command
{
    public function handle(): int
    {

        $this->publishMigration();
        $this->publishConfigs();
        $this->publishConfigs();

        $this->components->info('FileManager installed. Run "php artisan migrate" to create its tables.');

        return self::SUCCESS;
    }

    private function publishMigration(): void
    {
        $stubPath = __DIR__.'/../resources/stubs';

        $files = [
            [
                'stub' => $stubPath.'/create_file_table.stub',
                'name' => 'create_file_table',
            ],

        ];
        $migrationPath = database_path('migrations');

        File::ensureDirectoryExists($migrationPath);

        foreach ($files as $file) {
            $exists = collect(File::files($migrationPath))
                ->contains(function ($migration) use ($file) {
                    return str_ends_with(
                        $migration->getFilename(),
                        $file['name'].'.php'
                    );
                });

            if ($exists) {
                $this->warn("Migration already exists: {$file['name']}");
                continue;
            }

            $filename = now()->format('Y_m_d_His').'_'.$file['name'].'.php';

            File::copy(
                $file['stub'],
                $migrationPath.DIRECTORY_SEPARATOR.$filename
            );

            $this->info("Published: {$filename}");

            sleep(1);
        }

        $this->newLine();
    }

    private function publishAssets(): void
    {
        $this->call('vendor:publish', ['--tag' => 'filemanager-assets', '--force' => true]);
    }

    private function publishConfigs(): void
    {
        $this->call('vendor:publish', ['--tag' => 'filemanager-config', '--force' => (bool)$this->option('force')]);
    }
}
