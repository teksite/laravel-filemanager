<link crossorigin="anonymous" media="all" rel="stylesheet" href="/assets/app.css">
<div class="filemanager" id="fileManagerRoot">
    <section class="media-container" data-fm>
        @include('filemanager::partials.uploader')
        @include('filemanager::partials.sidebar')
        @include('filemanager::partials.header')
        @include('filemanager::partials.grid')
        @include('filemanager::partials.footer')

    </section>

</div>
{{--<script type="module">--}}
{{--    import { initFileManager } from '/assets/browser/index.js';--}}
{{--    document.addEventListener('DOMContentLoaded', () => {--}}
{{--        const fm = initFileManager({--}}
{{--            api: {--}}
{{--                baseUrl: '/api/filemanager'--}}
{{--            },--}}
{{--            upload: {--}}
{{--                concurrency: 3--}}
{{--            },--}}
{{--            selection: {--}}
{{--                mode: 'multi',--}}
{{--                type: 'id'--}}
{{--            }--}}
{{--        });--}}

{{--        window.fm = fm; // optional debug access--}}

{{--    });--}}
{{--</script>--}}

<script src="/assets/app.js"> </script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        new DatabaseFileManager().select({
            mode: 'multi'
        });
    })
</script>










