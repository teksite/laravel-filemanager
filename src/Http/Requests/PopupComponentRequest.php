<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Teksite\FileManager\Support\AuthorizeRequestResolver;

class PopupComponentRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'config' => 'required|array',
            'config.*' => 'required|array',

            'config.selection' => 'required|array',
            'config.selection.mode' => 'required|string',
            'config.selection.expect' => 'required|string',

            'config.load' => 'required|array',
            'config.load.types' => 'required|array',
            'config.load.disks' => 'required|array',


            'id'=>'required|string'
        ];
    }


    protected function generalFailedValidationMessages(): string
    {
        return trans('failed to get browser');
    }

    protected function setAction(): string
    {
        return 'get_browser';
    }

    public function after()
    {
        return [
            fn(Validator $validator) => fn() => $this->checkType($validator),
            fn(Validator $validator) => fn() => $this->checkDisk($validator),
        ];
    }


    private function checkDisk(Validator $validator)
    {
        if ($validator->errors()->isNotEmpty()) return;

        $listDisks = config('filemanager.type_list', []);
        $requestedDisk = $this->input('disk', null);

        if (count($listDisks) === 0 || $requestedDisk === null) {
            return;
        }
        if (!in_array($requestedDisk, $listDisks)) {
            $validator->errors()->add('disk', 'the disk is not allowed or not verified');

        }

    }

    private function checkType(Validator $validator)
    {
        if ($validator->errors()->isNotEmpty()) return;

        $listTypes = config('filemanager.disk_list', []);
        $requestedType = $this->input('mime_type', null);

        if (count($listTypes) === 0 || $requestedType === null) {
            return;
        }
        if (!in_array($requestedType, $listTypes)) {
            $validator->errors()->add('mime_type', 'the type/mime_type is not allowed or not verified');

        }
    }


}
