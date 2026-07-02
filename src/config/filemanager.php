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

            'name' => 'filemanager',         // Route name prefix

            'middlewares' => ['web'],               // Applied middleware stack
        ],

        'api' => [
            'prefix' => '/api/filemanager/',   // API route URI prefix

            'name' => 'api.filemanager',     // Route name prefix

            'middlewares' => [],                    // Applied middleware stack
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
    'hiddenFiles' => true,                           // Hide system and hidden files from listings

    'disk_list' => [null,
        'local',
        'public',
        's3',
        's3-arvan_private',
        's3-arvan_public',
    ],                 // Allowed filesystem disks ,[] means all disks without filter ,set it [null , public , ...] to have all and filter

    'type_list' => [null, 'image', 'text' ,'video' ,'audio'],               // Allowed mime types ,[] means all mimes without filter ,set it [null , image , video/mp4 ...] to have all and filter

    'per_page' => 5,                                // Default pagination size

    /*
    |--------------------------------------------------------------------------
    | Upload Restrictions
    |--------------------------------------------------------------------------
    |
    | Define upload limitations and allowed file types.
    |
    */

    'allow_file_types' => [],                       // Allowed mime types or extensions (empty = allow all)

    'forbidden_file_types' => [],                   // Forbidden mime types or extensions (empty = allow all)

    'max_file_size' => null,                      // in KB, (null means no restrictions)

    'min_file_size' => null,                      // in KB, (null means no restrictions)

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
    ],


];
