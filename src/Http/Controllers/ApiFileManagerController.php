<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\Request;
use Teksite\FileManager\Http\Resources\FileCollection;
use Teksite\FileManager\Http\Resources\FileResource;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Services\SimpleUploaderService;

class ApiFileManagerController
{

    public function index(Request $request)
    {
        $collectionFiles = FileCollection::make(UploadFile::query()->latest()->paginate());
        return response()->json($collectionFiles)->setStatusCode(200);
    }

    public function show(UploadFile $file)
    {
        $file = FileResource::make($file);
        return response()->json($file)->setStatusCode(200);
    }


    public function upload(Request $request)
    {
        $file = SimpleUploaderService::make(DiskType::ARVAN_PUBLIC)->upload($request->file('file'), null, false, null);
        if (!!$file) {
            event(new UploadedNewFileEvent($file));
            return ResponseJson::Success(['file' => FileResource::make($file)], trans('uploader::messages.uploader.upload_success'));
        } else {
            return ResponseJson::Failed(trans('main::messages.global.server_wrong'), trans('uploader::messages.uploader.upload_failed'));
        }
    }

    public function uploadByModel(Request $request)
    {

        if (!!$model && method_exists($model, 'uploader')) {
            $file = SimpleUploaderService::make(DiskType::ARVAN_PRIVATE)->upload($request->file('file'), null, false, null);
            event(new UploadedNewFileEvent($file));

            if (!!$file) {
                $model->uploader()->syncWithPivotValues($file->id, ['name' => 'avatar']);
                return ResponseJson::Success(['file' => FileResource::make($file)], trans('uploader::messages.uploader.upload_success'));
            }
        } else {
            $classModel = !!$model ? get_class($model) : $request->input('model');;
            Log::error("the model {$classModel} doesn't have method 'uploader'");
        }

        return ResponseJson::Failed(trans('uploader::messages.uploader.method_not_exist'), trans('uploader::messages.uploader.upload_failed'));

    }

    public function delete(UploadFile|string|array $file)
    {
        $res = !!$this->uploaderService->remove($file);



        return ResponseJson::Failed(trans('main::messages.global.server_wrong'), trans('uploader::messages.uploader.delete_failed'));
    }
}
