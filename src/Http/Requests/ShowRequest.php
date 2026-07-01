<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Teksite\FileManager\Support\AuthorizeRequestResolver;

class ShowRequest extends FormRequest
{

    public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        $exception = $validator->getException();
        $exc = (new $exception($validator))->errorBag($this->errorBag);

        return throw new HttpResponseException(response()->json([
            'message' => trans('failed to get the file'),
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



    public function authorize(): bool
    {
        return AuthorizeRequestResolver::resolve('get_all', $this);
    }

    public function rules(): array
    {
        return [

            'disk'  => ['nullable', 'string', Rule::in(array_keys(config('filesystems.disks', [])))],
            'search'    => ['nullable', 'string'],
            'mime_type' => ['nullable', 'string'],
            'per_page'=>['nullable', 'integer', 'min:1', 'max:100'],

            'user_id' => 'nullable|exists:users,id',

        ];
    }


}
