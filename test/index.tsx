/**
 * Author: Charles.Tide<charlestide@vip.163.com>
 * Date: 2018/1/12.
 */

import PreLoader from '../src/index';
import { expect } from 'chai';
import * as _ from 'lodash';
import * as fs from 'fs-extra';


describe('TestPreLoader',() => {

    let loader = PreLoader.getInstance({
        files: [{
            test: /\.ts$/
        }]
    });

    it('test Get', function () {
        let indexLoader = loader.get('index');
        expect(_.isFunction(indexLoader)).to.true;
        // expect(indexLoader()).to.eq(require('../src/index'))
    });

    it('test register', function () {
        loader.register('index');
    });

    fs.unlinkSync(loader.getMaker().getConfig().cacheFile);

});