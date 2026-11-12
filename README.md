# Teksite Laravel File Manager

A secure, dependency-free media manager for Laravel. Built only on Laravel's Filesystem (any disk: local, S3, SFTP…), PHP's `fileinfo` and, optionally, `gd`. The browser UI is vanilla JS + CSS.

**Requires:** PHP 8.2+, Laravel 11 / 12 / 13, `ext-fileinfo` (`ext-gd` optional, for thumbnails).

## Features

- Secure uploads: content-based mime detection, blocked/double extension protection, polyglot & image-bomb checks, server-generated names and paths
- Authorization through a standard Laravel **Policy**, owner scoping, optional admin ability
- Virtual **folders** (nested), bulk move / bulk delete, **trash** with restore + scheduled purge
- Search, sorting, type / disk / folder filters, cursor or length-aware pagination
- Image metadata (width/height, sha-256 hash) and GD thumbnails (`thumb`, `medium`) generated after the response or on a queue
- Optional de-duplication by hash, private files served through a permission-checked streaming route
- Rate limiting, events, attach files to any model (`HasAttachedFiles`)

## Installation

```bash
composer require teksite/laravel-filemanager
php artisan filemanager:install     # publishes assets + config
php artisan migrate                 # creates (idempotent)
```

Set `database.user_id_type` (`id`, `uuid`, `ulid`) in `config/filemanager.php` **before** migrating if your users table does not use integer ids.

The browser page is available at `/filemanager/browser` (authenticated). Embed it in an `<iframe>` or use `<x-filemanager::browser />` plus `initFileManager(config, id)`.

## Security model

| Concern | Behaviour |
|---|---|
| Authentication | Routes use `['web','auth']` by default. For token APIs set `routes.api.middleware` to e.g. `['api','auth:sanctum']`. |
| CSRF | Enforced by the `web` group; the bundled JS sends `X-XSRF-TOKEN`. |
| Authorization | `UploadFilePolicy` (`browse`, `upload`, `view`, `update`, `delete`, `restore`, `forceDelete`). Replace via `authorization.policy`. |
| Ownership | `user_id` is always the authenticated user; clients cannot set it. With `scope_to_owner` users only see their own files. |
| File type | Mime is detected from content; stored extension derives from it; `php`, `html`, `svg`, `js`… are blocked by default (also as part of double extensions). |
| Paths | Built server-side from a template; traversal is impossible. The old "delete by path" endpoint was removed. |
| Output | UI escapes all values; URLs are scheme-checked; private files are served with `nosniff` + sandbox CSP. |

## API

All routes live under `/api/filemanager` (name prefix `api.filemanager.`).

| Method | URI | Purpose |
|---|---|---|
| GET | `/` | List. Query: `disk`, `type`, `search`, `folder_id` (`root` or id), `sort`, `trashed` (`only`/`with`), `mode` (`cursor`/`pagination`), `per_page`, `cursor` |
| POST | `/` | Upload `file` or `files[]` (+ `disk`, `folder_id`, `title`, `alt`) |
| GET | `/{file}` | Show |
| PATCH | `/{file}` | Update `title`, `alt`, `description`, `meta`, `folder_id` |
| DELETE | `/{file}` | Move to trash |
| POST | `/{file}/restore` | Restore |
| DELETE | `/{file}/force` | Delete permanently |
| GET | `/{file}/serve`, `/{file}/download` | Permission-checked delivery |
| POST | `/bulk/delete`, `/bulk/move` | Body: `ids[]` (max 100), `folder_id` / `permanent` |
| GET/POST | `/folders` | List / create (`name`, `parent_id`) |
| PATCH/DELETE | `/folders/{folder}` | Rename or move / delete (contents move up) |

## Using it from PHP

```php
use Teksite\FileManager\Data\UploadOptions;
use Teksite\FileManager\Services\UploaderService;

$file = app(UploaderService::class)->upload($request->file('avatar'), new UploadOptions(
    disk: 'public', userId: auth()->id(),
));

class Post extends Model { use \Teksite\FileManager\Concerns\HasAttachedFiles; }
$post->attachFile($file, 'gallery');
$post->filesOfCollection('gallery')->get();
```

`$file->url()`, `$file->url('thumb')`, `$file->thumbnailUrl()`.

## Events

`FileUploading(UploadedFile)`, `FileUploaded`, `FileUpdating`, `FileUpdated`, `FileDeleting`, `FileDeleted`, `FileRestored` (all in `Teksite\FileManager\Events`).

## Maintenance

`php artisan filemanager:prune [--days=30]` permanently removes trashed files; it is scheduled daily automatically.

## Frontend development

```bash
npm install && npm run build   # rebuilds src/resources/assets/dist
npm test                       # JS tests (XSS escaping, immutable state)
```

## Testing

`composer require --dev orchestra/testbench && vendor/bin/phpunit`

