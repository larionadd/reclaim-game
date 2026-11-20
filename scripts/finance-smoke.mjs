import assert from 'node:assert/strict'
import { payShift, applyFine, purchaseProcedure } from '../src/mechanics/workerFinance.ts'

const empty = { savings: 0, events: [] }
const paid = payShift(empty, 'day-1:mara', 12, 5)
assert.equal(paid.savings, 17)
assert.equal(payShift(paid, 'day-1:mara', 12, 5).savings, 17)
assert.throws(() => applyFine(paid, 'fine-1', 12, 3, 'documented_damage', true, true))
assert.throws(() => applyFine(paid, 'fine-1', 12, 2, 'documented_damage', true, false))
const fined = applyFine(paid, 'fine-1', 12, 2, 'documented_damage', true, true)
assert.equal(fined.savings, 15)
assert.equal(applyFine(fined, 'fine-1', 12, 2, 'documented_damage', true, true).savings, 15)
assert.throws(() => purchaseProcedure(fined, 'procedure-1', 140, true))
const saved = payShift(fined, 'day-2:mara', 150, 0)
assert.throws(() => purchaseProcedure(saved, 'procedure-1', 140, false))
const purchased = purchaseProcedure(saved, 'procedure-1', 140, true)
assert.equal(purchased.savings, 25)
assert.equal(purchaseProcedure(purchased, 'procedure-1', 140, true).events.length, purchased.events.length)
console.log('Worker finance, fine limits, own-savings procedures and idempotency passed')
