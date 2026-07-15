<?php

namespace Teksite\FileManager\Http\Requests\Api;

use Teksite\FileManager\Http\Requests\BaseApiRequest;

class ApiUpdateFileRequest  extends BaseApiRequest
{

    public function rules(): array
    {
        return [
            'title' => 'nullable|string|max:100',
        ];
    }

    protected function setAction(): string
    {
       return 'upload';
    }

    protected function generalFailedValidationMessages(): string
    {
        return trans('failed to update the file');

    }
}
