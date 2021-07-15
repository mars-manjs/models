import { BaseDataCollectionModel, MockRepository, BaseDataModel } from "../src"

const wikiSections = [
    {
        id: "123",
        name: "Wiki Section 123"
    },
    {
        id: "XYZ",
        name: "Wiki Section XYZ"
    },
]


const wikiPages = [
    {
        id: "123page1",
        name: "Page 1 in 123",
        body: "Hello World!"
    },
    {
        id: "123page2",
        name: "Page 2 in 123",
        body: "Goodbye World!"
    }
]



class WikiSectionsModel extends BaseDataCollectionModel{
    constructor(){
        super({
            children: WikiSectionModel,
            repos: new MockRepository({data: wikiSections})
        })
    }
}

class WikiSectionModel extends BaseDataModel{
    constructor(){
        super({

        })
    }
}


class WikiPagesModel extends BaseDataCollectionModel{
    constructor(){
        super({
            children: WikiPageModel,
            repos: new MockRepository({data: wikiPages})
        })
    }
}

class WikiPageModel extends BaseDataModel{
    constructor(){
        super({

        })
    }
}