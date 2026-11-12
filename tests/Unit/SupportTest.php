<?php

namespace Teksite\FileManager\Tests\Unit;

use InvalidArgumentException;
use Teksite\FileManager\Enums\MediaType;
use Teksite\FileManager\Support\FilenameSanitizer;
use Teksite\FileManager\Support\PathBuilder;
use Teksite\FileManager\Tests\TestCase;

class SupportTest extends TestCase
{
    public function test_double_and_spoofed_extensions_are_exposed(): void
    {
        $this->assertSame(['php', 'jpg'], FilenameSanitizer::extensions('shell.PHP.jpg'));
        $this->assertSame(['php'], FilenameSanitizer::extensions("evil\u{202E}gpj.php"));
    }

    public function test_display_name_never_contains_separators(): void
    {
        $name = FilenameSanitizer::display('../../etc/passwd');
        $this->assertStringNotContainsString('/', $name);
        $this->assertSame('file', FilenameSanitizer::display("\0"));
    }

    /** @dataProvider unsafePaths */
    public function test_traversal_paths_are_rejected(string $path): void
    {
        $this->expectException(InvalidArgumentException::class);
        PathBuilder::assertSafe($path);
    }

    public static function unsafePaths(): array
    {
        return [['../x'], ['a/../b'], ['a//b'], ["a\0b"], ['']];
    }

    public function test_type_filter_rejects_wildcards_and_injection(): void
    {
        $this->assertSame(['image/%'], MediaType::patternsFor('image'));
        $this->assertSame([], MediaType::patternsFor('%'));
        $this->assertSame([], MediaType::patternsFor("image' OR 1=1"));
    }
}
