import test from 'node:test';
import assert from 'node:assert/strict';
import {parseTime,formatTime,formatPace,improvementPercent,calculateAssignments} from '../src/core.js';
test('time parser rejects malformed and out-of-range seconds',()=>{assert.equal(parseTime('2:09'),129);assert.equal(parseTime('2:60'),0);assert.equal(parseTime('x'),0)});
test('time and pace formatters round safely',()=>{assert.equal(formatTime(125.9),'2:05');assert.equal(formatPace(359.7),'6:00 /km')});
test('improvement is measured from first valid test to best',()=>{assert.equal(improvementPercent(100,90),10);assert.equal(improvementPercent(0,0),null)});
test('alternating allocation and flexible individual-station allocation',()=>{const stations=[{index:0,load:'16kg',work:'20m'},{index:1,load:'24kg',work:'10 reps'}];const tests=[{station:0,load:'16kg',work:'20m',athlete:0,seconds:60},{station:0,load:'16kg',work:'20m',athlete:1,seconds:70},{station:1,load:'24kg',work:'10 reps',athlete:0,seconds:80},{station:1,load:'24kg',work:'10 reps',athlete:1,seconds:50}];assert.deepEqual(calculateAssignments(stations,tests,'A'),{athlete1:60,athlete2:50,total:110,missing:0});assert.deepEqual(calculateAssignments(stations,tests,'B'),{athlete1:80,athlete2:70,total:150,missing:0});assert.deepEqual(calculateAssignments(stations,tests,'C'),{athlete1:60,athlete2:50,total:110,missing:0})});
