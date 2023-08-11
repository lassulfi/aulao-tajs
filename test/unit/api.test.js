import { describe, it } from 'node:test'
import { handler } from '../../api.js'
import assert from 'node:assert'
import { EventEmitter } from "node:events"

const mockRequest = ({url, method, headers, body}) => {
    const options = {
        url: url ?? '/',
        method: method ?? "GET",
        headers: headers ?? {},
    }

    const request = new EventEmitter()

    request.url = options.url
    request.method = options.method
    request.headers = options.headers

    setTimeout(() => request.emit('data', JSON.stringify(body)))

    return request
}

const mockResponse = ({ mockContext }) => {
    const response = {
        writeHead: mockContext.fn(),
        end: mockContext.fn(),
    }

    return response;
}

const getFirstCallArg = (mock) => mock.calls[0].arguments[0]

describe('API unit test suite', () => {
    let _globalToken
    describe('/login', () => {
        it('should receive not authorized when user is invalid', async(context) => {
            const inputRequest = mockRequest({
                url: "/login",
                method: "POST",
                body: {
                    user: '',
                    password: '123'
                },
            })

            const outputResponse = mockResponse({
                mockContext: context.mock
            })

            await handler(inputRequest, outputResponse);

            const expectedStatus = 401
            const actualStatus = getFirstCallArg(outputResponse.writeHead.mock) 
            assert.strictEqual(actualStatus, expectedStatus, `status code should be ${expectedStatus}, actual: ${actualStatus}`);

            const expectedResponse = JSON.stringify({ error: 'user invalid!' })
            const actualResponse = getFirstCallArg(outputResponse.end.mock)
            assert.strictEqual(outputResponse.end.mock.callCount(), 1, 'should call response.end once')
            assert.strictEqual(actualResponse, expectedResponse, `should receive ${expectedResponse}, received ${actualResponse}`)
        });

        it('should receive not authorized when password is invalid', async(context) => {
            const inputRequest = mockRequest({
                url: "/login",
                method: "POST",
                body: {
                    user: 'erickwendel',
                    password: ''
                },
            })

            const outputResponse = mockResponse({
                mockContext: context.mock
            })

            await handler(inputRequest, outputResponse);

            const expectedStatus = 401
            const actualStatus = getFirstCallArg(outputResponse.writeHead.mock) 
            assert.strictEqual(actualStatus, expectedStatus, `status code should be ${expectedStatus}, actual: ${actualStatus}`);

            const expectedResponse = JSON.stringify({ error: 'user invalid!' })
            const actualResponse = getFirstCallArg(outputResponse.end.mock)
            assert.strictEqual(outputResponse.end.mock.callCount(), 1, 'should call response.end once')
            assert.strictEqual(actualResponse, expectedResponse, `should receive ${expectedResponse}, received ${actualResponse}`)
        });

        it('should login successfully given user and password', async(context) => {
            const inputRequest = mockRequest({
                url: "/login",
                method: "POST",
                body: {
                    user: 'erickwendel',
                    password: '123'
                },
            })

            const outputResponse = mockResponse({
                mockContext: context.mock
            })

            await handler(inputRequest, outputResponse);

            const actualResponse = getFirstCallArg(outputResponse.end.mock)
            const response = JSON.parse(actualResponse);
            assert.ok(response.token.length > 20, `response should be a valid jwt token, actual: ${response.token}`)

            _globalToken = response.token;
        });
    });

    describe('/', () => {
        it('should not be allowed to access private data without a token', async(context) => {
            const inputRequest = mockRequest({
                headers: {
                    authorization: ''
                }
            })

            const outputResponse = mockResponse({
                mockContext: context.mock
            })

            await handler(inputRequest, outputResponse);

            const expectedStatus = 400
            const actualStatus = getFirstCallArg(outputResponse.writeHead.mock) 
            assert.strictEqual(actualStatus, expectedStatus, `status code should be ${expectedStatus}, actual: ${actualStatus}`);

            const expectedResponse = JSON.stringify({ error: 'invalid token!' })
            const actualResponse = getFirstCallArg(outputResponse.end.mock)
            assert.strictEqual(outputResponse.end.mock.callCount(), 1, 'should call response.end once')
            assert.strictEqual(actualResponse, expectedResponse, `should receive ${expectedResponse}, received ${actualResponse}`)
        })
    });

    it('should be allowed to access private data with a valid token', async(context) => {
        const inputRequest = mockRequest({
            headers: {
                authorization: _globalToken
            }
        })
        const outputResponse = mockResponse({
            mockContext: context.mock
        })

        await handler(inputRequest, outputResponse);

        const expectedBody = { result: 'Hey welcome!' }
        const actualResponse = getFirstCallArg(outputResponse.end.mock)
        const response = JSON.parse(actualResponse);
        assert.deepStrictEqual(response, expectedBody, `response.body should be ${JSON.stringify(expectedBody)}, actual: ${JSON.stringify(response)}`)
    });

})