<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\Request;
use Teksite\FileManager\Http\Requests\FileIndexRequest;
use Teksite\FileManager\Http\Requests\ShowRequest;
use Teksite\FileManager\Http\Resources\FileCollection;
use Teksite\FileManager\Http\Resources\FileResource;
use Teksite\FileManager\Http\Resources\PaginateFileCollection;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Services\GetFileService;

class MediaViewController
{
    public function browser(FileIndexRequest $request)
    {
        $disks = $this->chosenDisks();
        $mimes = $this->chosenMimes();

        return view('filemanager::browser', compact('disks', 'mimes'));
    }

    private function chosenDisks(): array
    {
        $selectedDisks = config('filemanager.disk_list', ['*']);
        $systemDisks = array_keys(config('filesystems.disks', []));

        return in_array('*', (array)$selectedDisks)
            ? [null, ...$systemDisks]
            : array_intersect($selectedDisks, $systemDisks);
    }

    private function chosenMimes(): array
    {
        $selectedMimes = config('filemanager.type_list', ['*']);
        $systemMimes = [
            'image', 'video', 'audio', 'document', 'archive', 'link', 'file', 'text',
        ];

        return $selectedMimes;
    }
}
