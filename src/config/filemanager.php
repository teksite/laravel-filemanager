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
    'routes'       => [

        'web' => [
            'enabled'    => true,
            'prefix'     => 'filemanager',             // Web route URI prefix
            'name'       => 'filemanager.',            // Route name prefix
            'middleware' => ['web', 'auth'],           // Applied middleware stack
            'domain'     => null,
        ],

        'api' => [
            'enabled'    => true,
            'prefix'     => 'api/filemanager',         // API route URI prefix
            'name'       => 'api.filemanager.',        // Route name prefix
            'domain'     => null,
            'middleware' => ['api'],                    // Applied middleware stack
            'throttle'   => [                           // Rate limits per minute (per user, falling back to IP).
                                                      'read'   => 120,
                                                      'write'  => 60,
                                                      'upload' => 30,
            ],
        ],
    ],


    /*
    |--------------------------------------------------------------------------
    | Disks
    |--------------------------------------------------------------------------
    | "browse_disks" are the disks that can be listed and filtered, while
    | "upload_disks" are the only disks a user may upload to. Both lists are
    | enforced on the server. Disks that do not exist are ignored.
    */
    'default_disk' => env('FILEMANAGER_DISK', 'public'),
    'browse_disks' => ['public'],
    'upload_disks' => ['public'],

    /*
    |--------------------------------------------------------------------------
    | Type filters shown in the browser
    |--------------------------------------------------------------------------
    | Allowed values: image, video, audio, document, archive, text or any
    | explicit mime type such as "application/pdf".
    */
    'browse_types' => ['image', 'video', 'audio', 'document'],
    'per_page'     => 25,
    'max_per_page' => 100,


    /*
   |--------------------------------------------------------------------------
   | Upload restrictions
   |--------------------------------------------------------------------------
   | The mime type is always detected from the file content, never trusted
   | from the client. The detected mime and the extension must both be allowed
   | and must match each other.
   |
   | allowed_types : mime types, mime wildcards (image/*) or extensions.
   |                 An empty list allows everything that is not blocked.
   | blocked_*     : always rejected. Executable and active content is
   |                 blocked by default; remove entries only if you really
   |                 understand the risk (e.g. serving user SVG from your domain).
   */
    'upload'       => [
        'allowed_types' => ['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/plain', 'application/zip'],

        'blocked_extensions' => [
            'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'phar', 'pht', 'phps',
            'exe', 'dll', 'bat', 'cmd', 'com', 'msi', 'sh', 'bash', 'cgi', 'pl', 'py', 'rb',
            'jsp', 'asp', 'aspx', 'htaccess', 'htpasswd', 'ini', 'jar', 'war',
            'html', 'htm', 'xhtml', 'xml', 'svg', 'svgz', 'js', 'mjs',
        ],
        'blocked_mimes'      => [
            'text/html', 'application/xhtml+xml', 'image/svg+xml', 'text/xml', 'application/xml',
            'application/javascript', 'text/javascript', 'application/x-httpd-php', 'text/x-php',
            'application/x-sh', 'application/x-msdownload', 'application/x-dosexec',
        ],

        'max_size_kb'           => 10240,   // null = unlimited
        'min_size_kb'           => null,
        'max_files_per_request' => 20,

        // Images are decoded header-only to read their size; huge dimensions
        // are rejected to prevent decompression bombs.
        'max_image_pixels'      => 50_000_000,

        // Reject a file when an identical one (sha-256) already exists for the
        // same disk and user, and return the existing record instead.
        'deduplicate'           => false,
    ],

    /*
     |--------------------------------------------------------------------------
     | Storage
     |--------------------------------------------------------------------------
     | upload_path placeholders: {Y} {y} {m} {d} {H} {i} {user}
     | The path is built on the server only; clients can never choose it.
     */
    'storage'      => [
        'path'              => 'uploads/{Y}/{m}',
        'visibility'        => 'public',      // public | private (applied on upload)
        'strategies'        => [
            'uuid'      => \Teksite\FileManager\Strategies\UUIDFileNameStrategy::class,
            'random'    => \Teksite\FileManager\Strategies\RandomFileNameStrategy::class,
            'timestamp' => \Teksite\FileManager\Strategies\TimestampFileNameStrategy::class,
            'original'  => \Teksite\FileManager\Strategies\OriginalFileNameStrategy::class,
        ],
        'default_strategy'  => 'uuid',
        'random_length'     => 32,
        'overwrite'         => false,
        'slugify'           => true,          // slugify names for the "original" strategy
        'delete_physical'   => true,          // remove the stored files when a record is force deleted
        'temporary_url_ttl' => 15,            // minutes, for non-public disks
    ],


    /*
    |--------------------------------------------------------------------------
    | Image processing (optional, needs ext-gd)
    |--------------------------------------------------------------------------
    */
    'thumbnails'   => [
        'enabled'           => true,
        'queue'             => null,           // null = run after the response
        'quality'           => 80,
        'max_source_pixels' => 16_000_000,     // larger sources are skipped to protect memory
        'sizes'             => [
            'thumb'  => [320, 320],
            'medium' => [960, 960],
        ],
    ],


    /*
    |--------------------------------------------------------------------------
    | Trash
    |--------------------------------------------------------------------------
    | Deleted files are soft deleted first. Run `php artisan filemanager:prune`
    | (scheduled daily) to permanently remove files older than the retention.
    */
    'trash'        => [
        'enabled'        => true,
        'retention_days' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | Database
    |--------------------------------------------------------------------------
    | user_id_type: id | uuid | ulid, must match your users table key.
   */
    'database'     => [
        'user_id_type'    => 'id',
        'load_migrations' => true,
    ],

    'user_model'  => null,   // defaults to auth.providers.users.model


    /*
    |--------------------------------------------------------------------------
    |--------------------------------------------------------------------------
    |--------------------------------------------------------------------------
    |--------------------------------------------------------------------------
    |--------------------------------------------------------------------------
    |--------------------------------------------------------------------------
    |--------------------------------------------------------------------------
    */


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

    'allow_upload_disks' => [            // allowed disk to be uploaded to
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

        'get_browser' => \Teksite\FileManager\Http\Requests\Authorization\CanGetBrowser::class,

        'upload' => \Teksite\FileManager\Http\Requests\Authorization\CanUpload::class,

        'get_one' => \Teksite\FileManager\Http\Requests\Authorization\CanGetOne::class,

        'get_all' => \Teksite\FileManager\Http\Requests\Authorization\CanGetAll::class,

        'delete' => \Teksite\FileManager\Http\Requests\Authorization\CanDelete::class,

        'update' => \Teksite\FileManager\Http\Requests\Authorization\CanUpload::class,
    ],


];
