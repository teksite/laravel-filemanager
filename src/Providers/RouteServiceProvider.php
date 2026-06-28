<?php

namespace Teksite\FileManager\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    protected array $routeTypes = ['web', 'api'];

    public function map(): void
    {
        foreach ($this->routeTypes as $routeType) {
            $this->registerRouteGroup($routeType);
        }
    }

    protected function registerRouteGroup(string $routeType): void
    {
        $file = __DIR__ . "/../routes/{$routeType}.php";

        if (!is_file($file)) return;


        $config = config("filemanager.routes.$routeType", []);

        Route::middleware((array)($config['middleware'] ?? [$routeType]))
             ->prefix($config['prefix'] ?? 'filemanager')
             ->name(($config['name'] ?? 'filemanager') . '.')
             ->domain($config['domain'] ?? null)
             ->group($file);
    }
}
