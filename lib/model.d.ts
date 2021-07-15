import { BaseRepository } from "./repo";
import { state_t, repoMainMap_i, formMainMap_i, repoConfig, formConfig } from "./types";
import { BaseFormModel } from "./forms";
import { Children, Collections, Collection } from ".";
import { BaseModel } from "./base";
declare type modelClass = new (...args: any[]) => BaseDataModel;
interface child_i {
    key: string;
    model: modelClass;
}
interface BaseDataModelConfig_i {
    data?: any;
    repos?: repoConfig;
    forms?: formConfig;
    async?: boolean;
    children?: modelClass | {
        [key: string]: child_i;
    };
    parent?: BaseDataModel;
    parentCollection?: Collection;
}
export declare class BaseDataModel extends BaseModel {
    /**
     * BaseDataModel implements the base functionality of BaseDataItemModel and BaseDataCollectionModel
     */
    asyncState: state_t;
    config: BaseDataCollectionModelConfig_i;
    _repos: repoMainMap_i;
    _forms: formMainMap_i;
    _children: Children;
    _data: any;
    parent?: BaseDataModel;
    parentCollection?: Collection;
    constructor(config: BaseDataModelConfig_i);
    get repo(): BaseRepository;
    get repos(): repoMainMap_i;
    set repo(repo: BaseRepository);
    set repos(repos: repoMainMap_i);
    get form(): BaseFormModel;
    get forms(): formMainMap_i;
    set form(form: BaseFormModel);
    set forms(forms: formMainMap_i);
    get data(): any;
    preLoad: () => Promise<void>;
    postLoad: () => Promise<void>;
    load: () => Promise<void>;
    get state(): state_t;
    onChange(key: string): (e: any) => void;
    get payload(): any;
    get children(): {
        [key: string]: BaseDataModel;
    };
    get child(): BaseDataModel;
    get defaultData(): any;
    add: () => void;
    remove: () => void;
}
interface BaseDataCollectionModelConfig_i extends BaseDataModelConfig_i {
    collections?: modelClass | {
        [key: string]: child_i;
    };
}
export declare class BaseDataCollectionModel extends BaseDataModel {
    /**
     * BaseDataCollectionModel is for an array of BaseDataModel (Item or Collection)
     *
     * i.e. WikiSections, WikiPages
     *
     *
     * CHALLENGES:
     * - how to set the state of loaded only after having iterated through children
     * - async / sync collection
     */
    config: BaseDataCollectionModelConfig_i;
    _collections: Collections;
    constructor(config: BaseDataCollectionModelConfig_i);
    get collections(): {
        [key: string]: Collection;
    };
    get collection(): Collection;
    map(args: (value: any, index: number, array: BaseDataModel[]) => unknown): unknown[];
    load: () => Promise<void>;
    get payload(): any;
    add: () => void;
    remove: () => void;
}
export {};
