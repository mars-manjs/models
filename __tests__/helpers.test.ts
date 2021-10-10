import { CollectionModel, Model } from "../src"
import { initConfig, nestedKeys } from "../src/helpers"


test('test initConfig', () => {
    expect(initConfig({ hello: 123, test: 123 }, { hello: 456, world: "abc" })).toStrictEqual({
        hello: 456,
        test: 123,
        world: "abc"
    })
})


test('test nestedKeys', () => {
    expect(nestedKeys({
        hello: {
            world: 123
        },
        foo: 123,
        bar: {
            foo: {
                bar: {
                    foo: 123
                }
            }
        }
    })).toStrictEqual(["hello.world", "foo", "bar.foo.bar.foo"])
})

describe('Collection', () => {
    interface data_i {
        id: number
    }
    class ChildModel extends Model<data_i>{

    }
    const model = new CollectionModel<data_i[]>({
        data: [{ id: 123 }, { id: 456 }, { id: 456 }],
        collections: ChildModel
    })
    test('map', async ()=> {
        await model.load()
        let count = 0
        model.map((d, i)=>{
            count += 1
            expect(d).toBe(model.collection.models[i])
        })
        expect(count).toBe(3)
    })

    test('filter', async () => {
        await model.load()

        let c = model.collection.filter((c) => {
            return c.data.id == 456
        })

        expect(c[0].data.id).toBe(456)
        expect(c[1].data.id).toBe(456)
        expect(c.length).toBe(2)

        c = model.collection.filter((c) => {
            return c.data.id == 123
        })
        expect(c[0].data.id).toBe(123)
        expect(c.length).toBe(1)
    })


})