# Teksite Laravel File Manager

![Laravel](https://img.shields.io/badge/Laravel-13-red)
![License](https://img.shields.io/badge/license-MIT-green)
![PHP](https://img.shields.io/badge/PHP-8.3-blue)

## About

A lightweight and extensible Laravel File Manager built on top of Laravel's Filesystem.

The package follows a zero-dependency approach for the frontend. It uses only **vanilla JavaScript and pure CSS**, with
no additional JavaScript libraries, CSS frameworks, or UI packages required.

The backend relies only on **Laravel's native capabilities** and dependencies, ensuring a minimal footprint, better
performance, and easier customization.

Because it is built on Laravel Filesystem, it supports every storage driver supported by Laravel, including:

- Local
- Public
- S3
- FTP
- SFTP
- MinIO
- Any custom filesystem driver

**It is designed to be used as a standalone media manager or as a backend service for building your own custom file
management interfaces.**

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
- Custom file naming strategies
- Configurable upload paths
- Automatic database synchronization
- Vanilla JavaScript frontend
- Zero frontend dependencies
- No backend dependencies except Laravel
- Event-driven architecture
- Multiple upload support
- Cursor pagination support
- Custom authorization layer
- Storage driver agnostic
- Customizable UI selectors

---

## Security

The package provides:

- Upload validation
- MIME type filtering
- Disk-level restrictions
- Authorization hooks
- Configurable file visibility
- No direct filesystem access from frontend

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

# File Browser (based ond DB):

---

---

## BACKEND

## Events

This package dispatches several Laravel events during the lifecycle of a file.

You can listen to these events to execute your own logic alongside the main process, extend the package behavior, or
integrate it with other packages and services.

Each event provides the related file information as an argument.

```php
\Teksite\FileManager\Events\NewFileUploadEvent.php

\Teksite\FileManager\Events\FileUploading.php       // Arguments: (UploadedFile $file)

\Teksite\FileManager\Events\FileUploaded.php        // Arguments: (UploadFile $file)

\Teksite\FileManager\Events\FileUpdating.php        // Arguments: (UploadFile $file)

\Teksite\FileManager\Events\FileUpdated.php         // Arguments: (UploadFile $file)

\Teksite\FileManager\Events\FileDeleting.php        // Arguments: (UploadFile $file)

\Teksite\FileManager\Events\FileDeleted.php 

```

| Event              | Argument         | Description            |
|--------------------|------------------|------------------------|
| NewFileUploadEvent |                  | start to upload a file |
| FileUploading      | UploadFile $file | Before storing file    |
| FileUploaded       | UploadFile $file | After storing file     |
| FileUpdating       | UploadFile $file | Before updating file   |
| FileUpdated        | UploadFile $file | After updating file    |
| FileDeleting       | UploadFile $file | Before deleting file   |
| FileDeleted        | UploadFile $file | After deleting file    |

## Routes

The package registers both **API** and **Web** routes.

The default route prefixes are configurable in `config/filemanager.php`.

---

### API Routes

| Method | Route Name                     | URI                        | Description                                       |
|--------|--------------------------------|----------------------------|---------------------------------------------------|
| GET    | `api.filemanager.index`        | `/api/filemanager`         | List uploaded files.                              |
| GET    | `api.filemanager.show`         | `/api/filemanager/{file}`  | Retrieve a single file.                           |
| POST   | `api.filemanager.store`        | `/api/filemanager`         | Upload a new file.                                |
| PATCH  | `api.filemanager.update`       | `/api/filemanager/{file}`  | Update a file's metadata.                         |
| DELETE | `api.filemanager.destroy`      | `/api/filemanager/{file}`  | Delete a file from both the database and storage. |
| DELETE | `api.filemanager.destroy.path` | `/api/filemanager/remove`  | Delete a physical file directly from storage.     |
| GET    | `api.filemanager.browser`      | `/api/filemanager/browser` | Returns the file browser frontend.                |

---

### Web Routes

| Method | Route Name            | URI                    | Description                                  |
|--------|-----------------------|------------------------|----------------------------------------------|
| GET    | `filemanager.browser` | `/filemanager/browser` | Displays the file manager browser interface. |

---

## Request Parameters

### GET /api/filemanager

Returns a paginated list of uploaded files.

#### Query Parameters

| Parameter  | Type    | Description                           |
|------------|---------|---------------------------------------|
| `page`     | integer | Page number when using pagination.    |
| `per_page` | integer | Number of items per page.             |
| `cursor`   | string  | Cursor value for cursor pagination.   |
| `user_id`  | integer | Filter files by owner.                |
| `disk`     | string  | Filter by storage disk.               |
| `type`     | string  | Filter by MIME type or file category. |

Example:

```text
/api/filemanager?per_page=25&disk=public&type=image
```

---

### GET /api/filemanager/{file}

Returns information for a single uploaded file.

#### Route Parameter

| Parameter | Description                 |
|-----------|-----------------------------|
| `file`    | UploadFile model or file ID |

---

### POST /api/filemanager

Uploads a single file.

#### Form Data

| Field  | Required | Description                                                 |
|--------|----------|-------------------------------------------------------------|
| `file` | ✔        | File to upload.                                             |
| `disk` | ✖        | Destination storage disk. Uses the default disk if omitted. |

---

### PATCH /api/filemanager/{file}

Updates file information.

#### Parameters

| Field   | Required | Description                  |
|---------|----------|------------------------------|
| `file`  | ✔        | UploadFile model or file ID. |
| `title` | ✔        | New file title.              |

---

### DELETE /api/filemanager/{file}

Deletes a file from both the database and the configured storage disk.

#### Route Parameter

| Parameter | Description                 |
|-----------|-----------------------------|
| `file`    | UploadFile model or file ID |

---

### DELETE /api/filemanager/remove

Deletes a physical file without removing any database record.

#### Body Parameters

| Field  | Required | Description         |
|--------|----------|---------------------|
| `path` | ✔        | Relative file path. |
| `disk` | ✔        | Storage disk name.  |

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

| Variable        | Description                                          |
|-----------------|------------------------------------------------------|
| `$disks`        | Available storage disks shown in the browser filter. |
| `$mimes`        | Available MIME type filters.                         |
| `$allowedDisks` | Disks that users are allowed to upload files to.     |
| `$allowedTypes` | Allowed MIME types for file uploads.                 |

These values should normally come directly from your `config/filemanager.php` file.

> **Important**
>
> These four variables are required for the frontend and backend to work correctly together. The browser uses them to
> build filters, validate uploads, and synchronize with the package's API.

All other frontend customizations are optional. You are free to modify the surrounding layout, styling, or integrate the
browser into your own interface as long as these required variables are provided.


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
                    perPage: {{ $perPage }}
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

| Variable        | Description                                        |
|-----------------|----------------------------------------------------|
| `$disks`        | Available storage disks displayed in the browser.  |
| `$mimes`        | Available MIME type filters.                       |
| `$allowedDisks` | Storage disks that users are allowed to upload to. |
| `$allowedTypes` | Allowed MIME types for uploads.                    |

> **Important**
>
> These configuration values keep the frontend synchronized with the backend. They are used to build filters, validate
> uploads, and ensure that the browser behaves consistently with your package configuration.

All other JavaScript options are optional and may be customized to fit your application's requirements.

---

## Frontend

The package includes a lightweight JavaScript library (vanilla JS and pure CSS) for interacting with the File Manager.

<img src="https://teksite.net/uploads/images/packages/filemanager-browser.jpg" alt="DB File Browser">

---

### Configuration

`initFileManager()` accepts a configuration object. Every option is optional unless otherwise noted.

```javascript
 {
    api: {
        baseUrl: '',
            getUrl: '/api/filemanager',
            uploadUrl: '/api/filemanager',

            deleteUrl: '/api/filemanager',
            updateUrl: '/api/filemanager',
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
            allowedDisks: [],
    },

    load: {
        perPage: 25,
            cursorName: 'cursor',
            userId: null,

            selectedDisk: null,
            selectedType: null,
            getOnInit: true,
    },

    log: {
        debug: false,
            toServer: true,
            serverUrl: null
    },


    selection: {
        mode: 'multi', //single: only one file | multi,multiple : multi file
        expect: 'url',  //url , id ,files ,object |null : disable
    },

    debounce: {
        delay: 300
    },

    ui: {
        mainSelector: '.filemanager',

            /* loader ui*/
            gridSelector: '[data-grid]',
            loadingSelector: '[data-loading]',
            loadMoreSelector: '[data-load-more]',
            mimesSelector: '[data-mimeList]',
            disksSelector: '[data-diskList]',

            filesCounterSelector: '[data-file-counter]',


            /* aside ui*/
            baseInfoSelector: '[data-aside]',
            filePreviewSelector: '[data-preview]',
            idInfoSelector: '[data-id]',
            titleInfoSelector: '[data-title]',
            urlInfoSelector: '[data-url]',
            sizeInfoSelector: '[data-size]',
            mimeInfoSelector: '[data-mime]',
            diskInfoSelector: '[data-disk]',
            createdInfoSelector: '[data-created]',
            deleteBtnSelector: '[data-delete]',
            openUrlBtnSelector: '[data-open]',
            copyUrlBtnSelector: '[data-copy]',

            /* footer */
            selectionButtonSelector: '[data-actions-sec]',
            selectionGridSelector: '[data-selected-list]',

            /* uploader ui*/
            uploadFormSelector: '[data-upload-form]',
            dropzoneSelector: '[data-dropzone]',
            fileInputSelector: '[data-file-input]',
            uploadDiskSelector: '[data-upload-disk]',
            uploadPreviewSelector: '[data-upload-preview]',
            uploadMessagesSelector: '[data-messages]',
    }
}
```

---

#### Configuration Reference

##### `api`

Configure the package API endpoints.

| Option      | Description                            |
|-------------|----------------------------------------|
| `baseUrl`   | Base URL used for all API requests.    |
| `getUrl`    | Endpoint used to retrieve files.       |
| `uploadUrl` | Endpoint used to upload files.         |
| `deleteUrl` | Endpoint used to delete files.         |
| `updateUrl` | Endpoint used to update file metadata. |

---

##### `request`

General request settings.

| Option         | Description                                               |
|----------------|-----------------------------------------------------------|
| `timeout`      | Request timeout in milliseconds.                          |
| `selectedDisk` | Initial selected storage disk.                            |
| `selectedType` | Initial selected MIME type filter.                        |
| `firstRequest` | Automatically perform the first request when initialized. |

---

##### `upload`

Upload behavior.

| Option           | Description                                          |
|------------------|------------------------------------------------------|
| `concurrency`    | Maximum simultaneous uploads.                        |
| `size`           | Maximum upload size (KB).                            |
| `chunkSize`      | Chunk upload size. Set `0` to disable chunk uploads. |
| `requestTimeout` | Upload request timeout in milliseconds.              |
| `allowedMimes`   | Allowed MIME types.                                  |
| `allowedDisks`   | Allowed destination disks.                           |

---

##### `load`

Controls how files are loaded.

| Option         | Description                                    |
|----------------|------------------------------------------------|
| `perPage`      | Number of files loaded per request.            |
| `userId`       | Load files belonging to a specific user.       |
| `selectedDisk` | Default disk filter.                           |
| `selectedType` | Default MIME filter.                           |
| `getOnInit`    | Automatically load files after initialization. |

---

##### `selection`

Controls file selection.

| Option   | Description                                                                                                      |
|----------|------------------------------------------------------------------------------------------------------------------|
| `mode`   | `single` or `multi`.                                                                                             |
| `expect` | Returned value when a file is selected. Supported values: `url`, `id`, `object`, or `null` to disable selection. |

---

##### `debounce`

Debounce configuration.

| Option  | Description                                               |
|---------|-----------------------------------------------------------|
| `delay` | Delay in milliseconds before executing debounced actions. |

---

##### `log`

Debugging options.

| Option      | Description                       |
|-------------|-----------------------------------|
| `debug`     | Enables console debugging.        |
| `toServer`  | Sends logs to a remote server.    |
| `serverUrl` | Endpoint used for remote logging. |

---

##### `ui`

Contains all DOM selectors used by the package.

Override these values if your HTML structure differs from the default browser component.

---

#### events

The Database File browser emits a set of events throughout its lifecycle.

You can listen to these events from your frontend code to extend the behavior of the file manager, update your UI,
trigger custom actions, or integrate it with other parts of your application.

```js
{


    /* Upload */
    UPLOAD_SIGNAL: 'upload:selected_remove',
        UPLOAD_SELECTED_REMOVE: 'upload:selected_remove',
        UPLOAD_SELECTED: 'upload:selected',
        UPLOAD_START: 'upload:start',
        UPLOAD_PROGRESS: 'upload:progress',
        UPLOAD_SUCCESS: 'upload:success',
        UPLOAD_FAILED: 'upload:failed',
        UPLOAD_COMPLETE: 'upload:complete',

        /* load */
        FILES_LOADED: 'files:loaded',
        FILES_REQUEST: 'files:request_send',
        FILES_REQUEST_FAILED: 'files:request_send_failed',
        FILES_RECEIVE: 'files:response_get',
        FILES_RECEIVE_FAILED: 'files:response_get_failed',

        FILES_NO_MORE: 'files:no_more',
        FILES_NEED_MORE: 'files:need_more',
        FILES_NEW: 'files:need_more',


        /* info */

        FILE_DELETE_SIGNAL: 'file:send_delete_signal',
        FILE_DELETED: 'file:send_deleted',
        FILE_DELETE_FAILED: 'file:delete_file_failed',
        FILE_SELECT:'file_selected',


        FILE_UPDATE_TITLE_SIGNAL: 'file:send_update_title_signal',
        FILE_UPDATED_TITLE : 'file_updated_title',
        FILE_UPDATE_TITLE_FAILED : 'file_updated_title_failed',

        FILE_URL_COPIED : 'file_copied_url',
        FILE_URL_COPIED_FAILED : 'file_copy_url_failed',

        /* Grid */
        GRID_UPDATED: 'grid:updated',
        GRID_CLEARED: 'grid:cleared',
        GRID_CLEAR: 'grid:clear',
        GRID_LOAD_START: 'grid:load:start',
        GRID_LOAD_END: 'grid:load:end',

        /* Selection */
        SELECTION_CLICK: 'selection:item_clicked',
        SELECTION_REMOVE_SIGNAL: 'selection:item_remove_signal',
        SELECTION_REMOVED: 'selection:item_remove',
        SELECTION_CHANGED: 'selection:changed',
        SELECTION_CLEARED: 'selection:cleared',
        SELECTION_ON_CHOOSE: 'selection:return_selected_files',
        SELECTION_CHOSEN: 'selection:return_selected_files',

        SELECTION_SELECT_BUTTON_MADE : 'selection:make_button',

        /* Preview */
        PREVIEW_UPDATED: 'preview:updated',
        PREVIEW_CLEARED: 'preview:cleared',

        /* Filter */
        FILTER_CHANGED: 'filter:changed',

        /* Error */

        CHOOSE: 'choose',
        UPLOAD: 'upload',
        DELETE: 'delete',
        UPDATE: 'update',
        ERROR: 'error',

}

```

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

| Name    | Description                                                                                 |
|---------|---------------------------------------------------------------------------------------------|
| `files` | The selected file or an array of selected files depending on the configured selection mode. |

When `selection.mode` is:

- `single` → `files` contains a single value.
- `multi` → `files` contains an array of values.

The returned value depends on the `selection.expect` option:

| Value      | Returns                 |
|------------|-------------------------|
| `"url"`    | File URL(s)             |
| `"id"`     | Database ID(s)          |
| `"object"` | Complete file object(s) |
| `null`     | Selection is disabled   |

---

---

## Extensibility & Integration

This package does not rely on any additional packages, either on the backend or frontend side.

The reason behind this approach is to keep the package lightweight and give you complete freedom to choose and integrate
the tools that best fit your project's needs.

You can easily connect your preferred packages, customize the workflow, and build your own features on top of this
package without fighting against unnecessary dependencies.

For image processing tasks, such as resizing, quality adjustment, format conversion, thumbnail generation, or optimization, you can integrate packages like:
 
[Intervention Image](https://github.com/Intervention/image)

### Managing Generated Files

If you need to generate multiple versions of a file (for example different image sizes or optimized formats), you can
extend the file manager table.

Add a nullable `parent_id` column to the package's files table:

```php
$table->string('parent_id')->nullable()->index();
```

I recommend using a simple string column instead of a foreign key relation.

The reason is flexibility. In some workflows, you may want to delete the original file while keeping generated
versions (or the opposite). A strict database relationship may limit your options.

Then, in your model, you can create a one-to-many relationship with itself:

```php
public function children()
{
    return $this->hasMany(File::class, 'parent_id');
}


public function parent()
{
    return $this->belongsTo(File::class, 'parent_id');
}
```

With this approach:

- You can manage generated files from the frontend.
- You can keep track of file variations.
- You have more flexibility for future extensions.
- Different processing workflows can be implemented without changing the core package.

### Using Upload Events

You can use the upload event to process files immediately after they are uploaded.

Listen to:

\Teksite\FileManager\Events\FileUploaded::class

Example:

```php
Event::listen(FileUploaded::class, function ($event) {

    $file = $event->file;

    // Resize image
    // Generate thumbnails
    // Convert formats
    // Optimize quality

});
```

This allows you to extend the upload pipeline while keeping the core package clean and independent.

---

---

# Components

## Simple database file manager
If you don't need a custom frontend, the package includes a ready-to-use browser interface.

It allows users to:

- Upload files
- Browse uploaded files
- Rename file titles
- Delete files

Simply embed the browser anywhere in your application:

```html
<iframe src="/filemanager/browser" style="width:100%;min-height:900px;border:0;"></iframe>
```

This is the quickest way to integrate the file manager without writing any frontend code.
 ---

# Integration

## standalone button

```html
<button id="imageBtn" data-filemanager data-mode="single" data-mime="image">
    Image
</button>
```

```js
const picker = new StandaloneButton('#imageBtn',{
    trigger:"#imageBtn",
    config:{
        load:{
            types:["image"],
            disks:["public"],
        },
        selection:{
            mode:"multi",
            expect:"object"
        }
    }
}).on(files => {
    console.log(files);
});
```

# What's Next?

Here's what I'm currently working on:
- Report frontend errors to a configurable backend endpoint.
- Add a logging service (store logs locally or send them to a remote endpoint).
- Create a File Explorer to manage filesystem disks independently of the database.

And much more...

**Coming soon 🙂**

- integrated : 
  - Ckeditor
  - tinyMic
  - chunk upload : large file
  - my own WYSWG

---



> You can use the backend endpoints to build your own frontend file browse

## Philosophy

This package provides the core file management layer and intentionally avoids forcing a specific workflow.
You own the final implementation.

Choose your preferred image processors, frontend frameworks, queues, and integrations.
# Support

If you encounter a bug, have a feature request, or need help using the package, feel free to open an issue or contact
us.

## Author

Sina Zangiband

## Website

https://teksite.net

https://laratek.ir
