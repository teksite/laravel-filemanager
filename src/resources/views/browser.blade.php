<div class="filemanager" id="fileManagerRoot" data-database-filemanager="{{\Illuminate\Support\Str::ulid()->toString()}}">
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



