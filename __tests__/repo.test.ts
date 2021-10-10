import { APIRepo, BaseRepo, BaseRepoConfigDefaults, events, FormModel, MockRepo } from "../src"
// require('jest-fetch-mock').enableMocks()
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks()


// test('repo config', ()=>{
//     const repo = new BaseAPIModel({path: "/"})
//     expect(repo)
// })


describe('empty config', () => {
    test('should be default object', () => {
        const repo = new BaseRepo()

        expect(repo.config).toStrictEqual(BaseRepoConfigDefaults)
    })
})

test('successful repo call', async () => {

    fetchMock.mockResponse(JSON.stringify({ test: 123 }))

    const repo = new APIRepo({ path: "/" })
    expect(repo.state).toBe('unloaded')
    repo.call().then(() => {
        // after call is finished
        expect(repo.state).toBe('loaded')
        expect(repo.data).toStrictEqual({ test: 123 })
    })
    // before call is finished
    expect(repo.state).toBe('loading')


})

test('failed repo call', async () => {
    fetchMock.mockResponse(JSON.stringify({ test: 123 }), { status: 500 })

    const repo = new APIRepo({ path: "/" })
    expect(repo.state).toBe('unloaded')
    repo.call().then(() => {
        // after call is finished
        expect(repo.state).toBe('error')
        expect(repo.data).toStrictEqual({ test: 123 })
    })
    // before call is finished
    expect(repo.state).toBe('loading')
})

describe('APIRepo call - data argument', () => {
    test('with', async () => {
        fetchMock.mockResponse(JSON.stringify({ test: 123 }), { status: 200 })


        const repo = new APIRepo({ path: "/", method: 'POST' })
        await repo.call(456)
        expect(repo._body).toBe(456)
        expect(repo.body).toBe("456")
    })

    test('without', async () => {
        fetchMock.mockResponse(JSON.stringify({ test: 123 }), { status: 200 })

        const payload = () => {
            return {
                data: 123
            }
        }
        const repo = new APIRepo({ path: "/", body: payload, method: 'POST' })
        expect(repo.body).toBe(JSON.stringify(payload()))
        await repo.call()
    })
})

describe('pubsub', () => {
    test('onLoad', () => {
        const repo = new MockRepo({ data: 123 })
        expect(repo.state).toBe('unloaded')
        repo.call()
        expect(repo.state).toBe('loading')
        repo.onLoad.subscribe(() => {
            expect(repo.state).toBe('loaded')
        })

    })
})

describe('events', () => {
    test('onLoad', async () => {
        const repo = new MockRepo({
            data: 123, events: {
                onLoad: { type: 'onLoad', data: 123 }
            }
        })
        let count = 0
        events.on('onLoad', (data) => {
            count += 1
            expect(data).toBe(123)
        })

        await repo.call()
        expect(count).toBe(1)
    })

    test('onError', async () => {
        const repo = new MockRepo({
            data: 123, finalState: 'error', events: {
                onError: { type: 'onError', data: 123 }
            }
        })
        let count = 0
        events.on('onError', (data) => {
            count += 1
            expect(data).toBe(123)
        })

        await repo.call()
        expect(count).toBe(1)
    })
})