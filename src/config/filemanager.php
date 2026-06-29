<?php

return [
    'routes'      => [
        'web' => [
            'prefix'      => '/filemanager/',
            'name'        => 'filemanager',
            'middlewares' => ['web'],
        ],
        'api' => [
            'prefix'      => '/api/filemanager/',
            'name'        => 'api.filemanager',
            'middlewares' => [],
        ],
    ],
    'hiddenFiles' => true,
    'diskList' => ['public'],
    'paginate' => 50,

    'maxUploadFileSize' => null,
    'allowFileTypes' => [],


    'default_store_disk' => 'public',
    'slugify_name' => true,
    'overwrite' => false,
    'upload_path' => 'uploads',
    'naming_strategy' => [
        'random'    => \Teksite\FileManager\Strategies\RandomFileNameStrategy::class,
        'timestamp' => \Teksite\FileManager\Strategies\TimestampFileNameStrategy::class,
        'original'  => \Teksite\FileManager\Strategies\OriginalFileNameStrategy::class,
        'uuid'      => \Teksite\FileManager\Strategies\UUIDFileNameStrategy::class,
    ],
    'default_naming_strategy' => 'uuid',
    'random_name_length' => 32,
    'delete_file_with_model' => true,


];
