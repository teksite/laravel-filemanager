<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ in_array(app()->getLocale(), ['fa', 'ar', 'he', 'ur']) ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ __('File manager') }}</title>
    <link rel="stylesheet" href="{{ asset('vendor/filemanager/browser.min.css') }}">
</head>
<body>
@include('filemanager::browser')

<script type="module">
    import {initFileManager} from @js(asset('vendor/filemanager/browser.min.js'));

    initFileManager({
        api: {
            getUrl: @js(route(config('filemanager.routes.api.name').'index', [], false)),
            uploadUrl: @js(route(config('filemanager.routes.api.name').'store', [], false)),
            deleteUrl: @js(route(config('filemanager.routes.api.name').'index', [], false)),
            updateUrl: @js(route(config('filemanager.routes.api.name').'index', [], false)),
        },
        load: {disks: @js($disks), types: @js($mimes), perPage: @js($perPage)},
        upload: {
            allowedMimes: @js($allowedTypes),
            allowedDisks: @js($allowedDisks),
            size: @js($maxSizeKb),
        },
    }, @js($id));
</script>
</body>
</html>
