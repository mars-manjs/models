# form
- data, is it in payload structure or form structure?
    - maybe there should be a config flag to denote this?
- form data, should it be converted by keys?

# repo
- does the repo need to have some sort of pub-sub for when data changes
    - if the data is from firestore.onSnapshot, will the model need to be notified when the data updates?
- periodic repo, wraps around a repo and updates it periodically
    - can have logic for whether to update or not
        - i.e. does window.location start with ...
- you should be able to not have a `main` repo
    - i.e. models that don't load data, but are used for Forms
- reset should reset to the initial data passed from the config
- APIRepo: error handle 404s
 
# models
- async
    - async: true - waits for all children / collections of a model to load before doing anything
    - async: false - doesn't load children / collections
    - something inbetween: loads all children / collections, but doesn't await it
- should probably look at the async of the child rather than the parent
    - that way you can have different async rules for each child / collection
- collection shouldn't attempt to load when repo is error

# model
- access childern by a name ?
    - i.e. {
        model: Model,
        name: 'wikiSections'
    }