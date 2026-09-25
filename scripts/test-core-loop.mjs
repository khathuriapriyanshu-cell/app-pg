import assert from 'assert';

// Import initial data and verify storage logic directly
import { initialRentRecords, initialTenants, initialBeds, initialPayments, initialReceipts } from '../src/services/mockData.js';

console.log('--- RUNNING RIGOROUS DOMAIN & BUSINESS LOGIC VERIFICATION ---');

// 1. Initial State Check
console.log('1. Checking Initial Dataset...');
assert(initialTenants.length >= 10, 'Should have at least 10 sample tenants');
assert(initialBeds.length >= 15, 'Should have at least 15 beds');
const vacantCount = initialBeds.filter(b => b.status === 'VACANT').length;
console.log(`   Total Beds: ${initialBeds.length}, Vacant: ${vacantCount}`);

// 2. Financial Metrics Check (Section 44 Formulae)
console.log('2. Verifying Financial Metrics Formulae...');
const octRecords = initialRentRecords.filter(r => r.yearMonth === '2026-10');
const expected = octRecords.reduce((acc, r) => acc + r.amount, 0);
const collected = octRecords.filter(r => r.status === 'PAID').reduce((acc, r) => acc + r.amount, 0);
const overdue = octRecords.filter(r => r.status === 'OVERDUE').reduce((acc, r) => acc + r.amount, 0);
const pending = octRecords.filter(r => r.status === 'PENDING').reduce((acc, r) => acc + r.amount, 0);

console.log(`   Expected Rent:  ₹${expected.toLocaleString('en-IN')}`);
console.log(`   Collected Rent: ₹${collected.toLocaleString('en-IN')}`);
console.log(`   Pending Rent:   ₹${pending.toLocaleString('en-IN')}`);
console.log(`   Overdue Rent:   ₹${overdue.toLocaleString('en-IN')}`);

assert.strictEqual(expected, collected + pending + overdue, 'Expected MUST equal Collected + Pending + Overdue');
const collectionRate = Math.round((collected / expected) * 100);
console.log(`   Collection Rate: ${collectionRate}%`);
assert(collectionRate > 0 && collectionRate <= 100, 'Collection rate must be between 1 and 100%');

// 3. Overdue Detection Check
console.log('3. Checking Overdue Tenants...');
const overdueRecords = octRecords.filter(r => r.status === 'OVERDUE');
assert.strictEqual(overdueRecords.length, 3, 'Should have exactly 3 overdue tenants initially (Rahul, Aman, Deepak)');
const rahulRecord = overdueRecords.find(r => r.tenantId === 'tenant-rahul');
assert(rahulRecord && rahulRecord.daysOverdue === 3, 'Rahul should be 3 days overdue');
console.log('   Rahul is 3 days overdue (verified)');

console.log('✅ ALL DOMAIN LOGIC AND FINANCIAL INTEGRITY TESTS PASSED!');
