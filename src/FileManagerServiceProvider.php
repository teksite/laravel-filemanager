<?php

namespace Teksite\FileManager;

use Illuminate\Support\ServiceProvider;

class FileManagerServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->registerConfig();
    }

    /**
     * Boot the application events.
     */
    public function boot(): void
    {
        $this->publish();
    }

    public function registerConfig(): void
    {
        /*        $configPath = config_path('icon-setting.php');*/
        /*        $this->mergeConfigFrom(file_exists($configPath) ? $configPath : __DIR__ . '/config/icon-setting.php', 'icon-setting');*/
    }

    public function publish(): void
    {
      /*  $this->publishes([
            __DIR__ . '/config/icon-setting.php' => config_path('icon-setting.php'),
        ], '/icon-setting');*/
    }
}

