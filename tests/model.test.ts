import { BaseDataCollectionModel, MockRepository, BaseDataModel } from "../src"



class ChildDataModel extends BaseDataModel{
    constructor(config: {
        data: any,
        parent: BaseDataModel
    }){
        super({
            data: config.data,
            parent: config.parent,
            repos: new MockRepository({data: [{abc: 123}, {xyz: 123}]})
        })
    }
}

describe('BaseModelCollection', ()=>{
    test('testing collection format 1', async ()=>{
        const repo = new MockRepository({data: [{abc: 123}, {xyz: 123}]})
        const model = new BaseDataCollectionModel({children: BaseDataModel, repos: repo}) 
        await model.load()
    })

    test('testing collection format 2', async ()=>{
        const repo = new MockRepository({data: {
            iterKey: [{abc: 123}, {xyz: 123}],
            iterKey2: [{abc: 456}, {xyz: 789}, {lmn: 123}],

        }})
        const model = new BaseDataCollectionModel({children: {
            main: { key: 'iterKey', model: ChildDataModel },
            second: { key: 'iterKey2', model: ChildDataModel },
        }, repos: repo}) 
        await model.load()
        expect(model.collections.main.length).toBe(2)
        expect(model.collections.second.length).toBe(3)
        console.log(model.collections.main)
        console.log(model.collections.second)
    })

    test('async false', async ()=>{
        const repo = new MockRepository({data: [{abc: 123}, {xyz: 123}]})
        const model = new BaseDataCollectionModel({children: ChildDataModel, repos: repo, async: false}) 
        await model.load()
        for (const col of model.collections.main){
            expect(col.repos.main.state).toBe('unloaded')
        }
    })
    test('async true', async ()=>{
        const repo = new MockRepository({data: [{abc: 123}, {xyz: 123}]})
        const model = new BaseDataCollectionModel({children: ChildDataModel, repos: repo, async: true}) 
        await model.load()
        for (const col of model.collections.main){
            expect(col.repos.main.state).toBe('loaded')
        }
    })
})


