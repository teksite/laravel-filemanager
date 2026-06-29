<?php

return [
    'routes' => [
        'web' => [
            'prefix'      => '/file-manager/',
            'name'        => 'filemanager',
            'middlewares' => ['web'],
        ],
        'api' => [
            'prefix'      => '/api/file-manager/',
            'name'        => 'api.filemanager',
            'middlewares' => [],
        ],
    ],
    'hiddenFiles' => true,

    'diskList' => ['public'],

    'paginate'=>50,

    'maxUploadFileSize' => null,


    'allowFileTypes' => [],




    'default_store_disk' => 'public',

    'keep_file_name' => false,

    'slugify_names' => true,

    'overwrite' => false,

    'upload_path' => 'uploads',

    'naming_strategy' => 'uuid',

    'random_name_length' => 32,

    'delete_file_with_model' => true,

    'store_hash' => true,


];
