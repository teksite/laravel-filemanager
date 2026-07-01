<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Teksite\FileManager\Support\AuthorizeRequestResolver;

abstract class BaseApiRequest extends FormRequest
{

    public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        $exception = $validator->getException();
        $exc = (new $exception($validator))->errorBag($this->errorBag);

        return throw new HttpResponseException(response()->json([
            'message' => $this->generalFailedValidationMessages(),
            'errors'  => $exc->errors(),
            'status'  => 422,
            'data'    => [],
        ])->setStatusCode(422));

    }

    abstract protected function generalFailedValidationMessages() : string;
    abstract protected function setAction() : string;

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
        return AuthorizeRequestResolver::resolve($this->setAction(), $this);
    }
}
