<?php

namespace Teksite\FileManager;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\ServiceProvider;
use Teksite\FileManager\Console\InstallFileManager;
use Teksite\FileManager\Console\PruneCommand;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Models\UploadFolder;
use Teksite\FileManager\Policies\UploadFilePolicy;
use Teksite\FileManager\Services\FileInspector;
use Teksite\FileManager\Services\FileNameResolver;
use Teksite\FileManager\Services\FileQuery;
use Teksite\FileManager\Services\FolderService;
use Teksite\FileManager\Services\StorageService;
use Teksite\FileManager\Services\ThumbnailService;
use Teksite\FileManager\Services\UploaderService;

class FileManagerServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->registerConfig();
        $this->registerAlias();
    }

    /**
     * Boot the application events.
     */
    public function boot(): void
    {
        $this->registerPolicies();
        $this->registerRateLimiters();
        $this->registerRoutes();

        $this->registerViews();
        $this->registerPublishing();


        $this->loadmigrations();


        $this->bootCommands();
        $this->bootViews();
    }


    public function registerConfig(): void
    {
        $this->mergeConfigFrom(__DIR__.'/config/filemanager.php', 'filemanager');
    }

    private function registerAlias(): void
    {
        foreach ([
                     StorageService::class, FileInspector::class, FileNameResolver::class, FileQuery::class,
                     FolderService::class, ThumbnailService::class, UploaderService::class,
                 ] as $service) {
            $this->app->singleton($service);
        }
    }


    /**
     * Register views.
     */
    protected function bootViews(): void
    {
        $name = 'filemanager';

        $viewPath = resource_path("views/{$name}");

        $sourcePath = __DIR__."/resources/views/";

        $this->publishes([$sourcePath => $viewPath,], [$name, "{$name}-views"]);

        $this->loadViewsFrom([$sourcePath, ...$this->publishableViewPaths($name),], $name);

        Blade::componentNamespace('Teksite\\FileManager\\Views\\Components', $name);
    }


    /**
     * Get the paths where the module views are published.
     */
    protected function publishableViewPaths(string $filemanager): array
    {
        $paths = [];
        foreach (config('view.paths') as $path) {
            if (is_dir($path.'/'.$filemanager)) $paths[] = $path.'/'.$filemanager;

        }
        return $paths;
    }

    protected function bootCommands(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([InstallFileManager::class, PruneCommand::class]);
            $this->scheduleCleanup();
        }

    }


    private function registerPolicies(): void
    {
        $policy = config('filemanager.authorization.policy', UploadFilePolicy::class);

        Gate::policy(UploadFile::class, $policy);
        Gate::policy(UploadFolder::class, $policy);
    }

    private function registerRateLimiters(): void
    {
        $key = static fn(Request $request) => $request->user()?->getAuthIdentifier() ?? $request->ip();

        foreach (['read', 'write', 'upload'] as $type) {
            RateLimiter::for("filemanager-{$type}", fn(Request $request) => Limit::perMinute(
                (int)config("filemanager.routes.api.throttle.{$type}", 60)
            )->by($key($request)));
        }
    }

    private function registerRoutes(): void
    {
        if ($this->app->routesAreCached()) return;

        foreach (['web', 'api'] as $type) {
            $config = (array)config("filemanager.routes.{$type}", []);

            if (!($config['enabled'] ?? true)) continue;

            Route::middleware($config['middleware'] ?? [])
                 ->prefix($config['prefix'] ?? 'filemanager')
                 ->name($config['name'] ?? 'filemanager.')
                 ->domain($config['domain'] ?? null)
                 ->group(__DIR__."/routes/{$type}.php");
        }
    }


    private function registerViews(): void
    {
        $this->loadViewsFrom(__DIR__.'/resources/views', 'filemanager');
        $this->loadJsonTranslationsFrom(__DIR__.'/resources/lang');
        Blade::componentNamespace('Teksite\\FileManager\\Views\\Components', 'filemanager');
    }


    private function registerPublishing(): void
    {
        if (!$this->app->runningInConsole()) return;

        $this->publishes([__DIR__.'/config/filemanager.php' => config_path('filemanager.php')], ['filemanager', 'filemanager-config']);

        $this->publishes([
            __DIR__.'/resources/assets/dist/browser.min.js'  => public_path('vendor/filemanager/browser.min.js'),
            __DIR__.'/resources/assets/dist/browser.min.css' => public_path('vendor/filemanager/browser.min.css'),
        ], ['filemanager', 'filemanager-assets']);

        $this->publishes([__DIR__.'/resources/views' => resource_path('views/vendor/filemanager')], ['filemanager-views']);

        $this->publishes([__DIR__.'/database/migrations' => database_path('migrations')], ['filemanager-migrations']);
    }


    private function scheduleCleanup(): void
    {
        if (!config('filemanager.trash.enabled', true)) {
            return;
        }

        $this->callAfterResolving(Schedule::class, fn(Schedule $schedule) => $schedule->command('filemanager:prune')->daily());
    }

    private function loadMigrations(): void
    {
        if (config('filemanager.database.load_migrations', true))
            $this->loadMigrationsFrom(__DIR__.'/../database/migrations');

    }

}

