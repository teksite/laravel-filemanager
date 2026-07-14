<link crossorigin="anonymous" media="all" rel="stylesheet" href="{{asset('/vendor/filemanager/browser.min.css')}}">

@php($uniqueId = Str::ulid()->toString())
<div class="filemanager" id="fileManagerRoot" data-database-filemanager="{{$uniqueId}}">
    <section class="media-container" data-fm>
        @include('filemanager::partials.uploader')
        @include('filemanager::partials.sidebar')
        @include('filemanager::partials.header')
        @include('filemanager::partials.grid')
        <div>
            @include('filemanager::partials.loader')
            @include('filemanager::partials.footer')
        </div>

    </section>
</div>
<script type="module">
    import initFileManager from "{{ asset('/vendor/filemanager/browser.min.js') }}";

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
        }, '{{$uniqueId}}');

    });
</script>
















