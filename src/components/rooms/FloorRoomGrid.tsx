'use client';

import React, { useState } from 'react';
import { BedCard } from './BedCard';
import { Bed, Tenant } from '@/types';
import { useDataStore } from '@/services/useStore';
import { Layers, Plus } from 'lucide-react';
import { TenantProfileModal } from '../tenants/TenantProfileModal';
import { AddTenantModal } from '../tenants/AddTenantModal';
import { AddRoomModal } from './AddRoomModal';

export function FloorRoomGrid() {
  const { floors, rooms, beds, pgs, activePgId, setActivePG, getTenantById } = useDataStore();

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  const handleSelectBed = (bed: Bed) => {
    if (bed.tenantId) {
      const tenant = getTenantById(bed.tenantId);
      if (tenant) setSelectedTenant(tenant);
    } else {
      setIsAddTenantOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Switcher Pills Bar */}
      {pgs.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            PG:
          </span>
          <button
            onClick={() => setActivePG('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              activePgId === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All PGs
          </button>
          {pgs.map((property) => (
            <button
              key={property.id}
              onClick={() => setActivePG(property.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activePgId === property.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {property.name.split('(')[0].trim()}
            </button>
          ))}
        </div>
      )}

      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Rooms & Beds
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Visual occupancy layout and rent health map
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">Paid</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-semibold">Due Soon</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-semibold">Overdue</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="font-semibold">Vacant</span>
          </div>
          <button
            onClick={() => setIsAddRoomOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 transition-colors ml-auto sm:ml-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Room
          </button>
        </div>
      </div>

      {/* Floors */}
      {floors.map((floor) => {
        const floorRooms = rooms.filter((r) => r.floorId === floor.id);

        return (
          <div key={floor.id} className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700 border-b border-slate-200 pb-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm sm:text-base">{floor.name}</h3>
              <span className="text-xs text-slate-400">
                ({floorRooms.length} Rooms)
              </span>
            </div>

            {/* Room cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {floorRooms.map((room) => {
                const roomBeds = beds.filter((b) => b.roomId === room.id);
                const vacantBeds = roomBeds.filter((b) => b.status === 'VACANT').length;

                return (
                  <div
                    key={room.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-xs">
                          {room.roomNumber}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">
                            Room {room.roomNumber}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {room.type} · {room.capacity} Beds
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                          vacantBeds > 0
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {vacantBeds === 0 ? 'Full' : `${vacantBeds} Vacant`}
                      </span>
                    </div>

                    {/* Beds Grid for this room */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {roomBeds.map((bed) => (
                        <BedCard
                          key={bed.id}
                          bed={bed}
                          onSelectBed={handleSelectBed}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Modals */}
      <TenantProfileModal
        isOpen={Boolean(selectedTenant)}
        tenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
      />

      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
      />

      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
      />
    </div>
  );
}
