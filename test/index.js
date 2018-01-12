"use strict";
/**
 * Author: Charles.Tide<charlestide@vip.163.com>
 * Date: 2018/1/12.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../src/index");
var chai_1 = require("chai");
var _ = require("lodash");
var fs = require("fs-extra");
describe('TestPreLoader', function () {
    var loader = index_1.default.getInstance({
        files: [{
                test: /\.ts$/
            }]
    });
    it('test Get', function () {
        var indexLoader = loader.get('index');
        chai_1.expect(_.isFunction(indexLoader)).to.true;
        // expect(indexLoader()).to.eq(require('../src/index'))
    });
    it('test register', function () {
        loader.register('index');
    });
    fs.unlinkSync(loader.getMaker().getConfig().cacheFile);
});
//# sourceMappingURL=index.js.map