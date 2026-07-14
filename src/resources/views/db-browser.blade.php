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









