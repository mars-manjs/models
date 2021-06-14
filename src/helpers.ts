import _ = require("lodash/fp");
// lodash fp provides immutable methods
// _.merge needs to not change the objects
export const nestedKeys = (obj) => {
    const keys = []
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object" && obj[key]) {
            nestedKeys(obj[key]).forEach(innerKey => {
                keys.push(`${key}.${innerKey}`)
            })
        } else {
            keys.push(key)
        }
    });
    return keys
}

export const initConfig = (defaultConfig, config) => {
    return _.merge(defaultConfig, config)
}



class _DynamicClass<T> {
    _data: T;
    constructor(data: T) {
        this._data = data;
        Object.keys(data).forEach((key) => Object.defineProperty(this, key, { get: () => this._data[key] }));
    }
}

export const DynamicClass = _DynamicClass as ({
    new <T>(data: T): _DynamicClass<T> & T
})
