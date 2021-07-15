import { initConfig, nestedKeys } from "../src/helpers"


test('test initConfig', ()=>{
    expect(initConfig({hello: 123, test: 123}, {hello: 456, world: "abc"})).toStrictEqual({
        hello: 456,
        test: 123,
        world: "abc"
    })
})


test('test nestedKeys', ()=>{
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

