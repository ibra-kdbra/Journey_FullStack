// Errors and ids: no raw error objects reach the client, bad ids get 400.
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import './setup'

import app from '../src/app'
import { User } from '../src/models/User'
import { signToken } from '../src/services/TokenService'

const stub = (obj: object, key: string, fn: unknown) => {
    ;(obj as any)[key] = fn
}

let server: Server
let base: string

const call = (path: string, init: RequestInit = {}, token?: string) =>
    fetch(base + path, {
        ...init,
        headers: {
            'content-type': 'application/json',
            ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
    })

const SECRET = 'SELECT * FROM users -- host db.internal:3306'
const dbError = () => Object.assign(new Error(SECRET), { name: 'SequelizeConnectionError', sql: SECRET })

before(() => {
    server = app.listen(0)
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    stub(User, 'findByPk', async (id: number) => ({ id, name: 'N', email: 'n@x.io' }))
    stub(User, 'update', async () => [1])
})
after(() => server.close())

const admin = () => signToken(1)

describe('database failures return a generic 500', () => {
    const origConsoleError = console.error
    before(() => { console.error = () => undefined })
    after(() => { console.error = origConsoleError })

    for (const [name, path, target, key] of [
        ['GET /users', '/users', User, 'findAll'],
        ['GET /users/2', '/users/2', User, 'findByPk'],
        ['GET /users/orders/2', '/users/orders/2', User, 'findByPk'],
    ] as const) {
        it(name, async () => {
            const original = (target as any)[key]
            stub(target, key, async () => { throw dbError() })
            try {
                const res = await call(path, {}, admin())
                const text = await res.text()
                assert.equal(res.status, 500)
                assert.deepEqual(JSON.parse(text), { status: 'error', message: 'Internal server error' })
                assert.ok(!text.includes('SELECT') && !text.includes('db.internal'))
            } finally {
                stub(target, key, original)
            }
        })
    }

    it('PUT /users/2', async () => {
        const original = (User as any).update
        stub(User, 'update', async () => { throw dbError() })
        try {
            const res = await call('/users/2', { method: 'PUT', body: JSON.stringify({ name: 'x' }) }, admin())
            const text = await res.text()
            assert.equal(res.status, 500)
            assert.ok(!text.includes('SELECT') && !text.includes('db.internal'))
        } finally {
            stub(User, 'update', original)
        }
    })
})

describe('malformed bodies and validation errors', () => {
    it('login validation error does not echo the submitted body', async () => {
        const res = await call('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'not-an-email', password: 'hunter2hunter2' }),
        })
        const text = await res.text()
        assert.equal(res.status, 400)
        assert.ok(!text.includes('hunter2hunter2'), text)
        assert.ok(!text.includes('_original'), text)
    })

    it('invalid JSON is a 400 without parser internals', async () => {
        const res = await call('/auth/login', { method: 'POST', body: '{bad' })
        const text = await res.text()
        assert.equal(res.status, 400)
        assert.ok(!text.includes('SyntaxError') && !text.includes('node_modules'), text)
    })
})

describe('non-numeric ids are rejected with 400', () => {
    for (const id of ['abc', '1abc', '1.5', '0', '-1', '1e3', '99999999999']) {
        it(`id "${id}"`, async () => {
            for (const [method, path] of [
                ['GET', `/users/${id}`],
                ['PUT', `/users/${id}`],
                ['GET', `/users/orders/${id}`],
            ] as const) {
                const res = await call(path, { method, body: method === 'PUT' ? JSON.stringify({ name: 'x' }) : undefined }, admin())
                assert.equal(res.status, 400, `${method} ${path}`)
            }
        })
    }

    it('a valid numeric id still works', async () => {
        assert.equal((await call('/users/2', {}, admin())).status, 200)
    })
})
