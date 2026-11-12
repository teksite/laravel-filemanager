<?php

namespace Teksite\FileManager\Http\Requests\Api;

use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Teksite\FileManager\Enums\MediaType;
use Teksite\FileManager\Http\Requests\BaseApiRequest;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Services\FileQuery;
use Teksite\FileManager\Services\StorageService;

class IndexFilesRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return $this->canUser('browse');
    }

    public function rules(): array
    {
        $sorts = collect(FileQuery::SORTABLE)->flatMap(fn($c) => [$c, "-{$c}"])->all();

        return [
            'disk'      => ['nullable', 'string', Rule::in(app(StorageService::class)->browseDisks())],
            'type'      => ['nullable', 'string', 'max:100', function ($attribute, $value, $fail) {
                if (MediaType::patternsFor($value) === []) {
                    $fail(__('The selected type is invalid.'));
                }
            }],
            'search'    => ['nullable', 'string', 'max:100'],
            'folder_id' => ['nullable', 'string', 'max:26'],
            'trashed'   => ['nullable', Rule::in(['only', 'with'])],
            'sort'      => ['nullable', Rule::in($sorts)],
            'mode'      => ['nullable', Rule::in(['cursor', 'pagination'])],
            'per_page'  => ['nullable', 'integer', 'min:1', 'max:'.(int)config('filemanager.max_per_page', 100)],
            'cursor'    => ['nullable', 'string', 'max:500'],
        ];
    }

    /** Filters for the query layer; the key "folder_id" is only present when the client sent it. */
    public function filters(): array
    {
        $filters = $this->validated();

        if (!$this->has('folder_id')) unset($filters['folder_id']);

        return $filters;
    }

    protected function failureMessage(): string
    {
        return __('Failed to load the files.');
    }
}
