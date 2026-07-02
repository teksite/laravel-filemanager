<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ApiUpdateFileRequest  extends BaseApiRequest
{

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:100',
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
