// import '@types/jest';
import { BaseDataCollectionModel, MockRepository, BaseDataModel, BaseFormModel, Forms, APIRepository } from "../src"

// class ChildsDataModel extends BaseDataCollectionModel{
//     constructor(config){
//         super({...config,
//         collections:{
//             main: { key: 'iterKey', model: ChildDataModel },
//             second: { key: 'iterKey2', model: ChildDataModel },
//         }})
//     }
// }

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

class Child2DataModel extends BaseDataModel{
    secondRepo: MockRepository
    constructor(config: {
        data: any,
        parent: BaseDataModel
    }){
        super({
            data: config.data,
            parent: config.parent
        })
        
        this.secondRepo = new MockRepository({data: [1,2,3]})

        this.repos = {
            main: new MockRepository({data: [{abc: 123}, {xyz: 123}]}),
            second: this.secondRepo
        }
    }
}


describe('Models and forms', ()=>{
    test('should instantiate properly', ()=>{
        class Model extends BaseDataModel{
            constructor(){
                super({})
                this.forms = {
                    main: new BaseFormModel({data: [1,2,3]}),
                    second: new BaseFormModel({data: [1,2,3]}),
                }
            }
        }
        const model = new Model()
        model.forms
    })
})

describe('BaseModelCollection', ()=>{
    test('testing collection format 1', async ()=>{
        const repo = new MockRepository({data: [{abc: 123}, {xyz: 123}]})
        const model = new BaseDataCollectionModel({collections: BaseDataModel, repos: repo}) 
        await model.load()
        // console.log(model.collection)
        expect(model.collection.length).toBe(2)
        const modelDataProp = new BaseDataCollectionModel({collections: BaseDataModel, data: [{abc: 123}, {xyz: 123}]}) 
        console.log(modelDataProp)
        expect(modelDataProp.collection.length).toBe(2)
    })
    test('collection with data prop', async ()=>{
        const model = new BaseDataCollectionModel({collections: BaseDataModel, data: [{abc: 123}, {xyz: 123}]}) 
        await model.load()
        console.log(model)
        expect(model.collection.length).toBe(2)
    })

    test('testing collection format 2', async ()=>{
        const repo = new MockRepository({data: {
            iterKey: [{abc: 123}, {xyz: 123}],
            iterKey2: [{abc: 456}, {xyz: 789}, {lmn: 123}],
        }})
        const model = new BaseDataCollectionModel({collections: {
            main: { key: 'iterKey', model: ChildDataModel },
            second: { key: 'iterKey2', model: ChildDataModel },
        }, repos: repo, async: true}) 
        await model.load()
        expect(model.collections.main.length).toBe(2)
        expect(model.collections.second.length).toBe(3)
        // console.log(model.collections.main)
        // console.log(model.collections.second)
    })

    test('async false should leave all models in a collection unloaded', async ()=>{
        const repo = new MockRepository({data: [{abc: 123}, {xyz: 123}]})
        const model = new BaseDataCollectionModel({collections: ChildDataModel, repos: repo, async: false}) 
        await model.load()
        for (const col of model.collections.main){
            expect(col.repo.state).toBe('unloaded')
        }
    })
    test('async true should load all models in a collection', async ()=>{
        const repo = new MockRepository({data: [{abc: 123}, {abc: 456}]})
        const model = new BaseDataCollectionModel({collections: ChildDataModel, repos: repo, async: true}) 
        console.log(repo)
        console.log(model.repo)
        await model.load()

        for (const col of model.collections.main){
            expect(col.repo.state).toBe('loaded')
        }
    })
})

describe('object references should be kept the same', ()=>{
    test('repo reference', async ()=>{
        const repo = new MockRepository({data: [{abc: 123}, {abc: 456}]})
        const model = new BaseDataCollectionModel({collections: ChildDataModel, repos: repo, async: true}) 
        expect(repo === model.repo ).toBeTruthy()
        await model.load()
        expect(repo === model.repo ).toBeTruthy()
    })
})



describe('repos tests', ()=>{
    test('test multiple repos', ()=>{

    })

    test('model should be in error state', async ()=>{
        const model = new BaseDataModel({
            repos: new MockRepository({data: undefined, finalState: 'error'})
        })

        await model.load()

        expect(model.state).toBe('error')
    })
})


describe('form and repo referencing', ()=>{

})

describe('form payload', ()=>{
    
})


describe('model payload', ()=>{
    test('BaseDataModel should get child data', ()=>{

    })

    test('BaseDataCollectionModel should get all collections data', ()=>{

    })
})