<?php

namespace Teksite\FileManager\Http\Controllers\DatabaseFileBrowser;

use Illuminate\Support\Facades\Log;
use Teksite\FileManager\Http\Requests\PopupComponentRequest;

class RenderPopupController
{
    public function browser(PopupComponentRequest $request)
    {

        $id =  $request->validated('id');

        $config =  $request->validated('config');

        $disks =  $request->validated('config.load.disks') ?? $this->resolveListDisks();

        $mimes = $request->validated('config.load.types') ?? $this->resolveListTypes();



        $allowedDisks = $this->allowedDisks();

        $allowedTypes = $this->allowedTypes();

        $perPage= config('filemanager.per_page' , 25);

        return view('filemanager::browser', compact('id' , 'config', 'disks', 'mimes' ,'allowedDisks' ,'allowedTypes' ,'perPage'));
    }

    private function resolveListDisks(): array
    {
        return config('filemanager.disk_list', []);

    }

    private function resolveListTypes(): array
    {
        return config('filemanager.type_list', []);
    }

    private function allowedDisks(): array
    {
        return config('filemanager.allow_upload_disks', []);

    }
    private function allowedTypes(): array
    {
        return config('filemanager.allow_upload_types', []);

    }
}
