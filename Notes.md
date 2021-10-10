# October 9th 2021
`<Form form={form}>` should check for if `form == undefined` and not return children if it is  
# October 5th 2021
- added ability to pass empty config
```ts
const form  = new FormModel()
const model = new Model()
const repo = new BaseRepo()

```


# September 24th notes
1. considered add `submit: repo` to form, but figured that this couples form and repo too much.
 

# Meeting September 13th 2021 with Waleed
## onChange
```jsx
<input onChange={form.onChange("name")}>
```

## @mars-man/components
```jsx
<Form form={form}>
    <Input id="name"/>
</Form>
```



























## Collections
```ts

class MobxStore{
    constructor(){
        this.workspaces = new WorkspacesModel()
        this.workspaces.load()
    }
}



class WorkspacesModel extends CollectionModel{
    constructor(){
        super({
            repos: {
                main: new APIRepo({path: "/api/workspaces"}),
                delete: new APIRepo({path: "/api/workspaces", method: 'DELETE'}),
            },
            collections: WorkspaceModel
        })
    }
}


class WorkspaceModel extends Model{
    constructor(){
        super()
        this.repos = {
            main: new APIRepo({path: '/load'})
            update: new APIRepo({path: '/update', payload: this.payload, method: 'POST'})
        }
    }
}
```

## Children
- children that don't use any of the data of the parent
    - need to be implemented
    - AgoraCloud: workspace doesn't have any mention of deployments

## PubSub



```ts
const workspace = new WorkspaceModel()


// somewhere else in the code

workspace.onLoad.subscribe(()=>{
    alert("Workspace Loaded!")
})
```



# Meeting July 6th 2021 with Said
- autoload? you need to call `model.load()`, should we provide an autoload

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
class ExampleDataModel extends Model{
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
class ExampleDataModel extends Model{
    constructor(){
        super({
            repos: new APIRepo({path: "api.example.com/data"}),
            forms: new FormModel({data: "... how do we get data from repository? ... no way to reference this.repo ..."}),
            async: true
        })
    }
}

// ALTERNATIVE
class ExampleDataModel extends Model{
    constructor(){
        super({
            async: true
        })
        this.repo = new APIRepo({path: "api.example.com/data"}) 
        this.submit = new APIRepo({path: "api.example.com/data", method: "POST"})
        this.repos = {
            submit: this.submit
        }


        this.form = new FormModel({
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