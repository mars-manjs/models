# Meeting July 6th 2021 with Said


## Questions
### Q1
```ts
// this might not be possible to make typesafe
// could be implemented using Proxy
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
model.foo 
// should we just do this?
model.data.foo
// or make the user specify get functions 
class ExampleDataModel extends BaseDataModel{
    ...
    get foo(){

    }
}
```
> 
### Q2
```ts
// should we define things in the super call?
// it limits the ability to pass references of repos -> forms, forms -> repos...
class ExampleDataModel extends BaseDataModel{
    constructor(){
        super({
            repos: new APIRepository({path: "api.example.com/data"}),
            forms: new BaseFormModel({data: "... how do we get data from repository? ... no way to reference this.repo ..."}),
            async: true
        })
    }
}

// ALTERNATIVE
class ExampleDataModel extends BaseDataModel{
    constructor(){
        super({
            async: true
        })
        this.repo = new APIRepository({path: "api.example.com/data"}) 
        this.submit = new APIRepository({path: "api.example.com/data", method: "POST"})
        this.repos = {
            submit: this.submit
        }


        this.form = new BaseFormModel({
            data: this.repo.get(["cpuCount", "ram"])
        })

        this.submit.form = this.form
        // both of these 
        this.submit.payload = this.payload
    }

    payload = () => {
        return {
            ...this.form1.data,
            ...this.form2.data,
        }
    }
}
```
### Q3
```ts
// iterating over a collection (see README.md#Examples)
model.collections
/**
 Collections({
     main: Collection([
        ExampleDataItemModel(1),
        ExampleDataItemModel(2),
        ExampleDataItemModel(3)
     ])
 })
 **/

model.collections.map()

```

## 