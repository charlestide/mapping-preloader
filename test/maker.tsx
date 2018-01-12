
import Marker from '../src/maker';
import { expect } from 'chai';
import 'mocha';
import * as fs from 'fs-extra';

describe('TestMaker',() => {

    const config = {
        path: {
            root: './src',
            except: ['test','node_modules'],
        },
        files: [{
            test: /\.ts$/,
            except: ['test']
        }],
        cacheFile: './preloader.mapping.json',
    },marker = new Marker(config);

    it('test isExceptDir', function () {
        expect(marker.isExceptDir('index.ts')).to.false;
        expect(marker.isExceptDir('test')).to.true;
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



