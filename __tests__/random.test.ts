import { BaseDataCollectionModel, MockRepository, BaseDataModel } from "../src"


const repoTest = new BaseDataModel({
    repos: {
        main: new MockRepository({data: {abc: 123}}),
        test2: new MockRepository({data: {abc: 123}}),
    }
})


console.log(repoTest.repos)


repoTest.loadRepos({
    main: new MockRepository({data: {abc: 123}}),
    test: new MockRepository({data: {abc: 456}})
})

repoTest.repos


const repoTest2 = new BaseDataModel({
    repos: new MockRepository({data: {abc: 123}})
})
