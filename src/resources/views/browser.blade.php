<link crossorigin="anonymous" media="all" rel="stylesheet" href="/assets/app.css">
<div class="filemanager" id="fileManagerRoot">
    <section class="media-container" data-fm>
        @include('filemanager::partials.uploader')
        @include('filemanager::partials.sidebar')
        @include('filemanager::partials.header')
        @include('filemanager::partials.grid')
        @include('filemanager::partials.footer')

    </section>
    <button type="button" role="button" id="choose">
        click
    </button>
</div>

<script type="module">
    import initFileManager
        from "{{ Vite::asset('packages/teksite/laravel-filemanager/src/resources/assets/browser/index.js') }}";

    document.addEventListener('DOMContentLoaded', () => {
        const fm = initFileManager({
            config:
                {
                    load: {
                        disks:@js($disks),
                        types:@js($mimes),
                        perPage: {{$perPage}}
                    },
                    upload: {
                        allowedMimes: @js($allowedTypes),
                        allowedDisks: @js($allowedDisks)
                    }
                }
        });
        fm.on('choose', files => {
            console.log(files);
        });

    });



</script>
{{--

   {
        $disks = $this->chosenDisks();
        $mimes = $this->chosenMimes();

        $allowedDisks = $this->allowedDisks();
        $allowedTypes = $this->allowedTypes();



<script src="/assets/app.js"> </script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        new DatabaseFileManager().select({
            mode: 'multi'
        });
    })
</script>
--}}










