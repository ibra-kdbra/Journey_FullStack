// Run with: npm test  (node's built-in test runner, no extra dependencies)
import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'
import { resolveNotePath } from '../src/main/lib/notePath.ts'

const root = path.resolve('/home/user/editormark-notes')

test('accepts plain note names', () => {
  assert.equal(resolveNotePath(root, 'My note'), path.join(root, 'My note.md'))
  assert.equal(resolveNotePath(root, 'a.b'), path.join(root, 'a.b.md'))
})

test('rejects traversal and separators', () => {
  for (const bad of [
    '../../x',
    '..',
    '.',
    '../x',
    'a/b',
    'a\\b',
    '/etc/passwd',
    '..\\..\\x',
    'x\0y',
    ''
  ]) {
    assert.throws(() => resolveNotePath(root, bad), /Invalid note filename/, JSON.stringify(bad))
  }
})

test('rejects non-string input', () => {
  for (const bad of [undefined, null, 42, {}, ['a']]) {
    assert.throws(() => resolveNotePath(root, bad), /Invalid note filename/)
  }
})
