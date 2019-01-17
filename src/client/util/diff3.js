"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var diff3_1 = __importDefault(require("diff3"));
var node_diff3_1 = require("node-diff3");
var merge = function (a, o, b) {
    var results = diff3_1.default(a, o, b);
    var conflict = results.some(function (r) { return r.conflict; });
    var result = results[0].ok;
    return { conflict: conflict, result: result };
};
function toArr(str) {
    return str.split('\n');
}
function fromArr(str) {
    return str && str.join('\n');
}
function compress(patch) {
    return patch.map(function (_a) {
        var _b = _a.file1, offset = _b.offset, length = _b.length, chunk = _a.file2.chunk;
        return ({
            a: [offset, length],
            b: chunk,
        });
    });
}
function decompress(patch) {
    return patch.map(function (_a) {
        var a = _a.a, b = _a.b;
        return ({
            file1: {
                offset: a[0],
                length: a[1],
            },
            file2: {
                chunk: b,
            },
        });
    });
}
exports.applyPatch = function (a, p) {
    return fromArr(node_diff3_1.patch(toArr(a), decompress(p)));
};
exports.merge3 = function (a, o, b) {
    var _a = merge(toArr(a), toArr(o), toArr(b)), conflict = _a.conflict, result = _a.result;
    return conflict ? null : fromArr(result);
};
exports.createPatch = function (a, b) {
    return compress(node_diff3_1.stripPatch(node_diff3_1.diffPatch(toArr(a), toArr(b))));
};
//# sourceMappingURL=diff3.js.map