import assert from 'assert';
import { store } from '../src/services/storage.ts';

console.log('========================================================');
console.log('TESTING MULTI-PG MANAGEMENT & STUDENT NAME/RENT CREATION');
console.log('========================================================');

// Test 1: Verify Initial PGs
console.log('\n--- Test 1: Verify Initial Multi-PG Setup ---');
const initialPgs = store.getPGs();
console.log(`Initial PGs Count: ${initialPgs.length}`);
assert(initialPgs.length >= 2, 'Should have at least 2 initial PGs');
console.log(`PG 1: ${initialPgs[0].name} (${initialPgs[0].id})`);
console.log(`PG 2: ${initialPgs[1].name} (${initialPgs[1].id})`);

// Test 2: Add a New PG Property
console.log('\n--- Test 2: Add a New PG Property (Expand Portfolio) ---');
const addPgResult = store.addPG({
  name: 'Apex Student Residency',
  address: 'Koramangala 1st Block, Bengaluru',
  numberOfFloors: 2,
  roomsPerFloor: 2,
  bedsPerRoom: 2,
  contactPhone: '+91 99999 88888',
  upiId: 'apexpg@upi'
});

assert(addPgResult.success && addPgResult.pg, 'Adding PG should succeed');
const newPg = addPgResult.pg;
console.log(`✅ Created PG: "${newPg.name}" (ID: ${newPg.id})`);

const pgsAfterAdd = store.getPGs();
assert.strictEqual(pgsAfterAdd.length, initialPgs.length + 1, 'Total PGs should increment by 1');
console.log(`   Total PGs now: ${pgsAfterAdd.length}`);

// Verify rooms and beds automatically generated for new PG
const newPgRooms = store.getRooms(newPg.id);
const newPgBeds = store.getBeds(newPg.id);
console.log(`   Auto-generated: ${newPgRooms.length} rooms, ${newPgBeds.length} beds`);
assert.strictEqual(newPgRooms.length, 4, 'Should have 2 floors * 2 rooms = 4 rooms');
assert.strictEqual(newPgBeds.length, 8, 'Should have 4 rooms * 2 beds = 8 beds');
assert(newPgBeds.every(b => b.status === 'VACANT'), 'All new beds should initially be VACANT');
console.log('   All 8 beds verified as VACANT.');

// Test 3: Add a Student with Name and Rent
console.log('\n--- Test 3: Add Student with Name & Rent ---');
const studentRent = 9500;
const studentName = 'Abhinav Saxena';

const initialMetrics = store.getMetrics(newPg.id);
console.log(`   Expected Rent before adding student: ₹${initialMetrics.expectedRent}`);

const addStudentRes = store.addTenant({
  name: studentName,
  monthlyRent: studentRent,
  pgId: newPg.id,
  phone: '+91 91111 22222',
  dueDateDay: 5,
  securityDeposit: 10000,
});

assert(addStudentRes.success && addStudentRes.tenant, 'Adding student should succeed');
const newStudent = addStudentRes.tenant;
console.log(`✅ Enrolled Student: "${newStudent.name}" with Rent ₹${newStudent.monthlyRent.toLocaleString('en-IN')}`);

// Verify auto-bed assignment
const assignedBed = store.getBedById(newStudent.bedId);
assert(assignedBed, 'Assigned bed must exist');
assert.strictEqual(assignedBed.status, 'OCCUPIED_DUE_SOON', 'Bed status should change to OCCUPIED_DUE_SOON');
assert.strictEqual(assignedBed.tenantId, newStudent.id, 'Bed tenantId must link to student');
console.log(`   Bed ${assignedBed.bedNumber} in Room assigned to ${studentName}`);

// Verify October Rent Record
const currentRent = store.getTenantCurrentRent(newStudent.id);
assert(currentRent, 'Current month rent record should be auto-generated');
assert.strictEqual(currentRent.amount, studentRent, 'Rent record amount must match student rent');
console.log(`   Auto-generated October Rent Record: ₹${currentRent.amount} (Due: ${currentRent.dueDate})`);

// Verify Metrics Updated
const updatedMetrics = store.getMetrics(newPg.id);
assert.strictEqual(updatedMetrics.expectedRent, initialMetrics.expectedRent + studentRent, 'Expected rent must increase by student rent');
console.log(`   New Expected Rent for "${newPg.name}": ₹${updatedMetrics.expectedRent.toLocaleString('en-IN')} (verified)`);

// Test 4: Edit Student Name and Rent
console.log('\n--- Test 4: Edit Student Name and Rent ---');
const updatedRent = 10500;
const updatedName = 'Abhinav Saxena (Senior)';

const updateRes = store.updateTenant(newStudent.id, {
  name: updatedName,
  monthlyRent: updatedRent,
});

assert(updateRes.success && updateRes.tenant, 'Updating student should succeed');
assert.strictEqual(updateRes.tenant.name, updatedName, 'Name should be updated');
assert.strictEqual(updateRes.tenant.monthlyRent, updatedRent, 'Rent should be updated');

const updatedRentRecord = store.getTenantCurrentRent(newStudent.id);
assert.strictEqual(updatedRentRecord.amount, updatedRent, 'Unpaid rent record amount must synchronize with new rent');

const metricsAfterEdit = store.getMetrics(newPg.id);
assert.strictEqual(metricsAfterEdit.expectedRent, updatedRent, 'Metrics must recalculate based on edited rent');
console.log(`✅ Successfully edited student: "${updatedName}"`);
console.log(`   Updated Monthly Rent: ₹${updatedRent.toLocaleString('en-IN')}`);
console.log(`   Synchronized Rent Record: ₹${updatedRentRecord.amount}`);
console.log(`   Dashboard Expected Rent: ₹${metricsAfterEdit.expectedRent.toLocaleString('en-IN')}`);

// Test 5: Multi-PG Switching and Consolidated Aggregation
console.log('\n--- Test 5: Multi-PG Switching & Portfolio Aggregation ---');
store.setActivePG('all');
const combinedMetrics = store.getMetrics();
console.log(`   Portfolio Total Expected Rent across all ${store.getPGs().length} PGs: ₹${combinedMetrics.expectedRent.toLocaleString('en-IN')}`);
console.log(`   Portfolio Total Beds: ${combinedMetrics.totalBedsCount} Beds (${combinedMetrics.totalBedsCount - combinedMetrics.vacantBedsCount} Occupied, ${combinedMetrics.vacantBedsCount} Vacant)`);
assert(combinedMetrics.expectedRent > updatedRent, 'Combined expected rent should exceed single PG rent');

console.log('\n🎉 ALL MULTI-PG & STUDENT RENT MANAGEMENT TESTS PASSED PERFECTLY!\n');
