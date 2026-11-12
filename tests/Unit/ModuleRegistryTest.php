<?php

declare(strict_types=1);

namespace Teksite\Module\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Teksite\Module\Support\ModuleRegistry;

final class ModuleRegistryTest extends TestCase
{
    private string $directory;

    private string $file;

    protected function setUp(): void
    {
        $this->directory = sys_get_temp_dir() . '/module-registry-' . bin2hex(random_bytes(4));
        mkdir($this->directory);
        $this->file = $this->directory . '/modules.php';
    }

    protected function tearDown(): void
    {
        foreach (glob($this->directory . '/*') ?: [] as $file) {
            @unlink($file);
        }
        @rmdir($this->directory);
    }

    public function test_it_is_empty_when_the_file_does_not_exist(): void
    {
        $registry = new ModuleRegistry($this->file);

        $this->assertSame([], $registry->all());
        $this->assertNull($registry->isEnabled('Blog'));
    }

    public function test_register_enable_disable_and_unregister(): void
    {
        $registry = new ModuleRegistry($this->file);
        $registry->register('Blog', 'Lareon\\Modules\\Blog\\App\\Providers\\BlogServiceProvider', 'self', true);
        $registry->register('Shop', 'Lareon\\Modules\\Shop\\App\\Providers\\ShopServiceProvider', 'steward', false);

        $fresh = new ModuleRegistry($this->file); // proves it is really persisted

        $this->assertSame(['Blog', 'Shop'], $fresh->names());
        $this->assertTrue($fresh->isEnabled('Blog'));
        $this->assertFalse($fresh->isEnabled('Shop'));
        $this->assertSame('steward', $fresh->type('Shop'));
        $this->assertSame(['Blog'], array_keys($fresh->enabled()));
        $this->assertSame(['Shop'], array_keys($fresh->disabled()));

        $fresh->setActive('Shop', true);
        $this->assertTrue((new ModuleRegistry($this->file))->isEnabled('Shop'));

        $this->assertTrue($fresh->unregister('Shop'));
        $this->assertFalse($fresh->unregister('Shop'));
        $this->assertSame(['Blog'], (new ModuleRegistry($this->file))->names());
    }

    public function test_the_file_is_valid_php_and_no_temp_files_are_left(): void
    {
        $registry = new ModuleRegistry($this->file);
        $registry->register('Blog', "Weird\\Name'With\"quotes", 'self');

        $data = require $this->file;

        $this->assertSame("Weird\\Name'With\"quotes", $data['Blog']['provider']);
        $this->assertSame([$this->file, $this->file . '.lock'], array_values(array_filter(
            glob($this->directory . '/*') ?: [],
            static fn(string $path): bool => true,
        )));
    }

    public function test_it_normalizes_hand_edited_files(): void
    {
        file_put_contents($this->file, "<?php return ['Blog' => ['provider' => 'X', 'active' => 1, 'type' => 'nonsense'], 5 => [], 'Bad' => 'string'];");

        $registry = new ModuleRegistry($this->file);

        $this->assertSame(['Blog'], $registry->names());
        $this->assertTrue($registry->get('Blog')['active']);
        $this->assertSame('self', $registry->type('Blog'));
    }

    public function test_it_rejects_invalid_types_and_unknown_modules(): void
    {
        $registry = new ModuleRegistry($this->file);

        $this->expectException(\RuntimeException::class);
        $registry->register('Blog', 'X', 'hacked');
    }

    public function test_activating_an_unknown_module_fails(): void
    {
        $this->expectException(\RuntimeException::class);
        (new ModuleRegistry($this->file))->setActive('Nope', true);
    }

    public function test_concurrent_changes_are_not_lost(): void
    {
        $first = new ModuleRegistry($this->file);
        $second = new ModuleRegistry($this->file);

        $first->all();
        $second->all();

        $first->register('A', 'A\\P', 'self');
        $second->register('B', 'B\\P', 'self'); // $second never saw "A" in memory

        $this->assertSame(['A', 'B'], (new ModuleRegistry($this->file))->names());
    }
}
