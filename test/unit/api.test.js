import { describe, it, before, after } from 'node:test'
import { handler } from '../../api.js'
import assert from 'node:assert'

describe('API unit test suite', () => {
    describe('/login', () => {
        it('should receive not authorized when user or password is invalid', async() => {
            const input = {
                user: 'invalid',
                password: ''
            }

            const result = await handler(request, response);

            const expectedStatus = 401
            assert.strictEqual(result.status, expectedStatus, `status code should be 401, actual: ${result.status}`);

            const expectedBody = { error: 'user invalid!' }
            const response = await result.json()
            assert.deepStrictEqual(response, expectedBody, `response.body should be ${JSON.stringify(expectedBody)}, actual: ${JSON.stringify(response)}`)
        });

        it('should login successfully given user and password', async() => {
            const input = {
                user: 'erickwendel',
                password: '123'
            }

            const result = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                body: JSON.stringify(input)
            });

            const expectedStatus = 200
            assert.strictEqual(result.status, expectedStatus, `status code should be 401, actual: ${result.status}`);

            const response = await result.json()
            assert.ok(response.token.length > 20, `response should be a valid jwt token, actual: ${response.token}`)

            _globalToken = response.token;
        });
    });

})