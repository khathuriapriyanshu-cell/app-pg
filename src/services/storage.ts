import {
  PG, Floor, Room, Bed, Tenant, RentRecord, Payment, Receipt, NotificationItem, PGSettings, DashboardMetrics
} from '@/types';
import {
  initialPG, initialPGs, initialFloors, initialRooms, initialBeds, initialTenants,
  initialRentRecords, initialPayments, initialReceipts, initialNotifications, initialSettings
} from './mockData';

const STORAGE_KEYS = {
  PGS: 'pg_autopilot_pgs_list',
  ACTIVE_PG_ID: 'pg_autopilot_active_pg_id',
  FLOORS: 'pg_autopilot_floors',
  ROOMS: 'pg_autopilot_rooms',
  BEDS: 'pg_autopilot_beds',
  TENANTS: 'pg_autopilot_tenants',
  RENT_RECORDS: 'pg_autopilot_rent_records',
  PAYMENTS: 'pg_autopilot_payments',
  RECEIPTS: 'pg_autopilot_receipts',
  NOTIFICATIONS: 'pg_autopilot_notifications',
  SETTINGS: 'pg_autopilot_settings',
};

class DataStore {
  private pgs: PG[] = initialPGs;
  private activePgId: string = 'pg-1';
  private floors: Floor[] = initialFloors;
  private rooms: Room[] = initialRooms;
  private beds: Bed[] = initialBeds;
  private tenants: Tenant[] = initialTenants;
  private rentRecords: RentRecord[] = initialRentRecords;
  private payments: Payment[] = initialPayments;
  private receipts: Receipt[] = initialReceipts;
  private notifications: NotificationItem[] = initialNotifications;
  private settings: PGSettings = initialSettings;

