import test from 'node:test'
import assert from 'node:assert/strict'
import { FailureNotifications } from '../src/shared/notifications/failureNotifications.ts'
const failure = id => ({ id, error: 'Processing failed' })
test('saved failures are history on first snapshot, including after page reload', () => {
  const tracker = new FailureNotifications()
  assert.deepEqual(tracker.collect('chat-a', [failure('old')]), [])
  assert.deepEqual(tracker.collect('chat-a', [failure('old')]), [])
  assert.deepEqual(new FailureNotifications().collect('chat-a', [failure('old')]), [])
})
test('only new failures notify, independently of list order and successful updates', () => {
  const tracker = new FailureNotifications()
  tracker.collect('chat-a', [failure('old')])
  assert.deepEqual(tracker.collect('chat-a', [failure('new'), failure('old')]), [failure('new')])
  assert.deepEqual(tracker.collect('chat-a', []), [])
  assert.deepEqual(tracker.collect('chat-a', [failure('old'), failure('new')]), [])
})
test('empty initial snapshot still allows the first live failure', () => {
  const tracker = new FailureNotifications()
  tracker.collect('chat-a', [])
  assert.deepEqual(tracker.collect('chat-a', [failure('new')]), [failure('new')])
})
test('switching conversations does not replay either conversation history', () => {
  const tracker = new FailureNotifications()
  tracker.collect('chat-a', [failure('a')])
  assert.deepEqual(tracker.collect('chat-b', [failure('b')]), [])
  assert.deepEqual(tracker.collect('chat-a', [failure('a')]), [])
  assert.deepEqual(tracker.collect('chat-b', [failure('b'), failure('new-b')]), [failure('new-b')])
})
