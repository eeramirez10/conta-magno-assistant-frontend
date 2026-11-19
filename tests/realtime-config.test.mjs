import test from 'node:test'
import assert from 'node:assert/strict'
import { realtimeConfig } from '../src/shared/realtime/realtimeConfig.ts'
test('Socket.IO uses the API prefix as its transport path, not a namespace', () => {
 assert.deepEqual(realtimeConfig('https://example.test/conta-magno'), {origin:'https://example.test',path:'/conta-magno/socket.io'})
 assert.deepEqual(realtimeConfig('https://example.test/conta-magno/'), {origin:'https://example.test',path:'/conta-magno/socket.io'})
 assert.deepEqual(realtimeConfig('http://localhost:4000'), {origin:'http://localhost:4000',path:'/socket.io'})
 assert.equal(realtimeConfig('https://example.test/conta-magno','/socket.io').path,'/socket.io')
})
