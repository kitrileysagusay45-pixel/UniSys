<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountActivityLog extends Model
{
    protected $fillable = [
        'loggable_id',
        'loggable_type',
        'action',
        'reason',
        'performed_by',
    ];

    public function loggable()
    {
        return $this->morphTo();
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
