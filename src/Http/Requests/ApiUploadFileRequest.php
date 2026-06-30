<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ApiUploadFileRequest extends FormRequest
{


    public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        $exception = $validator->getException();
        $exc = (new $exception($validator))->errorBag($this->errorBag);

        return throw new HttpResponseException(response()->json([
            'message' => $exc->getMessage(),
            'errors'  => $exc->errors(),
            'status'  => 422,
            'data'    => [],
        ])->setStatusCode(422));

    }


    public function failedAuthorization()
    {
        return throw new HttpResponseException(response()->json([
            'messages' => trans("Forbidden You don't have permission"),
            'errors'   => ['auth' => "Forbidden You don't have permission"],
            'status'   => 403,
            'data'     => [],
        ])->setStatusCode(403));
    }


    protected function prepareForValidation(): void
    {
        $this->merge([
            'overwrite' => filter_var($this->overwrite, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            'slugify'   => filter_var($this->slugify, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        ]);
    }


    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'file'  => ['required', 'file',],
            'disk'  => ['nullable', 'string', Rule::in(array_keys(config('filesystems.disks', [])))],
            'title' => ['nullable', 'string', 'max:255'],
            'path'  => ['nullable', 'string', 'max:190'],

            'strategy'  => ['nullable', 'string', Rule::in(array_keys(config('filemanager.naming_strategy', [])))],
            'overwrite' => ['sometimes', 'boolean'],
            'slugify'   => ['sometimes', 'boolean'],
            'length'    => ['nullable', 'integer', 'min:1', 'max:64'],
        ];
    }

    protected function after(): array
    {
        return [
            fn(Validator $validator) => $this->checkSize($validator),
            fn(Validator $validator) => $this->checkForbiddenMimeTypes($validator),
            fn(Validator $validator) => $this->checkAllowedMimeTypes($validator),
        ];
    }

    protected function checkSize(Validator $validator): void
    {
        if ($validator->errors()->isNotEmpty()) return;

        $file = $this->file('file');
        $sizeKB = $file->getSize() / 1024;

        $minSize = config('filemanager.max_file_size', null);
        if ($minSize !== null && $sizeKB < $minSize) {
            $validator->errors()->add('file', __('min allowed file size is {size}', ['size' => $minSize]));
            return;
        }

        $maxSize = config('filemanager.max_file_size', null);
        if ($maxSize !== null && $sizeKB > $maxSize) {
            $validator->errors()->add('file', __('max allowed file size is {size}', ['size' => $maxSize]));
            return;
        }

    }

    protected function checkAllowedMimeTypes(Validator $validator): void
    {
        if ($validator->errors()->isNotEmpty()) return;
        $allowedTypes = config('filemanager.allowFileTypes', []);

        if (config($allowedTypes) === 0) return;

        $file = $this->file('file');

        $mime = $file->getMimeType();
        $ext = strtolower($file->extension());

        $isValid = in_array($mime, $allowedTypes) || in_array($ext, $allowedTypes);

        if (!$isValid) {
            $validator->errors()->add("file", __("This file type (:attribute) is not allowed.", [':attribute' => "$mime|$ext"]));
            return;
        }

    }

    protected function checkForbiddenMimeTypes(Validator $validator): void
    {
        if ($validator->errors()->isNotEmpty()) return;
        $forbiddenTypes = config('filemanager.forbiddenFileTypes', []);

        if (config($forbiddenTypes) === 0) return;

        $file = $this->file('file');

        $mime = $file->getMimeType();
        $ext = strtolower($file->extension());

        $isForbidden = in_array($mime, $forbiddenTypes) || in_array($ext, $forbiddenTypes);

        if ($isForbidden) {
            $validator->errors()->add("file", __("This file type (:attribute) is not allowed.", [':attribute' => "$mime|$ext"]));
            return;

        }
    }
}
