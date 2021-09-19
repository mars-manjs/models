// import '@types/jest';
import { CollectionModel, MockRepo, Model, FormModel, Forms, APIRepo, BaseRepo } from "../src"

// class ChildsDataModel extends CollectionModel{
//     constructor(config){
//         super({...config,
//         collections:{
//             main: { key: 'iterKey', model: ChildDataModel },
//             second: { key: 'iterKey2', model: ChildDataModel },
//         }})
//     }
// }

class ChildDataModel extends Model {
    constructor(config: {
        data: any,
        parent: Model
    }) {
        super({
            data: config.data,
            parent: config.parent,
            repos: new MockRepo({ data: [{ abc: 123 }, { xyz: 123 }] })
        })
    }
}

class Child2DataModel extends Model {
    secondRepo: MockRepo
    repos = {
        main: new MockRepo({ data: [{ abc: 123 }, { xyz: 123 }] }),
        second: new MockRepo({ data: [1, 2, 3] })
    }
    constructor(config: {
        data: any,
        parent: Model
    }) {
        super({
            data: config.data,
            parent: config.parent
        })
    }
}


// const c = new Child2DataModel({})

describe('Models and forms', () => {
    test('should instantiate properly', () => {
        class NewModel extends Model {
            constructor() {
                super({})
                this.forms = {
                    main: new FormModel({ data: [1, 2, 3] }),
                    second: new FormModel({ data: [1, 2, 3] }),
                }
            }
        }
        const model = new NewModel()
        model.forms
    })
})

describe('BaseModelCollection', () => {
    test('testing collection format 1', async () => {
        const repo = new MockRepo({ data: [{ abc: 123 }, { abc: 456 }] })
        const model = new CollectionModel({ collections: Model, repos: repo })
        await model.load()
        expect(model.collection.length).toBe(2)
        const modelDataProp = new CollectionModel({ data: [{ abc: 123 }, { abc: 456 }] })
        await modelDataProp.load()
        expect(modelDataProp.collection.length).toBe(2)
    })

    test('collection with data prop', async () => {
        const model = new CollectionModel({ collections: Model, data: [{ abc: 123 }, { abc: 123 }] })
        await model.load()
        expect(model.collection.length).toBe(2)
    })

    test('testing collection format 2', async () => {
        const repo = new MockRepo({
            data: {
                iterKey: [{ abc: 123 }, { xyz: 123 }],
                iterKey2: [{ abc: 456 }, { xyz: 789 }, { lmn: 123 }],
            }
        })
        const model = new CollectionModel({
            collections: {
                main: { key: 'iterKey', model: ChildDataModel },
                second: { key: 'iterKey2', model: ChildDataModel },
            }, repos: repo, async: true
        })
        await model.load()
        expect(model.collections.main.length).toBe(2)
        expect(model.collections.second.length).toBe(3)
        // console.log(model.collections.main)
        // console.log(model.collections.second)
    })

    test('async false should leave all models in a collection unloaded', async () => {
        const repo = new MockRepo({ data: [{ abc: 123 }, { xyz: 123 }] })
        const model = new CollectionModel({ collections: ChildDataModel, repos: repo, async: false })
        await model.load()
        for (const col of model.collections.main) {
            expect(col.repo.state).toBe('unloaded')
        }
    })
    test('async true should load all models in a collection', async () => {
        const repo = new MockRepo({ data: [{ abc: 123 }, { abc: 456 }] })
        const model = new CollectionModel({ collections: ChildDataModel, repos: repo, async: true })
        // console.log(repo)
        // console.log(model.repo)
        await model.load()

        for (const col of model.collections.main) {
            expect(col.repo.state).toBe('loaded')
        }
    })
})

describe('object references should be kept the same', () => {
    test('repo reference', async () => {
        const repo = new MockRepo({ data: [{ abc: 123 }, { abc: 456 }] })
        const model = new CollectionModel({ collections: ChildDataModel, repos: repo, async: true })
        expect(repo === model.repo).toBeTruthy()
        await model.load()
        expect(repo === model.repo).toBeTruthy()
    })
})



