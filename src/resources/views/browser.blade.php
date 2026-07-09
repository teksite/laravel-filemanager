<link crossorigin="anonymous" media="all" rel="stylesheet" href="/assets/app.css">
<div class="filemanager" id="fileManagerRoot">
    <section class="media-container" data-fm>
        @include('filemanager::partials.uploader')
        @include('filemanager::partials.sidebar')
        @include('filemanager::partials.header')
        @include('filemanager::partials.grid')
       <div>
           <div class="loader-buttons">
               <button role="button" type="button" class="loadMoreBtn" data-load-more>{{__('load more')}}</button>
           </div>
           @include('filemanager::partials.footer')
       </div>

    </section>
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
        } , 'filemanager-1');
        fm.on('choose', files => {
            console.log(files);
        });
    });

</script>








