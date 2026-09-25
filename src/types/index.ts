export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export type BedStatus = 'OCCUPIED_PAID' | 'OCCUPIED_DUE_SOON' | 'OCCUPIED_OVERDUE' | 'VACANT';

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface PG {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  upiId?: string;
  contactPhone: string;
  numberOfRooms: number;
  totalBeds: number;
  createdAt: string;
}

export interface Floor {
  id: string;
  pgId: string;
  floorNumber: number;
  name: string;
}

export interface Room {
  id: string;
  pgId: string;
  floorId: string;
  roomNumber: string;
  capacity: number; // total beds
  type: 'AC' | 'Non-AC';
  status: 'ACTIVE' | 'MAINTENANCE';
}

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string; // e.g. "A", "B", "C"
  tenantId?: string; // null if vacant
  status: BedStatus;
}

export interface Tenant {
  id: string;
  pgId: string;
  name: string;
  phone: string;
  email?: string;
  roomId: string;
  bedId: string;
  monthlyRent: number;
  securityDeposit: number;
  depositStatus: 'HELD' | 'REFUNDED' | 'DEDUCTED';
  depositDeductions?: number;
  joiningDate: string; // YYYY-MM-DD
  dueDateDay: number; // e.g. 5 means 5th of every month
  moveOutDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
  emergencyContact?: string;
  notes?: string;
}

export interface RentRecord {
  id: string;
  pgId: string;
  tenantId: string;
  month: string; // e.g. "October 2026"
  yearMonth: string; // e.g. "2026-10"
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  daysOverdue: number; // 0 if not overdue
  paymentId?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  pgId: string;
  tenantId: string;
  rentRecordId: string;
  amount: number;
  paymentDate: string; // ISO
  transactionId: string;
  paymentMethod: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'CASH';
  providerReference: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
}

export interface Receipt {
  id: string;
  receiptNumber: string; // e.g. "REC-202610-001"
  paymentId: string;
  tenantId: string;
  rentRecordId: string;
  amount: number;
  month: string;
  generatedAt: string;
  downloadUrl?: string;
}

export interface NotificationItem {
  id: string;
  tenantId: string;
  tenantName: string;
  phone: string;
  type: 'REMINDER_BEFORE_3D' | 'REMINDER_BEFORE_1D' | 'REMINDER_DUE_TODAY' | 'REMINDER_OVERDUE_1D' | 'REMINDER_OVERDUE_3D' | 'PAYMENT_RECEIVED' | 'CUSTOM';
  channel: 'WHATSAPP' | 'SMS';
  message: string;
  scheduledDate: string;
  sentDate?: string;
  status: 'SENT' | 'SCHEDULED' | 'FAILED';
  paymentLink?: string;
}

export interface ReminderRule {
  id: string;
  key: 'before_3d' | 'before_1d' | 'due_today' | 'after_1d' | 'after_3d';
  title: string;
  description: string;
  enabled: boolean;
  daysOffset: number; // -3, -1, 0, 1, 3
}

export interface PGSettings {
  autoRemindersEnabled: boolean;
  defaultDueDay: number;
  rules: ReminderRule[];
  upiId: string;
  upiName: string;
}

export interface DashboardMetrics {
  expectedRent: number;
  collectedRent: number;
  pendingRent: number;
  overdueRent: number;
  collectionRate: number; // percentage
  paidCount: number;
  dueSoonCount: number;
  overdueCount: number;
  vacantBedsCount: number;
  totalBedsCount: number;
}
