# Extra laravel Package

## About

A lightweight and extensible Laravel File Manager built on top of Laravel's Filesystem.

The package follows a zero-dependency approach for the frontend. It uses only **vanilla JavaScript and pure CSS**, with no additional JavaScript libraries, CSS frameworks, or UI packages required.

The backend relies only on **Laravel's native capabilities** and dependencies, ensuring a minimal footprint, better performance, and easier customization.

Because it is built on Laravel Filesystem, it supports every storage driver supported by Laravel, including:

- Local
- Public
- S3
- FTP
- SFTP
- MinIO
- Any custom filesystem driver

For more information about supported drivers, visit the official Laravel documentation:
[laravel File Storage docs](https://laravel.com/docs/13.x/filesystem)

# Features

- Multiple filesystem disks
- Upload files
- Delete files
- Rename files
- File metadata
- Pagination
- MIME type filtering
- Disk filtering
- Authorization layer
- Custom file naming strategies
- Configurable upload paths
- Automatic database synchronization

---

# Installation

## Step 1 — Install Package

```bash
composer require teksite/laravel-filemanager
```

---

## Step 2 — Install Package Assets

```bash
php artisan filemanager:install
```

This command will install everything required by the package.

---

## Step 3 — Run Migrations

```bash
php artisan migrate
```

---

## Step 4 — Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag=filemanager-config
```

---

## Step 5 — Publish Views (Optional)

```bash
php artisan vendor:publish --tag=filemanager-views
```

> **Warning**
>
> Publishing views is **not recommended** unless you really need to customize the frontend.
>
> Future package updates may require you to manually update your published views.

---


# Configuration

The package configuration file is located at:

```php
config/filemanager.php
```

Below is a complete explanation of every available option.

```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Route Configuration
    |--------------------------------------------------------------------------
    |
    | Configure route prefixes, route names and applied middleware
    | groups for both web and API endpoints.
    |
    */
    'routes'      => [

        'web' => [
            'prefix' => '/filemanager/',            // Web route URI prefix

            'name' => 'filemanager',                // Route name prefix

            'middlewares' => ['web'],               // Applied middleware stack
        ],

        'api' => [
            'prefix' => '/api/filemanager/',         // API route URI prefix

            'name' => 'api.filemanager',             // Route name prefix

            'middlewares' => [],                     // Applied middleware stack
        ],
    ],
    /*
     |--------------------------------------------------------------------------
     | File Listing
     |--------------------------------------------------------------------------
     |
     | Configure file visibility and listing behavior.
     |
     */
    'hiddenFiles' => true,         // Hide system and hidden files from listings

    'disk_list' => [null,          // Allowed filesystem disks ,[] means all disks without filter ,set it [null , public , ...] to have all and filter
        'local',
        'public',
        's3',
    ],

    'type_list' => [null,          // Allowed mime types ,[] means all mimes without filter ,set it [null , image , video/mp4 ,application/pdf  ...] to have all and filter
        'image',
        'text',
        'video',
        'audio',
    ],

    'per_page' => 25,              // Default pagination size

    /*
    |--------------------------------------------------------------------------
    | Upload Restrictions
    |--------------------------------------------------------------------------
    |
    | Define upload limitations and allowed file types.
    |
    */

    'allow_upload_types' => [           // Allowed mime types or extensions ([]] = allow all)
        'Image/Jpeg', 'Image/Jpg',
    ],                    

    'allow_upload_disks' =>[            // allowed disk to be uploaded to
        'public', 'local', 's3'],     

    'forbidden_file_types' => [],       // Forbidden mime types or extensions (empty = allow all)

    'max_file_size' => null,            // in KB, (null means no restrictions)

    'min_file_size' => null,            // in KB, (null means no restrictions)


    /*
    |--------------------------------------------------------------------------
    | Storage Configuration
    |--------------------------------------------------------------------------
    |
    | Configure file storage behavior and upload strategy.
    |
    */

    'default_store_disk' => 'public',            // Default storage disk


    'slugify_name' => true,                      // Convert original file names into URL-friendly slugs

    'overwrite'               => false,          // Replace existing files with identical names

    /*
    | Upload path pattern
    |
    | Available placeholders:
    |
    | {Y} = Year (2026)
    | {y} = Year (26)
    | {m} = Month
    | {d} = Day
    | {H} = Hour
    | {i} = Minute
    |
    */
    'upload_path'             => 'uploads/{Y}/{m}/{d}',

    /*
    |--------------------------------------------------------------------------
    | File Naming Strategies
    |--------------------------------------------------------------------------
    |
    | Register available naming strategy classes.
    |
    */
    'naming_strategy'         => [
        'random'    => \Teksite\FileManager\Strategies\RandomFileNameStrategy::class,
        'timestamp' => \Teksite\FileManager\Strategies\TimestampFileNameStrategy::class,
        'original'  => \Teksite\FileManager\Strategies\OriginalFileNameStrategy::class,
        'uuid'      => \Teksite\FileManager\Strategies\UUIDFileNameStrategy::class,
    ],
    'default_naming_strategy' => 'uuid',            // Default file naming strategy

    'random_name_length'     => 32,                     // Length used for random file names

    /*
    |--------------------------------------------------------------------------
    | File Cleanup
    |--------------------------------------------------------------------------
    |
    | Automatically remove physical files when related database
    | records are deleted.
    |
    */
    'delete_file_with_model' => true,

    /*
    |--------------------------------------------------------------------------
    | Authorization
    |--------------------------------------------------------------------------
    |
    | Customize authorization logic for package actions.
    | Each action should point to a class implementing:
    |
    | Teksite\FileManager\Contracts\AuthorizationInterface
    |
    */

    'authorization' => [

        'upload' => \Teksite\FileManager\Http\Requests\Authorization\CanUpload::class,

        'get_one' => \Teksite\FileManager\Http\Requests\Authorization\CanGetOne::class,

        'get_all' => \Teksite\FileManager\Http\Requests\Authorization\CanGetAll::class,

        'delete' => \Teksite\FileManager\Http\Requests\Authorization\CanDelete::class,

        'update' => \Teksite\FileManager\Http\Requests\Authorization\CanUpload::class,
    ],


];


