<header class="header">
    <div data-filter-section>
        <input type="search" class="fm-search" data-search placeholder="{{ __('Search files...') }}" aria-label="{{ __('Search files') }}" maxlength="100">

        @if(count($mimes) > 1)
            <div class="filtering">
                <select data-mimeList aria-label="{{ __('Type') }}">
                    @foreach($mimes as $mime)
                        <option value="{{ $mime }}">{{ $mime ?? __('All types') }}</option>
                    @endforeach
                </select>
            </div>
        @endif

        @if(count($disks) > 1)
            <div class="filtering">
                <select data-diskList aria-label="{{ __('Disk') }}">
                    @foreach($disks as $disk)
                        <option value="{{ $disk }}">{{ $disk ?? __('All disks') }}</option>
                    @endforeach
                </select>
            </div>
        @endif

        <div class="filtering">
            <select data-sort aria-label="{{ __('Sort') }}">
                <option value="-created_at">{{ __('Newest first') }}</option>
                <option value="created_at">{{ __('Oldest first') }}</option>
                <option value="original_name">{{ __('Name A-Z') }}</option>
                <option value="-original_name">{{ __('Name Z-A') }}</option>
                <option value="-size">{{ __('Largest first') }}</option>
                <option value="size">{{ __('Smallest first') }}</option>
            </select>
        </div>

        <div class="filtering">
            <select data-folder-list aria-label="{{ __('Folder') }}"
                    data-all-folders="{{ __('All files') }}" data-root-folder="{{ __('Without folder') }}">
                <option value="">{{ __('All files') }}</option>
            </select>
            <button type="button" data-folder-create data-prompt="{{ __('Folder name') }}" title="{{ __('New folder') }}">＋📁</button>
        </div>

        <button type="button" data-trash-toggle aria-pressed="false" title="{{ __('Trash') }}">🗑 {{ __('Trash') }}</button>
    </div>
    <div>
        <span>{{ __('Files') }}</span>
        <span data-file-counter>0</span>
    </div>
</header>
