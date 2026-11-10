<?php

namespace Teksite\FileManager\Views\Components;


use Illuminate\Contracts\View\View;
use Illuminate\View\Component;
use Random\RandomException;
use Teksite\FileManager\Services\StorageService;

class Browser extends Component
{
    public function __construct(public ?string $id = null) {}

    /**
     * Get the view / contents that represent the component.
     *
     * @throws RandomException
     */
    public function render(): View
    {
        $storage = app(StorageService::class);

        return view('filemanager::browser', [
            'id'           => $this->id ?? 'fm-'.bin2hex(random_bytes(4)),
            'disks'        => array_merge([null], $storage->browseDisks()),
            'mimes'        => array_merge([null], (array)config('filemanager.browse_types', [])),
            'allowedDisks' => $storage->uploadDisks(),
            'allowedTypes' => (array)config('filemanager.upload.allowed_types', []),
            'perPage'      => (int)config('filemanager.per_page', 25),
        ]);
    }


}