```


## BACKEND

---

---

## Routes

The package registers both **API** and **Web** routes.

The default route prefixes are configurable in `config/filemanager.php`.

---

### API Routes

| Method | Route Name | URI | Description |
|---------|------------|-----|-------------|
| GET | `api.filemanager.index` | `/api/filemanager` | List uploaded files. |
| GET | `api.filemanager.show` | `/api/filemanager/{file}` | Retrieve a single file. |
| POST | `api.filemanager.store` | `/api/filemanager` | Upload a new file. |
| PATCH | `api.filemanager.update` | `/api/filemanager/{file}` | Update a file's metadata. |
| DELETE | `api.filemanager.destroy` | `/api/filemanager/{file}` | Delete a file from both the database and storage. |
| DELETE | `api.filemanager.destroy.path` | `/api/filemanager/remove` | Delete a physical file directly from storage. |
| GET | `api.filemanager.browser` | `/api/filemanager/browser` | Returns the file browser frontend. |

---

### Web Routes

| Method | Route Name | URI | Description |
|---------|------------|-----|-------------|
| GET | `filemanager.browser` | `/filemanager/browser` | Displays the file manager browser interface. |

---

## Request Parameters

### GET /api/filemanager

Returns a paginated list of uploaded files.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number when using pagination. |
| `per_page` | integer | Number of items per page. |
| `cursor` | string | Cursor value for cursor pagination. |
| `user_id` | integer | Filter files by owner. |
| `disk` | string | Filter by storage disk. |
| `type` | string | Filter by MIME type or file category. |

Example:

```text
/api/filemanager?per_page=25&disk=public&type=image
```

---

### GET /api/filemanager/{file}

Returns information for a single uploaded file.

#### Route Parameter

| Parameter | Description |
|-----------|-------------|
| `file` | UploadFile model or file ID |

---

### POST /api/filemanager

Uploads a single file.

#### Form Data

| Field | Required | Description |
|-------|----------|-------------|
| `file` | ✔ | File to upload. |
| `disk` | ✖ | Destination storage disk. Uses the default disk if omitted. |

---

### PATCH /api/filemanager/{file}

Updates file information.

#### Parameters

| Field | Required | Description |
|-------|----------|-------------|
| `file` | ✔ | UploadFile model or file ID. |
| `title` | ✔ | New file title. |

---

### DELETE /api/filemanager/{file}

Deletes a file from both the database and the configured storage disk.

#### Route Parameter

| Parameter | Description |
|-----------|-------------|
| `file` | UploadFile model or file ID |

---

### DELETE /api/filemanager/remove

Deletes a physical file without removing any database record.

#### Body Parameters

| Field | Required | Description |
|-------|----------|-------------|
| `path` | ✔ | Relative file path. |
| `disk` | ✔ | Storage disk name. |

---

### GET /api/filemanager/browser

Returns the package's browser interface via the API route.

---

### GET /filemanager/browser

Returns the package's browser interface via the web route.

---

## component and view

### Browser view

The package includes a ready-to-use browser interface for managing uploaded files.

You can render it using the provided Blade view:

```php
$disks = config('filemanager.disk_list', []);

