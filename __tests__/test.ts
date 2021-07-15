import { BaseDataModel, MockRepository, BaseDataCollectionModel } from "../src"

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

const test = async () => {
    const repo = new MockRepository({data: [{abc: 123}, {xyz: 123}]})
    const model = new BaseDataCollectionModel({collections: ChildDataModel, repos: repo, async: true}) 
    await model.load()
    console.log(model.collection[0].repo.state)
    console.log("123")
}

test()
