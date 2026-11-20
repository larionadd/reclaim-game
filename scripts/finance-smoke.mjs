import assert from 'node:assert/strict'
import { payShift, applyFine, sponsorProcedure, purchaseProcedure } from '../src/mechanics/workerFinance.ts'

const empty = { savings: 0, medicalGrant: 0, events: [] }
const paid = payShift(empty, 'day-1:mara', 12, 5)
assert.equal(paid.savings, 17)
assert.equal(payShift(paid, 'day-1:mara', 12, 5).savings, 17)
assert.throws(() => applyFine(paid, 'fine-1', 12, 3, 'documented_damage', true, true))
assert.throws(() => applyFine(paid, 'fine-1', 12, 2, 'documented_damage', true, false))
const fined = applyFine(paid, 'fine-1', 12, 2, 'documented_damage', true, true)
assert.equal(fined.savings, 15)
assert.equal(applyFine(fined, 'fine-1', 12, 2, 'documented_damage', true, true).savings, 15)
const funded = sponsorProcedure(fined, 'grant-1', 125)
assert.equal(funded.medicalGrant, 125)
assert.throws(() => purchaseProcedure(funded, 'procedure-1', 140, false))
const purchased = purchaseProcedure(funded, 'procedure-1', 140, true)
assert.equal(purchased.savings, 0)
assert.equal(purchased.medicalGrant, 0)
assert.equal(purchaseProcedure(purchased, 'procedure-1', 140, true).events.length, purchased.events.length)
console.log('Worker finance, fine limits, grants and idempotency passed')
