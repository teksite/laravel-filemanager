<link crossorigin="anonymous" media="all" rel="stylesheet" href="/assets/app.css">
<div class="filemanager" id="fileManagerRoot" >

    <section class="media-container" data-fm>

        @include('filemanager::partials.sidebar')
        @include('filemanager::partials.header')
        @include('filemanager::partials.grid')
        @include('filemanager::partials.footer')

    </section>

</div>
<script src="/assets/app.js"></script>

<script>
    document.addEventListener(
        'DOMContentLoaded',
        () => new DatabaseFileManager({defaultDisk: null, defaultMime: null}));
</script>










