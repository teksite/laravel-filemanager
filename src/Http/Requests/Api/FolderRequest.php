<?php

namespace Teksite\FileManager\Http\Requests\Api;

use Illuminate\Support\Facades\Gate;
use Teksite\FileManager\Http\Requests\BaseApiRequest;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Models\UploadFolder;

class FolderRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return $this->canUser('upload' ,UploadFolder::class);
    }

    public function rules(): array
    {
        $creating = $this->isMethod('POST');

        return [
            'name'      => [$creating ? 'required' : 'sometimes', 'string', 'min:1', 'max:100'],
            'parent_id' => ['sometimes', 'nullable', 'string', 'size:26', 'exists:uploaded_folders,id'],
        ];
    }

    protected function failureMessage(): string
    {
        return __('Failed to save the folder.');
    }
}
