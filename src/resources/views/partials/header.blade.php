<header class="header">
    <select data-mime>
        @foreach($mimes as $mime)
            @if(is_null($mime))
                <option value="">All mimes</option>
            @else
                <option value="{{ $mime }}">{{ $mime }}</option>
            @endif
        @endforeach
    </select>
    <select data-disk>
        @foreach($disks as $disk)
            @if(is_null($disk))
                <option value="">All disks</option>
            @else
                <option value="{{ $disk }}">{{ $disk }}</option>
            @endif
        @endforeach
    </select>
</header>
