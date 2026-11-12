<?php

namespace Teksite\FileManager\Tests;

use Orchestra\Testbench\TestCase as Orchestra;
use Teksite\FileManager\FileManagerServiceProvider;

abstract class TestCase extends Orchestra
{
    protected function getPackageProviders($app): array
    {
        return [FileManagerServiceProvider::class];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('database.default', 'testing');
        $app['config']->set('filemanager.routes.api.middleware', ['api', 'auth']);
        $app['config']->set('filemanager.routes.web.middleware', ['web', 'auth']);
        $app['config']->set('filemanager.thumbnails.enabled', false);
        $app['config']->set('filesystems.disks.public', ['driver' => 'local', 'root' => sys_get_temp_dir().'/fm-test', 'url' => '/storage', 'visibility' => 'public']);
    }

    protected function defineDatabaseMigrations(): void
    {
        $this->loadLaravelMigrations();
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
    }
}
