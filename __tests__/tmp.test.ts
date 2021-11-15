import { CollectionModel, FormModel, MockRepo, Model } from "../src"

// test('empty list', () => {
//     const data = {
//         permissions: [],
//         roles: [123],
//     }
//     const form = new FormModel({
//         data
//     })
//     console.log(form.data)
//     expect(form.data).toStrictEqual(data)
//     // expect(form.payload).toBe(data)
// })



// test('model repo onLoad', async () => {
//     const model = new Model({
//         repos: new MockRepo({data: 123})
//     })


//     await model.load()
//     await model.load()
// })

// test('form repo load', async () => {
//     const data = { numbers: [1, 2, 3] }
//     const repo = new MockRepo({ data })
//     const form = new FormModel({ repo })
//     // console.log("preload data", data, form.data)
//     expect(form.data).toStrictEqual({})
//     await repo.call()
//     // console.log("postload data", form.data)
//     // await setTimeout(() => {
//         expect(form.data).toStrictEqual(data)
//     // }, 1000)
// })

test('repo reload', async () => {
    // should update the model data
    const repo = new MockRepo({ data: 123 })
    const model = new Model({
        repos: repo
    })
    // console.log(model.repo)
    await model.load()
    // console.log(repo.data, repo.state)
    expect(model.data).toBe(123)
    repo.config.data = 456
    await repo.call()
    expect(model.data).toBe(456)
})

test('repo reload - collection', async ()=>{
    const repo = new MockRepo({ data: [{ abc: 123 }, { abc: 456 }] })
    const model = new CollectionModel({ collections: Model, repos: repo })
    await model.load()

    expect(model.collection.length).toBe(2)
    repo.config.data = [{ abc: 123 }, { abc: 456 }, {abc: 789}]
    await repo.call()
    await setTimeout(()=>{
        expect(model.collection.length).toBe(3)
    })
})