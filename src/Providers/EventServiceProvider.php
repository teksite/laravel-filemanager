<?php

namespace Teksite\FileManager\Providers;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Teksite\FileManager\Events\NewFileUploadEvent;
use Teksite\FileManager\Listeners\NewFileUploadListener;

class EventServiceProvider  extends ServiceProvider
{
    /**
     * The event handler mappings for the application.
     *
     * @var array<string, array<int, string>>
     */
    protected $listen = [
        NewFileUploadEvent::class => [
            NewFileUploadListener::class
        ]
    ];


    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
