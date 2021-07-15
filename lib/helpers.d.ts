import { BaseRepository, repoMainMap_i, BaseFormModel } from ".";
import { formMainMap_i, modelClass, child_i, main_i } from "./types";
import { BaseModel } from "./base";
import { BaseDataModel } from "./model";
export declare const nestedKeys: (obj: any) => any[];
export declare const initConfig: (defaultConfig: any, config: any) => any;
export declare const format: <T extends main_i<any>>(d: BaseModel | T) => T;
export declare class MapClass<T, CLSObj extends main_i<T>> {
    private _data;
    constructor(d?: T | CLSObj);
    get data(): CLSObj;
}
export declare class Forms extends MapClass<BaseFormModel, formMainMap_i> {
    constructor(d: BaseFormModel | formMainMap_i);
}
export declare class Repos extends MapClass<BaseRepository, repoMainMap_i> {
    constructor(d: BaseRepository | repoMainMap_i);
}
export declare class Children {
    parent: BaseDataModel;
    childrenConfig: {
        [key: string]: child_i;
    };
    children: {
        [key: string]: BaseDataModel;
    };
    constructor(parent: BaseDataModel, collections: modelClass | {
        [key: string]: child_i;
    });
    format: (collections: any) => {
        [key: string]: child_i;
    };
    load: () => Promise<void>;
}
export declare class Collections {
    model: BaseDataModel;
    collectionsConfig: {
        [key: string]: child_i;
    };
    collections: {
        [key: string]: Collection;
    };
    constructor(model: BaseDataModel, collections: modelClass | {
        [key: string]: child_i;
    });
    format: (collections: any) => {
        [key: string]: child_i;
    };
    load: () => Promise<void>;
}
export declare class Collection {
    private parent;
    private data;
    private modelObject;
    models: BaseDataModel[];
    constructor(parent: BaseDataModel, data: any, modelObject: child_i);
    map: (args: (value: any, index: number, array: BaseDataModel[]) => unknown) => unknown[];
    [Symbol.iterator](): Generator<BaseDataModel, void, unknown>;
    get length(): number;
    add: (data: any) => Promise<void>;
    remove: (model: BaseDataModel) => void;
    initModel: (data: any) => Promise<void>;
    load: () => Promise<void>;
}
/**
 *
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

 */
