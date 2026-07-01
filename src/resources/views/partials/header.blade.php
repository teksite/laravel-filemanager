<header class="header">
    <select data-mime>
        <option value="">All mimes</option>
        @foreach($mimes as $mime)
            <option value="{{ $mime }}">{{ $mime }}</option>
        @endforeach
    </select>

    <select data-disk>
        <option value="">All disks</option>
        @foreach($disks as $disk)
            <option value="{{ $disk }}">{{ $disk }}</option>
        @endforeach
    </select>
</header>
