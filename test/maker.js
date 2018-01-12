"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var maker_1 = require("../src/maker");
var chai_1 = require("chai");
require("mocha");
var fs = require("fs-extra");
describe('TestMaker', function () {
    var config = {
        path: {
            root: './src',
            except: ['test', 'node_modules'],
        },
        files: [{
                test: /\.ts$/,
                except: ['test']
            }],
        cacheFile: './preloader.mapping.json',
    }, marker = new maker_1.default(config);
    it('test isExceptDir', function () {
        chai_1.expect(marker.isExceptDir('index.ts')).to.false;
        chai_1.expect(marker.isExceptDir('test')).to.true;
    });
    it('test parseFile', function () {
        marker.parseFile('index.ts');
        chai_1.expect(marker.files.has('index')).to.true;
        chai_1.expect(marker.files.get('index')).to.eq('index.ts');
        marker.files.clear();
    });
    it('test scanDir', function () {
        var rootPath = './src';
        marker.scanDir(rootPath);
        chai_1.expect(marker.files.has('index')).to.true;
        chai_1.expect(marker.files.get('index')).to.eq(rootPath + '/index.ts');
        chai_1.expect(marker.files.has('maker')).to.true;
        chai_1.expect(marker.files.get('maker')).to.eq(rootPath + '/maker.ts');
    });
    it('test output', function () {
        marker.output();
        chai_1.expect(fs.pathExistsSync(config.cacheFile)).to.true;
        fs.unlinkSync(config.cacheFile);
    });
});
//# sourceMappingURL=maker.js.map