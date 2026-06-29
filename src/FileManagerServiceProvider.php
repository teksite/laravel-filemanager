<?php

namespace Teksite\FileManager;

use Illuminate\Support\ServiceProvider;
use Teksite\FileManager\Providers\RouteServiceProvider;
use Teksite\FileManager\Providers\EventServiceProvider;

class FileManagerServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->registerConfig();
        $this->registerProviders();
    }

    /**
     * Boot the application events.
     */
    public function boot(): void
    {
        $this->publish();
    }


    private function registerProviders(): void
    {
        $this->app->register(RouteServiceProvider::class);
        $this->app->register(EventServiceProvider::class);
    }

    public function registerConfig(): void
    {
        $configPath = config_path('filemanager.php');
        $this->mergeConfigFrom(file_exists($configPath) ? $configPath : __DIR__ . '/config/filemanager.php', 'filemanager');
    }

    public function publish(): void
    {
        $this->publishes([
            __DIR__ . '/config/filemanager.php' => config_path('filemanager.php'),
        ], '/filemanager');
    }
}

