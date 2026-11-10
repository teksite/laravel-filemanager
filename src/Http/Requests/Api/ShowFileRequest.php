<?php

namespace Teksite\FileManager\Http\Requests\Api;

use Teksite\FileManager\Http\Requests\BaseApiRequest;

class ShowFileRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [];
    }

    protected function failureMessage(): string
    {
        return __('Failed to show  the file.');
    }
}
