<?php

namespace Teksite\FileManager\Http\Requests\Api;

use Teksite\FileManager\Http\Requests\BaseApiRequest;

class ShowRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [];
    }

    protected function generalFailedValidationMessages(): string
    {
        return trans('failed to get the file');
    }

    protected function setAction(): string
    {
        return 'get_one';
    }

}
