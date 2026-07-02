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
        <span>upload</span>
        <input type="file" name="file"/>
    </div>
</header>
