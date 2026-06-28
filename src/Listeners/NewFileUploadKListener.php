<?php

namespace Teksite\FileManager\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Teksite\FileManager\Events\NewFileUploadEvent;

class NewFileUploadKListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(NewFileUploadEvent $event): void
    {
        //
    }
}