$mimes = config('filemanager.type_list', []);

$allowedDisks = config('filemanager.allow_upload_disks', []);

$allowedTypes = config('filemanager.allow_upload_types', []);

return view('filemanager::browser', compact(
    'disks',
    'mimes',
    'allowedDisks',
    'allowedTypes'
));
```

### Required Variables

The following variables **must** be passed to the view:

| Variable | Description |
|----------|-------------|
| `$disks` | Available storage disks shown in the browser filter. |
| `$mimes` | Available MIME type filters. |
| `$allowedDisks` | Disks that users are allowed to upload files to. |
| `$allowedTypes` | Allowed MIME types for file uploads. |

These values should normally come directly from your `config/filemanager.php` file.

> **Important**
>
> These four variables are required for the frontend and backend to work correctly together. The browser uses them to build filters, validate uploads, and synchronize with the package's API.

All other frontend customizations are optional. You are free to modify the surrounding layout, styling, or integrate the browser into your own interface as long as these required variables are provided.

---

### Component

The package also provides a reusable Blade component that can be embedded anywhere in your application.

First, include the package assets:

```html
<link
    rel="stylesheet"
    href="/vendor/filemanager/browser/browser.min.css"
    crossorigin="anonymous"
    media="all"
>
```

Then render the component:

```blade
<x-filemanager::browser />
```

Finally, initialize it with JavaScript:

```html
<script type="module">
import initFileManager from "/vendor/filemanager/browser/browser.min.js";

