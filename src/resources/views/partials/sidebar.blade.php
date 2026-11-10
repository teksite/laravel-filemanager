<aside class="aside" data-aside>

    <div class="preview-box" data-preview>
        {{__('select media')}}
    </div>

    <div class="file-info">

        <h3>{{__('file info')}}</h3>

        <div>
            <b>ID</b>
            <span data-id>-</span>
        </div>

        <div>
            <b>{{__('title')}}</b>
            <span data-title>-</span>
        </div>

        <div>
            <b>{{__('URL')}}</b>

            <span data-url>-</span>
            <div class="url-btns">
                <button data-open title="open" disabled>🔗</button>
                <button data-copy title="copy" disabled>📋</button>
            </div>
        </div>

        <div>
            <b>{{__('size')}}</b>
            <span data-size>-</span>
        </div>

        <div>
            <b>{{__('mime type')}}</b>
            <span data-mime>-</span>
        </div>

        <div>
            <b>{{__('disk')}}</b>
            <span data-disk>-</span>
        </div>

        <div>
            <b>{{__('created at')}}</b>
            <span data-created>-</span>
        </div>

    </div>
    <div data-move-box>
        <b>{{ __('Folder') }}</b>
        <select data-move-folder disabled aria-label="{{ __('Move to folder') }}">
            <option value="root">{{ __('Without folder') }}</option>
        </select>
    </div>

    <button data-restore type="button" class="is-hidden" disabled>↩ {{ __('Restore') }}</button>

    <button data-delete type="button" class="delete-button" disabled>
        🗑 {{__('delete')}}
    </button>
</aside>
