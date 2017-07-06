'use strict';

if (typeof Promise !== 'function') {
    global.Promise = require('./polyfill.js');
}
