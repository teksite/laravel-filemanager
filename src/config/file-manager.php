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
];
