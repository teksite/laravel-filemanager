<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Teksite\FileManager\Support\AuthorizeRequestResolver;

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
