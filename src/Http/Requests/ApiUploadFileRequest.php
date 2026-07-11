<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use function Aws\map;

class ApiUploadFileRequest  extends BaseApiRequest
{

    protected function prepareForValidation(): void
    {
        $this->merge([
            'overwrite' => filter_var($this->overwrite, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            'slugify'   => filter_var($this->slugify, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        ]);
    }

    public function rules(): array
    {
        $disks =config('filemanager.allow_upload_disks') ?? (array)config('filemanager.default_store_disk');

        return [
            'user_id' => 'nullable|exists:users,id',

            'file'  => ['required', 'file',],
            'disk'  => ['nullable', 'string', Rule::in($disks)],
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

        $minSize = config('filemanager.min_file_size', null);
        if ($minSize !== null && $sizeKB < $minSize) {
            $validator->errors()->add('file', trans('min allowed file size is :size KB', ['size' => $minSize]));
            return;
        }

        $maxSize = config('filemanager.max_file_size', null);
        if ($maxSize !== null && $sizeKB > $maxSize) {
            $validator->errors()->add('file', trans('max allowed file size is :size KB', ['size' => $maxSize]));
            return;
        }

    }

    protected function checkAllowedMimeTypes(Validator $validator): void
    {
        if ($validator->errors()->isNotEmpty()) return;

        $allowedTypes = config('filemanager.allow_upload_types', []) ?? [];

//        $allowedTypes=array_map('strtolower', $allowedTypes);

        if (count($allowedTypes) === 0) return;
        $file = $this->file('file');

        $mime = $file->getMimeType();
        $ext = strtolower($file->extension());

        $isValid = in_array($mime, $allowedTypes) || in_array($ext, $allowedTypes);
        if (!$isValid) {
            $validator->errors()->add("file", trans("This file type ( :attribute ) is not allowed.", ['attribute' => "$mime|$ext"]));
            return;
        }

    }

    protected function checkForbiddenMimeTypes(Validator $validator): void
    {
        if ($validator->errors()->isNotEmpty()) return;
        $forbiddenTypes = config('filemanager.forbidden_file_types', []);

        if (count($forbiddenTypes) === 0) return;

        $file = $this->file('file');

        $mime = $file->getMimeType();
        $ext = strtolower($file->extension());

        $isForbidden = in_array($mime, $forbiddenTypes) || in_array($ext, $forbiddenTypes);

        if ($isForbidden) {
            $validator->errors()->add("file", trans("This file type ( :attribute ) is forbidden.", ['attribute' => "$mime|$ext"]));
            return;

        }
    }

    protected function generalFailedValidationMessages(): string
    {
        return trans('failed to upload the file');
    }

    protected function setAction(): string
    {
       return 'upload';
    }
}
