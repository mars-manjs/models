import { BaseModel } from "./base";
import { BaseDataCollectionModel } from "./model";
const d = BaseDataCollectionModel;
const d1 = new BaseDataCollectionModel({});
class test extends BaseDataCollectionModel {
}
console.log("test", test.prototype instanceof BaseModel);
if (d1 instanceof BaseModel) {
    console.log("test123");
}
//# sourceMappingURL=test.js.map