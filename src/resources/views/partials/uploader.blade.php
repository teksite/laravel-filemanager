<div data-uploader-section class="uploader-section">
    <div class="data-upload-waiting is-hidden" data-upload-waiting></div>

@if(count($allowedDisks))
        <span>Upload</span>
        <form data-upload-form enctype="multipart/form-data" method="POST">

            <div class="upload-dropzone" data-dropzone>

                <input name="file" type="file" hidden multiple data-file-input>
                <div class="upload-content">
                    <div class="upload-icon">
                        <svg width="56" height="56" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 20H5a3 3 0 0 1-3-3a3 3 0 0 1 3-3h1.26A8 8 0 1 1 20 13.13A3.5 3.5 0 0 1 19 20m-7-11l-4 4h2.5v4h3v-4H16z"/>
                        </svg>
                    <div>{{strtolower(implode(' | ' ,$allowedTypes ?? []))}}</div>
                    </div>
                    <div class="upload-title">
                        Drag files here
                    </div>

                    <div class="upload-subtitle">
                        or click to browse
                    </div>
                </div>
            </div>
            <div class="upload-footer">
                <select data-upload-disk name="disk">
                    @foreach($allowedDisks as $disk)
                        <option value="{{$disk}}">
                            {{$disk}}
                        </option>
                    @endforeach

                </select>
                <button type="submit" class="upload-btn" data-upload-btn>
                    Upload
                </button>

            </div>

        </form>
        <div class="upload-files" data-upload-preview></div>
        <div class="upload-messages" data-messages></div>

    @endif

</div>
