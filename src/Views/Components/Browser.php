<?php

namespace Teksite\FileManager\Views\Components;


use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Browser extends Component
{
    /**
     * Create a new component instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View
    {
        $disks = config('filemanager.disk_list', []);
        $mimes = config('filemanager.type_list', []);

        $allowedDisks = config('filemanager.allow_upload_disks', []);
        $allowedTypes = config('filemanager.allow_upload_types', []);

        $perPage= config('filemanager.per_page' , 25);

        return view('filemanager::browser', compact('disks', 'mimes' ,'allowedDisks' ,'allowedTypes' ,'perPage'));

    }

}
