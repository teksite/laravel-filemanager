<?php

declare(strict_types=1);

namespace Teksite\Module\Tests\Feature;

use Orchestra\Testbench\TestCase;
use Teksite\Module\Facade\Module;
use Teksite\Module\ModuleServiceProvider;

/**
 * Integration tests (need `composer install`, they run on top of Orchestra Testbench).
 */
final class ModuleBootTest extends TestCase
{
    protected function getPackageProviders($app): array
    {
        return [ModuleServiceProvider::class];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('modules.registration_modules_file', sys_get_temp_dir() . '/modules-' . uniqid() . '.php');
    }

    public function test_the_package_boots_with_an_empty_registry(): void
    {
        $this->assertSame([], Module::all());
        $this->assertNull(Module::isEnabled('Blog'));
    }

    public function test_default_config_is_merged_recursively(): void
    {
        $this->assertSame('lareon', config('modules.main_path'));
        $this->assertCount(12, config('modules.hq.modules.routes'));
    }

    public function test_enable_and_disable_dispatch_events(): void
    {
        module_registry()->register('Blog', 'Lareon\\Modules\\Blog\\App\\Providers\\BlogServiceProvider', 'self', false);

        $this->assertSame(1, Module::enable('Blog'));
        $this->assertTrue(Module::isEnabled('Blog'));
        $this->assertSame(0, Module::disable('Blog'));
        $this->assertFalse(Module::isEnabled('Blog'));
    }

    public function test_module_commands_are_registered(): void
    {
        foreach (['module:list', 'module:cache', 'module:cache-clear', 'module:doctor', 'module:make-livewire'] as $command) {
            $this->assertArrayHasKey($command, \Illuminate\Support\Facades\Artisan::all());
        }
    }
}
