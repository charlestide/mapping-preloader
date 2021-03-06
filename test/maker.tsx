
import Marker from '../src/maker';
import { expect } from 'chai';
import 'mocha';
import * as fs from 'fs-extra';

describe('TestMaker',() => {

    const config = {
        path: {
            root: './src',
            exclude: ['test','node_modules'],
        },
        files: [{
            test: /\.ts$/,
            exclude: ['test']
        }],
        cacheFile: './preloader.mapping.js',
    },marker = new Marker(config);

    it('test isExcludeDir', function () {
        expect(marker.isExcludeDir('index.ts')).to.false;
        expect(marker.isExcludeDir('test')).to.true;
    });

    it('test parseFile', () => {
        marker.parseFile('index.ts');
        expect(marker.files.has('index')).to.true;
        expect(marker.files.get('index')).to.eq('index.ts');
        marker.files.clear();
    });

    it('test scanDir',() => {
        let rootPath = './src';
        marker.scanDir(rootPath);
        expect(marker.files.has('index')).to.true;
        expect(marker.files.get('index')).to.eq(rootPath+'/index.ts');
        expect(marker.files.has('maker')).to.true;
        expect(marker.files.get('maker')).to.eq(rootPath+'/maker.ts');
    });

    it('test output', function () {
        marker.output();
        expect(fs.pathExistsSync(config.cacheFile)).to.true;
        fs.unlinkSync(config.cacheFile);
    });

});



