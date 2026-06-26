<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?User $user = null): array
    {
        return [
            'name' => $this->nameRules(),
            'email' => $this->emailRules($user),
        ];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user emails.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function emailRules(?User $user = null): array
    {
        return [
            'required',
            'string',
            'email',
            'max:255',
            $user === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($user),
        ];
    }
}
