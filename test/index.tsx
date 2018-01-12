/**
 * Author: Charles.Tide<charlestide@vip.163.com>
 * Date: 2018/1/12.
 */

import PreLoader from '../src/index';
import { expect } from 'chai';
import * as _ from 'lodash';
import Maker from '../src/maker';
import * as fs from 'fs-extra';


describe('TestPreLoader',() => {

    let config = {
        path: {
            root: './src',
            exclude: ['test','node_modules'],
        },
        files: [{
            test: /\.ts$/,
            exclude: ['test']
        }],
        cacheFile: '../preloader.mapping.js',
    },
        maker = new Maker(config);

    maker.make();
    let loader = PreLoader.getInstance(config.cacheFile);



    it('test Get', function () {
        let indexLoader = loader.get('index');
        expect(_.isFunction(indexLoader)).to.true;
        expect(indexLoader()).to.eq(require('../src/index'))
    });

    it('test register', function () {
        loader.register('index');
    });

    fs.unlinkSync(config.cacheFile);
});