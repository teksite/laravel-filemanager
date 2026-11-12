<?php

namespace Teksite\FileManager\Tests\Feature;

use Illuminate\Foundation\Auth\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Tests\TestCase;

class UploadSecurityTest extends TestCase
{
    private function user(int $id = 1): User
    {
        return (new User())->forceFill(['id' => $id]);
    }

    public function test_guests_are_rejected(): void
    {
        $this->getJson('/api/filemanager')->assertUnauthorized();
        $this->postJson('/api/filemanager')->assertUnauthorized();
    }

    public function test_php_file_with_image_extension_is_rejected(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->createWithContent('shell.php.jpg', '<?php system($_GET["c"]);');

        $this->actingAs($this->user())->postJson('/api/filemanager', ['file' => $file])->assertStatus(422);

        $this->assertSame(0, UploadFile::count());
    }

    public function test_valid_image_is_stored_with_detected_type_and_owner(): void
    {
        Storage::fake('public');

        $this->actingAs($this->user(7))
            ->postJson('/api/filemanager', ['file' => UploadedFile::fake()->image('a.jpg', 40, 30), 'user_id' => 99])
            ->assertCreated();

        $file = UploadFile::first();
        $this->assertSame('image/jpeg', $file->mime_type);
        $this->assertEquals(7, $file->user_id, 'owner must come from the session, never from the request');
        $this->assertSame(40, $file->width);
        Storage::disk('public')->assertExists($file->path);
    }

    public function test_users_cannot_touch_files_of_others(): void
    {
        $file = UploadFile::create([
            'user_id' => 1, 'original_name' => 'a.jpg', 'path' => 'a.jpg', 'disk' => 'public',
            'mime_type' => 'image/jpeg', 'size' => 1,
        ]);

        $this->actingAs($this->user(2))->deleteJson("/api/filemanager/{$file->id}")->assertForbidden();
        $this->actingAs($this->user(2))->getJson('/api/filemanager')->assertOk()->assertJsonCount(0, 'files');
    }

    public function test_disk_outside_allowed_list_is_rejected(): void
    {
        $this->actingAs($this->user())
            ->postJson('/api/filemanager', ['file' => UploadedFile::fake()->image('a.jpg'), 'disk' => 'local'])
            ->assertStatus(422);
    }
}
