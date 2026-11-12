<?php

$autoload = __DIR__ . '/../vendor/autoload.php';

if (is_file($autoload)) {
    require $autoload;

    return;
}

// Minimal PSR-4 autoloader so the framework-agnostic unit tests can run without `composer install`.
spl_autoload_register(static function (string $class): void {
    foreach (['Teksite\\Module\\Tests\\' => __DIR__ . '/', 'Teksite\\Module\\' => __DIR__ . '/../src/'] as $prefix => $directory) {
        if (str_starts_with($class, $prefix)) {
            $file = $directory . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';

            if (is_file($file)) {
                require $file;
            }
        }
    }
});
