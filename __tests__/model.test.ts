// import '@types/jest';
import { CollectionModel, MockRepo, Model, FormModel, Forms, APIRepo } from "../src"

// class ChildsDataModel extends CollectionModel{
//     constructor(config){
//         super({...config,
//         collections:{
//             main: { key: 'iterKey', model: ChildDataModel },
//             second: { key: 'iterKey2', model: ChildDataModel },
//         }})
//     }
// }

class ChildDataModel extends Model{
    constructor(config: {
        data: any,
        parent: Model
    }){
        super({
            data: config.data,
            parent: config.parent,
            repos: new MockRepo({data: [{abc: 123}, {xyz: 123}]})
        })
    }
}

class Child2DataModel extends Model{
    secondRepo: MockRepo
    constructor(config: {
        data: any,
        parent: Model
    }){
        super({
            data: config.data,
            parent: config.parent
        })
        
        this.secondRepo = new MockRepo({data: [1,2,3]})

        this.repos = {
            main: new MockRepo({data: [{abc: 123}, {xyz: 123}]}),
            second: this.secondRepo
        }
    }
}


describe('Models and forms', ()=>{
    test('should instantiate properly', ()=>{
        class NewModel extends Model{
            constructor(){
                super({})
                this.forms = {
                    main: new FormModel({data: [1,2,3]}),
                    second: new FormModel({data: [1,2,3]}),
                }
            }
        }
        const model = new NewModel()
        model.forms
    })
})

describe('BaseModelCollection', ()=>{
    test('testing collection format 1', async ()=>{
        const repo = new MockRepo({data: [{abc: 123}, {abc: 456}]})
        const model = new CollectionModel({collections: Model, repos: repo}) 
        await model.load()
        expect(model.collection.length).toBe(2)
        const modelDataProp = new CollectionModel({data: [{abc: 123}, {abc: 456}]}) 
        await modelDataProp.load()
        expect(modelDataProp.collection.length).toBe(2)
    })

    test('collection with data prop', async ()=>{
        const model = new CollectionModel({collections: Model, data: [{abc: 123}, {abc: 123}]}) 
        await model.load()
        expect(model.collection.length).toBe(2)
    })

    test('testing collection format 2', async ()=>{
        const repo = new MockRepo({data: {
            iterKey: [{abc: 123}, {xyz: 123}],
            iterKey2: [{abc: 456}, {xyz: 789}, {lmn: 123}],
        }})
        const model = new CollectionModel({collections: {
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
        const repo = new MockRepo({data: [{abc: 123}, {xyz: 123}]})
        const model = new CollectionModel({collections: ChildDataModel, repos: repo, async: false}) 
        await model.load()
        for (const col of model.collections.main){
            expect(col.repo.state).toBe('unloaded')
        }
    })
    test('async true should load all models in a collection', async ()=>{
        const repo = new MockRepo({data: [{abc: 123}, {abc: 456}]})
        const model = new CollectionModel({collections: ChildDataModel, repos: repo, async: true}) 
        // console.log(repo)
        // console.log(model.repo)
        await model.load()

        for (const col of model.collections.main){
            expect(col.repo.state).toBe('loaded')
        }
    })
})

describe('object references should be kept the same', ()=>{
    test('repo reference', async ()=>{
        const repo = new MockRepo({data: [{abc: 123}, {abc: 456}]})
        const model = new CollectionModel({collections: ChildDataModel, repos: repo, async: true}) 
        expect(repo === model.repo ).toBeTruthy()
        await model.load()
        expect(repo === model.repo ).toBeTruthy()
    })
})



describe('repos tests', ()=>{
    test('test multiple repos', ()=>{

    })

    test('model should be in error state', async ()=>{
        const model = new Model({
            repos: new MockRepo({data: undefined, finalState: 'error'})
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
    test('Model should get child data', ()=>{

    })

    test('CollectionModel should get all collections data', ()=>{

    })
})