describe('repos tests', () => {
    test('test multiple repos', () => {

    })

    test('model should be in error state', async () => {
        const model = new Model({
            repos: new MockRepo({ data: undefined, finalState: 'error' })
        })

        await model.load()

        expect(model.state).toBe('error')
    })
})


describe('form and repo referencing', () => {

})

describe('form payload', () => {

})


describe('model payload', () => {
    test('Model should get child data', () => {

    })

    test('CollectionModel should get all collections data', () => {

    })
})



describe('testing types', () => {
    const repo = new MockRepo({ data: { abc: 123 } })
    const form = new FormModel({}) 
    test('Model', () => {
        
        const m1 = new Model({ data: { xyz: 123, abc: 456 }, repos: { main: repo } })

        m1.data

        // works
        m1.repos.main

        const m2 = new Model({ 
            data: { xyz: 123, abc: 456 }, 
            repos: repo,
            forms: form
        })

        // works
        m2.repos.main
        m2.forms.main
        
        // works
        // m2.forms.NotAForm
        // m2.repos.NotARepo

        const m3 = new Model({
            data: { xyz: 123, abc: 456 },
            repos: {
                one: repo,
                two: repo
            },
            forms: {
                one: form
            }
        })

        // works
        m3.repos.one
        m3.repos.two
        m3.forms.one
        // m3.forms.NotAForm
        // m3.repos.NotARepo

    })

    test('Model w/ Inheritence', () => {
        class NewModel extends Model<{abc: number}>{
            repos = {
                main: repo
            }
            forms = {
                main: form
            }
            constructor(){
                super({
                    data: {abc: 123}
                })
            }
        }

        const m = new NewModel()

        // works
        m.repos.main
        m.data.abc
        m.forms.main


        class NewModel2 extends Model<{abc: number}>{
            repos = {
                one: repo,
                two: repo,
            }
            forms = {
                one: form,
                two: form
            }
            constructor(){
                super({
                    data: {abc: 123}
                })
            }
        }

        const m2 = new NewModel2()


        // works
        m2.repos.one
        m2.repos.two
        m2.forms.one
        m2.forms.two



    })

    test('CollectionModel', () => {
        const m1 = new CollectionModel({ 
            data: [{ xyz: 123, abc: 456 }], 
            repos: repo,
            forms: form
        })


        // works
        m1.repos.main
        m1.forms.main


        const m2 = new CollectionModel({ 
            data: [{ xyz: 123, abc: 456 }], 
            repos: {one: repo, two: repo},
            forms: {one: form, two: form}
        })

        // works
        m2.repos.one
        m2.repos.two
        m2.forms.one
        m2.forms.one



        // this should throw type errors
        // and does
        // const m3 = new CollectionModel({ 
        //     data: [{ xyz: 123, abc: 456 }], 
        //     repos: {one: repo, two: repo},
        //     forms: {one: repo, two: repo}
        // })


    })

    test('CollectionModel w/ Inheritence', () => {
        class NewCollectionModel extends CollectionModel<{abc: number}[]>{
            repos = {
                one: repo,
                two: repo,
            }
            forms = {
                one: form,
                two: form
            }
            constructor(){
                super({
                    data: [{abc: 123}]
                })
            }
        }

        const m = new NewCollectionModel()

        // works
        m.repos.one
        m.repos.two
        m.forms.one
        m.forms.two

        class NewCollectionModel2 extends CollectionModel<{abc: number}[], BaseRepo, FormModel>{
            constructor(){
                super({
                    data: [{abc: 123}],
                    repos: repo,
                    forms: form
                })
            }
        }

        const m2 = new NewCollectionModel2()

        // works
        m2.repos.main
        m2.forms.main

    })
})