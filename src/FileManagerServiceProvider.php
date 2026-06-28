<?php

namespace Teksite\FileManager;

use Illuminate\Support\ServiceProvider;
use Teksite\FileManager\Providers\RouteServiceProvider;

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
    }

    public function registerConfig(): void
    {
        $configPath = config_path('file-manager.php');
        $this->mergeConfigFrom(file_exists($configPath) ? $configPath : __DIR__ . '/config/file-manager.php', 'file-manager');
    }

    public function publish(): void
    {
        $this->publishes([
            __DIR__ . '/config/file-manager.php' => config_path('file-manager.php'),
        ], '/file-manager');
    }
}

