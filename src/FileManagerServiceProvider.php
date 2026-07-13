<?php

namespace Teksite\FileManager;

use Illuminate\Support\Facades\Blade;
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
        $this->bootViews();
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
        ], ['filemanager', 'filemanager-config']);

        // Assets
        $this->publishes([
            __DIR__ . '/resources/assets/browser' => public_path('vendor/filemanager/browser'),
        ], ['filemanager', 'filemanager-assets']);



    }


    /**
     * Register views.
     */
    protected function bootViews(): void
    {
        $name = 'filemanager';

        $viewPath = resource_path("views/{$name}");
        $sourcePath = __DIR__ . "/resources/views/";

        $this->publishes([$sourcePath => $viewPath,], [$name, "{$name}-views"]);

        $this->loadViewsFrom([$sourcePath, ...$this->publishableViewPaths($name),], $name);

        Blade::componentNamespace('Teksite\\FileManager\\Views\\', $name);
    }


    /**
     * Get the paths where the module views are published.
     */
    protected function publishableViewPaths(string $filemanager): array
    {
        $paths = [];
        foreach (config('view.paths') as $path) {
            if (is_dir($path . '/' . $filemanager)) {
                $paths[] = $path . '/' . $filemanager;
            }
        }
        return $paths;
    }
}

