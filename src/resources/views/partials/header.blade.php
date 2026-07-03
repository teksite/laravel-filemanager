<header class="header">
    <div data-filter-section>
        <span>Filters</span>
        <div class="filtering">
            @if(count($mimes))
                <select data-mimeList>
                    @foreach($mimes as $mime)
                        @if(is_null($mime))
                            <option value="">All mimes</option>
                        @else
                            <option value="{{ $mime }}">{{ $mime }}</option>
                        @endif
                    @endforeach
                </select>
            @endif
        </div>
        <div class="filtering">
            @if(count($disks))

                <select data-diskList>
                    @foreach($disks as $disk)
                        @if(is_null($disk))
                            <option value="">All disks</option>
                        @else
                            <option value="{{ $disk }}">{{ $disk }}</option>
                        @endif
                    @endforeach
                </select>
            @endif
        </div>
    </div>
    <div data-uploader-section>

        @if(count($allowedDisks))
            <span>Upload</span>
            <form data-upload-form>
                <div class="upload-dropzone" data-dropzone>
                    <input type="file" hidden multiple data-file-input>
                    <div class="upload-content">
                        <div class="upload-icon">
                            <svg width="56" height="56" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M19 20H5a3 3 0 0 1-3-3a3 3 0 0 1 3-3h1.26A8 8 0 1 1 20 13.13A3.5 3.5 0 0 1 19 20m-7-11l-4 4h2.5v4h3v-4H16z"/
                            </svg>
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
                    <select data-upload-disk>
                        @foreach($allowedDisks as $disk)
                            <option value="{{$disk}}">
                                {{$disk}}
                            </option>
                        @endforeach

                    </select>
                    <button type="submit" class="upload-btn">
                        Upload
                    </button>

                </div>
                <div class="upload-files" data-upload-preview></div>

            </form>

        @endif

    </div>
</header>
