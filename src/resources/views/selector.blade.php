<link  crossorigin="anonymous" media="all" rel="stylesheet" href="/assets/app.css">
<div class="filemanager overlay" id="fileManagerRoot">

    <section class="media-container" data-fm>

        @include('filemanager::partials.header')

        @include('filemanager::partials.grid')

        @include('filemanager::partials.footer')

    </section>
</div>
<script src="/assets/app.js"></script>
<script>
    document.addEventListener(
        'DOMContentLoaded',
        ()=>new FileManager()
    );
</script>
