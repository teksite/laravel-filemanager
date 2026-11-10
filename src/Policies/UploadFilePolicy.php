<?php

namespace Teksite\FileManager\Policies;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;

/**
 * Default authorization rules (also used for folders).
 *
 * - Guests can never do anything.
 * - With `scope_to_owner` users only touch their own records.
 * - A user holding the configured `admin_ability` can touch everything.
 *
 * Extend this class and register it in `filemanager.authorization.policy` to
 * customize the rules, e.g. role based access.
 */
class UploadFilePolicy
{
    public function browse(?Authenticatable $user): bool
    {
        return $user !== null;
    }

    public function upload(?Authenticatable $user): bool
    {
        return $user !== null;
    }

    public function view(?Authenticatable $user, Model $model): bool
    {
        return $this->manages($user, $model);
    }

    public function update(?Authenticatable $user, Model $model): bool
    {
        return $this->manages($user, $model);
    }

    public function delete(?Authenticatable $user, Model $model): bool
    {
        return $this->manages($user, $model);
    }

    public function restore(?Authenticatable $user, Model $model): bool
    {
        return $this->manages($user, $model);
    }

    public function forceDelete(?Authenticatable $user, Model $model): bool
    {
        return $this->manages($user, $model);
    }

    protected function manages(?Authenticatable $user, Model $model): bool
    {
        if ($user === null) return false;

        if (!config('filemanager.authorization.scope_to_owner', true)) return true;


        if ($this->isAdmin($user)) return true;


        return $model->getAttribute('user_id') !== null && (string)$model->getAttribute('user_id') === (string)$user->getAuthIdentifier();
    }

    protected function isAdmin(Authenticatable $user): bool
    {
        $ability = config('filemanager.authorization.admin_ability');

        return $ability !== null && Gate::forUser($user)->allows($ability);
    }
}
