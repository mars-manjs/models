import { APIRepository } from "../src"
// require('jest-fetch-mock').enableMocks()
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks()


// test('repo config', ()=>{
//     const repo = new BaseAPIModel({path: "/"})
//     expect(repo)
// })

test('successful repo call', async ()=>{

    fetchMock.mockResponse(JSON.stringify({test: 123}))

    const repo = new APIRepository({path: "/"})
    expect(repo.state).toBe('unloaded')
    repo.call().then(()=>{
        // after call is finished
        expect(repo.state).toBe('loaded')
        expect(repo.data).toBe({test:123})
    })
    // before call is finished
    expect(repo.state).toBe('loading')


})

test('failed repo call', async () => {
    fetchMock.mockResponse(JSON.stringify({test: 123}), {status: 500})

    const repo = new APIRepository({path: "/"})
    expect(repo.state).toBe('unloaded')
    repo.call().then(()=>{
        // after call is finished
        expect(repo.state).toBe('error')
        expect(repo.data).toBe({test:123})
    })
    // before call is finished
    expect(repo.state).toBe('loading')
})