document.addEventListener("DOMContentLoaded", () => {

    const fm = initFileManager({
        config: {
            load: {
                disks: @js($disks),
                types: @js($mimes),
                perPage: {{ $perPage }},
            },
            upload: {
                allowedMimes: @js($allowedTypes),
                allowedDisks: @js($allowedDisks),
            },

            // Additional configuration...
        }
    }, "filemanager-1");


});
</script>
```

#### Required Configuration

The following values should normally be loaded from `config/filemanager.php` and passed to the component:

| Variable | Description |
|----------|-------------|
| `$disks` | Available storage disks displayed in the browser. |
| `$mimes` | Available MIME type filters. |
| `$allowedDisks` | Storage disks that users are allowed to upload to. |
| `$allowedTypes` | Allowed MIME types for uploads. |

> **Important**
>
> These configuration values keep the frontend synchronized with the backend. They are used to build filters, validate uploads, and ensure that the browser behaves consistently with your package configuration.

All other JavaScript options are optional and may be customized to fit your application's requirements.

---

## Frontend

The package includes a lightweight JavaScript library for interacting with the File Manager.

---

### Configuration

`initFileManager()` accepts a configuration object. Every option is optional unless otherwise noted.

```javascript
{
    api: {
        baseUrl: "",
        getUrl: "/api/filemanager",
        uploadUrl: "/api/filemanager",
        deleteUrl: "/api/filemanager",
        updateUrl: "/api/filemanager"
    },

    request: {
        timeout: 15000,
        selectedDisk: null,
        selectedType: null,
        firstRequest: true
    },

    upload: {
        concurrency: 3,
        size: 5000,
        chunkSize: 0,
        requestTimeout: 15000,
        allowedMimes: [],
        allowedDisks: []
    },

    load: {
        perPage: 25,
        cursorName: "cursor",
        userId: null,
        selectedDisk: null,
        selectedType: null,
        getOnInit: true
    },

    log: {
        debug: false,
        toServer: false,
        serverUrl: null
    },

    selection: {
        mode: "multi",
        expect: "url"
    },

    debounce: {
        delay: 300
    },

    ui: {
        mainSelector: ".filemanager",

        /* Grid */
        gridSelector: "[data-grid]",
        loadingSelector: "[data-loading]",
        loadMoreSelector: "[data-load-more]",
        mimesSelector: "[data-mimeList]",
        disksSelector: "[data-diskList]",
        filesCounterSelector: "[data-file-counter]",

        /* Sidebar */
        baseInfoSelector: "[data-aside]",
        filePreviewSelector: "[data-preview]",
        idInfoSelector: "[data-id]",
        titleInfoSelector: "[data-title]",
        urlInfoSelector: "[data-url]",
        sizeInfoSelector: "[data-size]",
        mimeInfoSelector: "[data-mime]",
        diskInfoSelector: "[data-disk]",
        createdInfoSelector: "[data-created]",
        deleteBtnSelector: "[data-delete]",
        openUrlBtnSelector: "[data-open]",
        copyUrlBtnSelector: "[data-copy]",

        /* Footer */
        selectionButtonSelector: "[data-actions-sec]",
        selectionGridSelector: "[data-selected-list]",

        /* Upload */
        uploadFormSelector: "[data-upload-form]",
        dropzoneSelector: "[data-dropzone]",
        fileInputSelector: "[data-file-input]",
        uploadDiskSelector: "[data-upload-disk]",
        uploadPreviewSelector: "[data-upload-preview]",
        uploadMessagesSelector: "[data-messages]"
    }
}
```

---

#### Configuration Reference

##### `api`

Configure the package API endpoints.

| Option | Description |
|---------|-------------|
| `baseUrl` | Base URL used for all API requests. |
| `getUrl` | Endpoint used to retrieve files. |
| `uploadUrl` | Endpoint used to upload files. |
| `deleteUrl` | Endpoint used to delete files. |
| `updateUrl` | Endpoint used to update file metadata. |

---

##### `request`

General request settings.

| Option | Description |
|---------|-------------|
| `timeout` | Request timeout in milliseconds. |
| `selectedDisk` | Initial selected storage disk. |
| `selectedType` | Initial selected MIME type filter. |
| `firstRequest` | Automatically perform the first request when initialized. |

---

##### `upload`

Upload behavior.

| Option | Description |
|---------|-------------|
| `concurrency` | Maximum simultaneous uploads. |
| `size` | Maximum upload size (KB). |
| `chunkSize` | Chunk upload size. Set `0` to disable chunk uploads. |
| `requestTimeout` | Upload request timeout in milliseconds. |
| `allowedMimes` | Allowed MIME types. |
| `allowedDisks` | Allowed destination disks. |

---

##### `load`

Controls how files are loaded.

| Option | Description |
|---------|-------------|
| `perPage` | Number of files loaded per request. |
| `userId` | Load files belonging to a specific user. |
| `selectedDisk` | Default disk filter. |
| `selectedType` | Default MIME filter. |
| `getOnInit` | Automatically load files after initialization. |

---

##### `selection`

Controls file selection.

| Option | Description |
|---------|-------------|
| `mode` | `single` or `multi`. |
| `expect` | Returned value when a file is selected. Supported values: `url`, `id`, `object`, or `null` to disable selection. |

---

##### `debounce`

Debounce configuration.

| Option | Description |
|---------|-------------|
| `delay` | Delay in milliseconds before executing debounced actions. |

---

##### `log`

Debugging options.

| Option | Description |
|---------|-------------|
| `debug` | Enables console debugging. |
| `toServer` | Sends logs to a remote server. |
| `serverUrl` | Endpoint used for remote logging. |

---

##### `ui`

Contains all DOM selectors used by the package.

Override these values if your HTML structure differs from the default browser component.

---

### Usage

```javascript
document.addEventListener("DOMContentLoaded", () => {

    const fm = initFileManager({
        config: {

            load: {
                perPage: 25,
                disks: [null, "public", "s3"],
                types: [null, "video", "image/jpeg", "image/png"]
            },

            upload: {
                allowedMimes: [
                    "image/png",
                    "image/jpeg",
                    "video/mp4"
                ],

                allowedDisks: [
                    "public",
                    "s3"
                ]
            },

            selection: {
                mode: "single",
                expect: "url"
            }

        }
    }, "filemanager-2");

    fm.on("choose", (files) => {
        console.log(files);
    });

});
```

---

#### Events

The File Manager emits several events that you can subscribe to.

##### `choose`

Triggered whenever the user selects one or more files.

```javascript
fm.on("choose", (files) => {
    console.log(files);
});
```

###### Parameters

| Name | Description |
|------|-------------|
| `files` | The selected file or an array of selected files depending on the configured selection mode. |

When `selection.mode` is:

- `single` → `files` contains a single value.
- `multi` → `files` contains an array of values.

The returned value depends on the `selection.expect` option:

| Value | Returns |
|--------|---------|
| `"url"` | File URL(s) |
| `"id"` | Database ID(s) |
| `"object"` | Complete file object(s) |
| `null` | Selection is disabled |

# Need optimization for viseos or images?
this package is not 

# What's Next?

Here's what I'm currently working on:

- Report frontend errors to a configurable backend endpoint.
- Add a logging service (store logs locally or send them to a remote endpoint).
- Create a File Explorer to manage filesystem disks independently of the database.

And much more...

**Coming soon 🙂**
---



>You can use the backend endpoints to build your own frontend file browse

# Support

If you encounter a bug, have a feature request, or need help using the package, feel free to open an issue or contact us.

## Author

Sina Zangiband

## Website

https://teksite.net

https://laratek.ir
