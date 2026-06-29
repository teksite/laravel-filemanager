<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ApiUploadFileRequest extends FormRequest
{
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
            'path'  => ['nullable', 'string'],

            'strategy'  => ['nullable', 'string', Rule::in(array_keys(config('filemanager.naming_strategy', [])))],
            'overwrite' => ['sometimes', 'boolean'],
            'slugify'   => ['sometimes', 'boolean'],
            'length'    => ['nullable', 'integer', 'min:1', 'max:64'],
        ];
    }


    public function failedValidation(Validator $validator)
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
}
