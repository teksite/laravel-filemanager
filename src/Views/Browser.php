<?php

namespace Teksite\FileManager\Views;


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
        dd('dddddddddddd');
        return view('filemanager::browser');
    }
}
