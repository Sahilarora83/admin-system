<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    protected $guarded = [];

    protected $casts = [
        'line_items' => 'array',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
    public function courier()
    {
        return $this->belongsTo(Courier::class);
    }
    public function pincode()
    {
        return $this->belongsTo(Pincode::class);
    }
    public function events()
    {
        return $this->hasMany(ShipmentEvent::class);
    }
    public function shipment()
    {
        return $this->hasOne(Shipment::class);
    }
}