  private listeners: Set<() => void> = new Set();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      this.isInitialized = true;
    }
  }

  private loadFromStorage() {
    try {
      const get = <T>(key: string, fallback: T): T => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      };

      this.pgs = get(STORAGE_KEYS.PGS, initialPGs);
      this.activePgId = get(STORAGE_KEYS.ACTIVE_PG_ID, 'pg-1');
      this.floors = get(STORAGE_KEYS.FLOORS, initialFloors);
      this.rooms = get(STORAGE_KEYS.ROOMS, initialRooms);
      this.beds = get(STORAGE_KEYS.BEDS, initialBeds);
      this.tenants = get(STORAGE_KEYS.TENANTS, initialTenants);
      this.rentRecords = get(STORAGE_KEYS.RENT_RECORDS, initialRentRecords);
      this.payments = get(STORAGE_KEYS.PAYMENTS, initialPayments);
      this.receipts = get(STORAGE_KEYS.RECEIPTS, initialReceipts);
      this.notifications = get(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
      this.settings = get(STORAGE_KEYS.SETTINGS, initialSettings);
    } catch (e) {
      console.error('Failed to load from storage, using initial mock data', e);
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PGS, JSON.stringify(this.pgs));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PG_ID, JSON.stringify(this.activePgId));
      localStorage.setItem(STORAGE_KEYS.FLOORS, JSON.stringify(this.floors));
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(this.rooms));
      localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(this.beds));
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(this.tenants));
      localStorage.setItem(STORAGE_KEYS.RENT_RECORDS, JSON.stringify(this.rentRecords));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(this.payments));
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(this.receipts));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to persist to storage', e);
    }
  }

  private notify() {
    this.persist();
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Listener callback error', err);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // PG Management
  public getPGs(): PG[] { return this.pgs; }
  
  public getActivePgId(): string { return this.activePgId; }

  public getActivePG(): PG {
    if (this.activePgId === 'all') {
      return {
        id: 'all',
        ownerId: 'owner-1',
        name: 'All PGs (Combined View)',
        address: 'Consolidated across all PG properties',
        contactPhone: '+91 98765 43210',
        numberOfRooms: this.rooms.length,
        totalBeds: this.beds.length,
        createdAt: '2026-01-01T00:00:00Z',
      };
    }
    return this.pgs.find((p) => p.id === this.activePgId) || this.pgs[0] || initialPG;
  }

  public getPG(): PG {
    return this.getActivePG();
  }

  public getPGById(id: string): PG | undefined {
    return this.pgs.find((p) => p.id === id);
  }

  public setActivePG(pgId: string) {
    this.activePgId = pgId;
    this.notify();
  }

  // Action: Add a new PG with automated floors, rooms, and beds
  public addPG(params: {
    name: string;
    address: string;
    numberOfFloors?: number;
    roomsPerFloor?: number;
    bedsPerRoom?: number;
    contactPhone?: string;
    upiId?: string;
  }): { success: boolean; pg?: PG; error?: string } {
    if (!params.name.trim()) return { success: false, error: 'Please enter PG name' };

    const newPgId = `pg-${Date.now()}`;
    const numFloors = Math.max(1, params.numberOfFloors || 2);
    const roomsPerFloor = Math.max(1, params.roomsPerFloor || 3);
    const bedsPerRoom = Math.max(1, params.bedsPerRoom || 2);
    const totalRooms = numFloors * roomsPerFloor;
    const totalBeds = totalRooms * bedsPerRoom;

    const newPG: PG = {
      id: newPgId,
      ownerId: 'owner-1',
      name: params.name.trim(),
      address: params.address.trim() || 'Bengaluru, Karnataka',
      upiId: params.upiId?.trim() || `${params.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`,
      contactPhone: params.contactPhone?.trim() || '+91 98765 43210',
      numberOfRooms: totalRooms,
      totalBeds: totalBeds,
      createdAt: new Date().toISOString(),
    };

    // Auto-create floors, rooms, beds
    const newFloors: Floor[] = [];
    const newRooms: Room[] = [];
    const newBeds: Bed[] = [];

    const bedLetters = ['A', 'B', 'C', 'D', 'E'];

    for (let f = 1; f <= numFloors; f++) {
      const floorId = `floor-${newPgId}-${f}`;
      newFloors.push({
        id: floorId,
        pgId: newPgId,
        floorNumber: f,
        name: `Floor ${f}`,
      });

      for (let r = 1; r <= roomsPerFloor; r++) {
        const roomNum = `${f}0${r}`;
        const roomId = `room-${newPgId}-${roomNum}`;
        newRooms.push({
          id: roomId,
          pgId: newPgId,
          floorId: floorId,
          roomNumber: roomNum,
          capacity: bedsPerRoom,
          type: r % 2 === 1 ? 'AC' : 'Non-AC',
          status: 'ACTIVE',
        });

        for (let b = 0; b < bedsPerRoom; b++) {
          newBeds.push({
            id: `bed-${roomId}-${bedLetters[b] || b + 1}`,
            roomId: roomId,
            bedNumber: bedLetters[b] || String(b + 1),
            status: 'VACANT',
          });
        }
      }
    }

    this.pgs = [...this.pgs, newPG];
    this.floors = [...this.floors, ...newFloors];
    this.rooms = [...this.rooms, ...newRooms];
    this.beds = [...this.beds, ...newBeds];
    this.activePgId = newPgId; // switch to newly created PG

    this.notify();
    return { success: true, pg: newPG };
  }

  // Getters scoped by PG
  public getFloors(pgId?: string): Floor[] {
    const target = pgId || (this.activePgId !== 'all' ? this.activePgId : null);
    return target ? this.floors.filter((f) => f.pgId === target) : this.floors;
  }

  public getRooms(pgId?: string): Room[] {
    const target = pgId || (this.activePgId !== 'all' ? this.activePgId : null);
    return target ? this.rooms.filter((r) => r.pgId === target) : this.rooms;
  }

  public getBeds(pgId?: string): Bed[] {
    const target = pgId || (this.activePgId !== 'all' ? this.activePgId : null);
    if (!target) return this.beds;
    const roomIds = new Set(this.rooms.filter((r) => r.pgId === target).map((r) => r.id));
    return this.beds.filter((b) => roomIds.has(b.roomId));
  }

  public getTenants(pgId?: string): Tenant[] {
    const target = pgId || (this.activePgId !== 'all' ? this.activePgId : null);
    return target ? this.tenants.filter((t) => t.pgId === target) : this.tenants;
  }

  public getAllTenants(): Tenant[] {
    return this.tenants;
  }

  public getRentRecords(pgId?: string): RentRecord[] {
    const target = pgId || (this.activePgId !== 'all' ? this.activePgId : null);
    return target ? this.rentRecords.filter((r) => r.pgId === target) : this.rentRecords;
  }

  public getPayments(pgId?: string): Payment[] {
    const target = pgId || (this.activePgId !== 'all' ? this.activePgId : null);
    return target ? this.payments.filter((p) => p.pgId === target) : this.payments;
  }

  public getReceipts(pgId?: string): Receipt[] {
    const target = pgId || (this.activePgId !== 'all' ? this.activePgId : null);
    if (!target) return this.receipts;
    const tenantIds = new Set(this.tenants.filter((t) => t.pgId === target).map((t) => t.id));
    return this.receipts.filter((r) => tenantIds.has(r.tenantId));
  }

  public getNotifications(): NotificationItem[] { return this.notifications; }
  public getSettings(): PGSettings { return this.settings; }

  public getTenantById(id: string): Tenant | undefined {
    return this.tenants.find((t) => t.id === id);
  }

  public getRentRecordById(id: string): RentRecord | undefined {
    return this.rentRecords.find((r) => r.id === id);
  }

  public getTenantCurrentRent(tenantId: string): RentRecord | undefined {
    return this.rentRecords.find((r) => r.tenantId === tenantId && r.yearMonth === '2026-10');
  }

  public getRoomById(id: string): Room | undefined {
    return this.rooms.find((r) => r.id === id);
  }

  public getBedById(id: string): Bed | undefined {
    return this.beds.find((b) => b.id === id);
  }

  // Metrics calculation according to Section 44
  public getMetrics(pgId?: string): DashboardMetrics {
    const targetPg = pgId || (this.activePgId !== 'all' ? this.activePgId : null);
    const applicableRentRecords = targetPg
      ? this.rentRecords.filter((r) => r.pgId === targetPg && r.yearMonth === '2026-10')
      : this.rentRecords.filter((r) => r.yearMonth === '2026-10');
    
    let expectedRent = 0;
    let collectedRent = 0;
    let pendingRent = 0;
    let overdueRent = 0;

    let paidCount = 0;
    let dueSoonCount = 0;
    let overdueCount = 0;

    applicableRentRecords.forEach((record) => {
      expectedRent += record.amount;
      if (record.status === 'PAID') {
        collectedRent += record.amount;
        paidCount++;
      } else if (record.status === 'OVERDUE') {
        overdueRent += record.amount;
        overdueCount++;
      } else {
        pendingRent += record.amount;
        dueSoonCount++;
      }
    });

    const applicableBeds = this.getBeds(targetPg || undefined);
    const vacantBedsCount = applicableBeds.filter((b) => b.status === 'VACANT').length;
    const totalBedsCount = applicableBeds.length;
    const collectionRate = expectedRent > 0 ? Math.round((collectedRent / expectedRent) * 100) : 0;

    return {
      expectedRent,
      collectedRent,
      pendingRent,
      overdueRent,
      collectionRate,
      paidCount,
      dueSoonCount,
      overdueCount,
      vacantBedsCount,
      totalBedsCount,
    };
  }

  // Action: Send Reminder (Idempotent, duplicate check)
  public sendReminder(tenantId: string, rentRecordId: string, customChannel: 'WHATSAPP' | 'SMS' = 'WHATSAPP'): { success: boolean; message: string; notif?: NotificationItem } {
    const tenant = this.getTenantById(tenantId);
    const rent = this.getRentRecordById(rentRecordId);

    if (!tenant || !rent) {
      return { success: false, message: 'Tenant or rent record not found' };
    }

    if (rent.status === 'PAID') {
      return { success: false, message: 'Rent is already paid. No reminder needed!' };
    }

    // Duplicate check: avoid sending duplicate reminders within the same hour
    const now = new Date();
    const existingRecent = this.notifications.find(
      (n) => n.tenantId === tenantId && n.status === 'SENT' && (now.getTime() - new Date(n.sentDate || 0).getTime() < 3600000)
    );

    if (existingRecent) {
      return {
        success: false,
        message: `A reminder was already sent to ${tenant.name} recently. Duplicate prevented!`,
      };
    }

    let msg = '';
    const paymentLink = `https://sharmapg.com/pay/${rent.id}`;

    if (rent.status === 'OVERDUE') {
      msg = `Hi ${tenant.name}, your rent of ₹${rent.amount.toLocaleString('en-IN')} for ${rent.month} is overdue by ${rent.daysOverdue} day(s). Please make the payment immediately via: ${paymentLink} - Sharma PG`;
    } else {
      msg = `Hi ${tenant.name}, your rent of ₹${rent.amount.toLocaleString('en-IN')} for ${rent.month} is due on ${rent.dueDate}. Pay conveniently here: ${paymentLink} - Thank you, Sharma PG`;
    }

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      phone: tenant.phone,
      type: rent.status === 'OVERDUE' ? 'REMINDER_OVERDUE_1D' : 'REMINDER_BEFORE_1D',
      channel: customChannel,
      message: msg,
      scheduledDate: now.toISOString(),
      sentDate: now.toISOString(),
      status: 'SENT',
      paymentLink,
    };

    this.notifications = [newNotif, ...this.notifications];
    this.notify();
    return { success: true, message: `Reminder sent to ${tenant.name} via ${customChannel}`, notif: newNotif };
  }

  // Action: Record Verified Payment
  public recordVerifiedPayment(
    rentRecordId: string,
    paymentMethod: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'CASH' = 'UPI',
    customTxnId?: string
  ): { success: boolean; receipt?: Receipt; error?: string } {
    const rent = this.rentRecords.find((r) => r.id === rentRecordId);
    if (!rent) return { success: false, error: 'Rent record not found' };

    if (rent.status === 'PAID') {
      return { success: false, error: 'Rent record is already marked as PAID' };
    }

    const tenant = this.getTenantById(rent.tenantId);
    if (!tenant) return { success: false, error: 'Tenant not found' };

    const paymentId = `pay-${Date.now()}`;
    const txnId = customTxnId || `TXN-${paymentMethod}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const nowIso = new Date().toISOString();

    const payment: Payment = {
      id: paymentId,
      pgId: rent.pgId,
      tenantId: tenant.id,
      rentRecordId: rent.id,
      amount: rent.amount,
      paymentDate: nowIso,
      transactionId: txnId,
      paymentMethod,
      providerReference: `prov_${Math.random().toString(36).substring(7)}`,
      status: 'SUCCESS',
    };

    const receiptNum = `SHR-${rent.yearMonth.replace('-', '')}-${(this.receipts.length + 1).toString().padStart(3, '0')}`;
    const receipt: Receipt = {
      id: `rec-${Date.now()}`,
      receiptNumber: receiptNum,
      paymentId: payment.id,
      tenantId: tenant.id,
      rentRecordId: rent.id,
      amount: rent.amount,
      month: rent.month,
      generatedAt: nowIso,
    };

    // Update RentRecord
    rent.status = 'PAID';
    rent.daysOverdue = 0;
    rent.paymentId = payment.id;

    // Update Bed status
    const bed = this.beds.find((b) => b.id === tenant.bedId);
    if (bed) {
      bed.status = 'OCCUPIED_PAID';
    }

    this.payments = [payment, ...this.payments];
    this.receipts = [receipt, ...this.receipts];

    // Auto confirmation notification
    const autoNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      phone: tenant.phone,
      type: 'PAYMENT_RECEIVED',
      channel: 'WHATSAPP',
      message: `Hi ${tenant.name}, verified payment of ₹${rent.amount.toLocaleString('en-IN')} received. Digital receipt #${receiptNum} generated. Thank you! - Sharma PG`,
      scheduledDate: nowIso,
      sentDate: nowIso,
      status: 'SENT',
    };
    this.notifications = [autoNotif, ...this.notifications];

    this.notify();
    return { success: true, receipt };
  }

  // Action: Add Student / Tenant (with auto-bed allocation and instant rent generation)
  public addTenant(params: {
    name: string;
    monthlyRent: number;
    pgId?: string;
    roomId?: string;
    bedId?: string;
    phone?: string;
    securityDeposit?: number;
    dueDateDay?: number;
    joiningDate?: string;
    email?: string;
    emergencyContact?: string;
    notes?: string;
  }): { success: boolean; tenant?: Tenant; error?: string } {
    if (!params.name.trim()) return { success: false, error: 'Please enter student/tenant name' };
    if (!params.monthlyRent || params.monthlyRent <= 0) return { success: false, error: 'Please enter a valid monthly rent amount' };

    const targetPgId = params.pgId || (this.activePgId !== 'all' ? this.activePgId : this.pgs[0]?.id || 'pg-1');

    // Find or assign bed
    let assignedBedId = params.bedId;
    let assignedRoomId = params.roomId;

    if (!assignedBedId) {
      // Find first vacant bed in target PG
      const pgRooms = this.rooms.filter((r) => r.pgId === targetPgId);
      const pgRoomIds = new Set(pgRooms.map((r) => r.id));
      const vacantBed = this.beds.find((b) => pgRoomIds.has(b.roomId) && b.status === 'VACANT');

      if (vacantBed) {
        assignedBedId = vacantBed.id;
        assignedRoomId = vacantBed.roomId;
      } else {
        // If all beds are occupied, auto-create a room so owner is never blocked!
        const existingPgRooms = pgRooms.length;
        const newRoomNum = `${existingPgRooms + 1}01`;
        const floor = this.floors.find((f) => f.pgId === targetPgId) || this.floors[0];
        const newRoomRes = this.addRoom({
          floorId: floor.id,
          roomNumber: newRoomNum,
          capacity: 2,
          type: 'AC',
        });
        if (newRoomRes.success && newRoomRes.room) {
          const createdBeds = this.beds.filter((b) => b.roomId === newRoomRes.room!.id);
          assignedBedId = createdBeds[0].id;
          assignedRoomId = newRoomRes.room.id;
        } else {
          return { success: false, error: 'No vacant bed available and could not auto-create room' };
        }
      }
    }

    const bed = this.beds.find((b) => b.id === assignedBedId);
    if (!bed) return { success: false, error: 'Selected bed does not exist' };
    
    // Ensure room id is set
    if (!assignedRoomId) assignedRoomId = bed.roomId;

    const tenantId = `tenant-${Date.now()}`;
    const phone = params.phone?.trim() || `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`;
    const dueDay = params.dueDateDay || 5;

    const newTenant: Tenant = {
      id: tenantId,
      pgId: targetPgId,
      name: params.name.trim(),
      phone: phone,
      email: params.email?.trim() || undefined,
      roomId: assignedRoomId,
      bedId: assignedBedId,
      monthlyRent: Number(params.monthlyRent),
      securityDeposit: Number(params.securityDeposit) || Number(params.monthlyRent),
      depositStatus: 'HELD',
      joiningDate: params.joiningDate || new Date().toISOString().split('T')[0],
      dueDateDay: dueDay,
      status: 'ACTIVE',
      emergencyContact: params.emergencyContact?.trim() || undefined,
      notes: params.notes?.trim() || undefined,
    };

    // Update Bed status
    bed.tenantId = tenantId;
    bed.status = 'OCCUPIED_DUE_SOON';

    // Auto generate October rent record
    const formattedDueDay = String(dueDay).padStart(2, '0');
    const newRent: RentRecord = {
      id: `rent-${tenantId}-oct`,
      pgId: targetPgId,
      tenantId,
      month: 'October 2026',
      yearMonth: '2026-10',
      amount: Number(params.monthlyRent),
      dueDate: `2026-10-${formattedDueDay}`,
      status: 'PENDING',
      daysOverdue: 0,
      createdAt: new Date().toISOString(),
    };

    this.tenants = [newTenant, ...this.tenants];
    this.rentRecords = [newRent, ...this.rentRecords];

    this.notify();
    return { success: true, tenant: newTenant };
  }

  // Action: Update Student / Tenant Details and Monthly Rent
  public updateTenant(
    tenantId: string,
    updates: Partial<Tenant>
  ): { success: boolean; tenant?: Tenant; error?: string } {
    const tenant = this.tenants.find((t) => t.id === tenantId);
    if (!tenant) return { success: false, error: 'Student/Tenant not found' };

    const oldRent = tenant.monthlyRent;
    Object.assign(tenant, updates);

    // If monthly rent was updated, synchronize unpaid current month rent record
    if (updates.monthlyRent !== undefined && updates.monthlyRent !== oldRent) {
      const currentRent = this.getTenantCurrentRent(tenantId);
      if (currentRent && currentRent.status !== 'PAID') {
        currentRent.amount = updates.monthlyRent;
      }
    }

    this.notify();
    return { success: true, tenant };
  }

  // Action: Add Room
  public addRoom(params: {
    floorId: string;
    roomNumber: string;
    capacity: number;
    type: 'AC' | 'Non-AC';
  }): { success: boolean; room?: Room; error?: string } {
    const floor = this.floors.find((f) => f.id === params.floorId);
    const targetPgId = floor?.pgId || (this.activePgId !== 'all' ? this.activePgId : this.pgs[0]?.id || 'pg-1');

    const existing = this.rooms.find((r) => r.pgId === targetPgId && r.roomNumber === params.roomNumber);
    if (existing) return { success: false, error: `Room ${params.roomNumber} already exists in this PG` };

    const roomId = `room-${Date.now()}`;
    const newRoom: Room = {
      id: roomId,
      pgId: targetPgId,
      floorId: params.floorId,
      roomNumber: params.roomNumber,
      capacity: params.capacity,
      type: params.type,
      status: 'ACTIVE',
    };

    // Generate beds
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const newBeds: Bed[] = [];
    for (let i = 0; i < params.capacity; i++) {
      newBeds.push({
        id: `bed-${roomId}-${letters[i] || i + 1}`,
        roomId: roomId,
        bedNumber: letters[i] || String(i + 1),
        status: 'VACANT',
      });
    }

    this.rooms = [...this.rooms, newRoom];
    this.beds = [...this.beds, ...newBeds];

    const pg = this.pgs.find((p) => p.id === targetPgId);
    if (pg) {
      pg.numberOfRooms = this.rooms.filter((r) => r.pgId === targetPgId).length;
      const pgRoomIds = new Set(this.rooms.filter((r) => r.pgId === targetPgId).map((r) => r.id));
      pg.totalBeds = this.beds.filter((b) => pgRoomIds.has(b.roomId)).length;
    }

    this.notify();
    return { success: true, room: newRoom };
  }

  public updateSettings(newSettings: Partial<PGSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.notify();
  }

  public resetToDefaults() {
    this.pgs = initialPGs;
    this.activePgId = 'pg-1';
    this.floors = initialFloors;
    this.rooms = initialRooms;
    this.beds = initialBeds;
    this.tenants = initialTenants;
    this.rentRecords = initialRentRecords;
    this.payments = initialPayments;
    this.receipts = initialReceipts;
    this.notifications = initialNotifications;
    this.settings = initialSettings;
    this.notify();
  }
}

export const store = new DataStore();
