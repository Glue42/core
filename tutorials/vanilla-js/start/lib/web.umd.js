(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.web = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var version = "1.0.0";

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    // Found this seed-based random generator somewhere
    // Based on The Central Randomizer 1.3 (C) 1997 by Paul Houle (houle@msc.cornell.edu)

    var seed = 1;

    /**
     * return a random number based on a seed
     * @param seed
     * @returns {number}
     */
    function getNextValue() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed/(233280.0);
    }

    function setSeed(_seed_) {
        seed = _seed_;
    }

    var randomFromSeed = {
        nextValue: getNextValue,
        seed: setSeed
    };

    var ORIGINAL = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
    var alphabet;
    var previousSeed;

    var shuffled;

    function reset() {
        shuffled = false;
    }

    function setCharacters(_alphabet_) {
        if (!_alphabet_) {
            if (alphabet !== ORIGINAL) {
                alphabet = ORIGINAL;
                reset();
            }
            return;
        }

        if (_alphabet_ === alphabet) {
            return;
        }

        if (_alphabet_.length !== ORIGINAL.length) {
            throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. You submitted ' + _alphabet_.length + ' characters: ' + _alphabet_);
        }

        var unique = _alphabet_.split('').filter(function(item, ind, arr){
           return ind !== arr.lastIndexOf(item);
        });

        if (unique.length) {
            throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. These characters were not unique: ' + unique.join(', '));
        }

        alphabet = _alphabet_;
        reset();
    }

    function characters(_alphabet_) {
        setCharacters(_alphabet_);
        return alphabet;
    }

    function setSeed$1(seed) {
        randomFromSeed.seed(seed);
        if (previousSeed !== seed) {
            reset();
            previousSeed = seed;
        }
    }

    function shuffle() {
        if (!alphabet) {
            setCharacters(ORIGINAL);
        }

        var sourceArray = alphabet.split('');
        var targetArray = [];
        var r = randomFromSeed.nextValue();
        var characterIndex;

        while (sourceArray.length > 0) {
            r = randomFromSeed.nextValue();
            characterIndex = Math.floor(r * sourceArray.length);
            targetArray.push(sourceArray.splice(characterIndex, 1)[0]);
        }
        return targetArray.join('');
    }

    function getShuffled() {
        if (shuffled) {
            return shuffled;
        }
        shuffled = shuffle();
        return shuffled;
    }

    /**
     * lookup shuffled letter
     * @param index
     * @returns {string}
     */
    function lookup(index) {
        var alphabetShuffled = getShuffled();
        return alphabetShuffled[index];
    }

    function get () {
      return alphabet || ORIGINAL;
    }

    var alphabet_1 = {
        get: get,
        characters: characters,
        seed: setSeed$1,
        lookup: lookup,
        shuffled: getShuffled
    };

    var crypto = typeof window === 'object' && (window.crypto || window.msCrypto); // IE 11 uses window.msCrypto

    var randomByte;

    if (!crypto || !crypto.getRandomValues) {
        randomByte = function(size) {
            var bytes = [];
            for (var i = 0; i < size; i++) {
                bytes.push(Math.floor(Math.random() * 256));
            }
            return bytes;
        };
    } else {
        randomByte = function(size) {
            return crypto.getRandomValues(new Uint8Array(size));
        };
    }

    var randomByteBrowser = randomByte;

    // This file replaces `format.js` in bundlers like webpack or Rollup,
    // according to `browser` config in `package.json`.

    var format_browser = function (random, alphabet, size) {
      // We can’t use bytes bigger than the alphabet. To make bytes values closer
      // to the alphabet, we apply bitmask on them. We look for the closest
      // `2 ** x - 1` number, which will be bigger than alphabet size. If we have
      // 30 symbols in the alphabet, we will take 31 (00011111).
      // We do not use faster Math.clz32, because it is not available in browsers.
      var mask = (2 << Math.log(alphabet.length - 1) / Math.LN2) - 1;
      // Bitmask is not a perfect solution (in our example it will pass 31 bytes,
      // which is bigger than the alphabet). As a result, we will need more bytes,
      // than ID size, because we will refuse bytes bigger than the alphabet.

      // Every hardware random generator call is costly,
      // because we need to wait for entropy collection. This is why often it will
      // be faster to ask for few extra bytes in advance, to avoid additional calls.

      // Here we calculate how many random bytes should we call in advance.
      // It depends on ID length, mask / alphabet size and magic number 1.6
      // (which was selected according benchmarks).

      // -~f => Math.ceil(f) if n is float number
      // -~i => i + 1 if n is integer number
      var step = -~(1.6 * mask * size / alphabet.length);
      var id = '';

      while (true) {
        var bytes = random(step);
        // Compact alternative for `for (var i = 0; i < step; i++)`
        var i = step;
        while (i--) {
          // If random byte is bigger than alphabet even after bitmask,
          // we refuse it by `|| ''`.
          id += alphabet[bytes[i] & mask] || '';
          // More compact than `id.length + 1 === size`
          if (id.length === +size) return id
        }
      }
    };

    function generate(number) {
        var loopCounter = 0;
        var done;

        var str = '';

        while (!done) {
            str = str + format_browser(randomByteBrowser, alphabet_1.get(), 1);
            done = number < (Math.pow(16, loopCounter + 1 ) );
            loopCounter++;
        }
        return str;
    }

    var generate_1 = generate;

    // Ignore all milliseconds before a certain time to reduce the size of the date entropy without sacrificing uniqueness.
    // This number should be updated every year or so to keep the generated id short.
    // To regenerate `new Date() - 0` and bump the version. Always bump the version!
    var REDUCE_TIME = 1567752802062;

    // don't change unless we change the algos or REDUCE_TIME
    // must be an integer and less than 16
    var version$1 = 7;

    // Counter is used when shortid is called multiple times in one second.
    var counter;

    // Remember the last time shortid was called in case counter is needed.
    var previousSeconds;

    /**
     * Generate unique id
     * Returns string id
     */
    function build(clusterWorkerId) {
        var str = '';

        var seconds = Math.floor((Date.now() - REDUCE_TIME) * 0.001);

        if (seconds === previousSeconds) {
            counter++;
        } else {
            counter = 0;
            previousSeconds = seconds;
        }

        str = str + generate_1(version$1);
        str = str + generate_1(clusterWorkerId);
        if (counter > 0) {
            str = str + generate_1(counter);
        }
        str = str + generate_1(seconds);
        return str;
    }

    var build_1 = build;

    function isShortId(id) {
        if (!id || typeof id !== 'string' || id.length < 6 ) {
            return false;
        }

        var nonAlphabetic = new RegExp('[^' +
          alphabet_1.get().replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&') +
        ']');
        return !nonAlphabetic.test(id);
    }

    var isValid = isShortId;

    var lib = createCommonjsModule(function (module) {





    // if you are using cluster or multiple servers use this to make each instance
    // has a unique value for worker
    // Note: I don't know if this is automatically set when using third
    // party cluster solutions such as pm2.
    var clusterWorkerId =  0;

    /**
     * Set the seed.
     * Highly recommended if you don't want people to try to figure out your id schema.
     * exposed as shortid.seed(int)
     * @param seed Integer value to seed the random alphabet.  ALWAYS USE THE SAME SEED or you might get overlaps.
     */
    function seed(seedValue) {
        alphabet_1.seed(seedValue);
        return module.exports;
    }

    /**
     * Set the cluster worker or machine id
     * exposed as shortid.worker(int)
     * @param workerId worker must be positive integer.  Number less than 16 is recommended.
     * returns shortid module so it can be chained.
     */
    function worker(workerId) {
        clusterWorkerId = workerId;
        return module.exports;
    }

    /**
     *
     * sets new characters to use in the alphabet
     * returns the shuffled alphabet
     */
    function characters(newCharacters) {
        if (newCharacters !== undefined) {
            alphabet_1.characters(newCharacters);
        }

        return alphabet_1.shuffled();
    }

    /**
     * Generate unique id
     * Returns string id
     */
    function generate() {
      return build_1(clusterWorkerId);
    }

    // Export all other functions as properties of the generate function
    module.exports = generate;
    module.exports.generate = generate;
    module.exports.seed = seed;
    module.exports.worker = worker;
    module.exports.characters = characters;
    module.exports.isValid = isValid;
    });
    var lib_1 = lib.generate;
    var lib_2 = lib.seed;
    var lib_3 = lib.worker;
    var lib_4 = lib.characters;
    var lib_5 = lib.isValid;

    var shortid = lib;

    var RemoteWebWindow = (function () {
        function RemoteWebWindow(id, name, control, windows) {
            this.id = id;
            this.name = name;
            this.control = control;
            this.windows = windows;
        }
        RemoteWebWindow.prototype.getURL = function () {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, this.callControl("getURL", {})];
                        case 1:
                            result = _b.sent();
                            return [2, (_a = result === null || result === void 0 ? void 0 : result.returned) === null || _a === void 0 ? void 0 : _a._value];
                    }
                });
            });
        };
        RemoteWebWindow.prototype.moveResize = function (bounds) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.callControl("moveResize", bounds, true)];
                        case 1:
                            _a.sent();
                            return [2, this];
                    }
                });
            });
        };
        RemoteWebWindow.prototype.close = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2, new Promise(function (resolve, reject) {
                            var done = function () {
                                if (timeout) {
                                    clearTimeout(timeout);
                                }
                                if (un) {
                                    un();
                                }
                            };
                            var un = _this.windows.onWindowRemoved(function (w) {
                                if (w.id === _this.id) {
                                    resolve(_this);
                                    done();
                                }
                            });
                            var timeout = setTimeout(function () {
                                reject("can not close window - probably not opened by your window");
                                done();
                            }, 1000);
                            _this.callControl("close", {}, true)
                                .catch(function () {
                            });
                        })];
                });
            });
        };
        RemoteWebWindow.prototype.setTitle = function (title) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (typeof title === "string") {
                                title = { title: title };
                            }
                            return [4, this.callControl("setTitle", title, true)];
                        case 1:
                            _a.sent();
                            return [2, this];
                    }
                });
            });
        };
        RemoteWebWindow.prototype.resizeTo = function (width, height) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.callControl("moveResize", { width: width, height: height }, true)];
                        case 1:
                            _a.sent();
                            return [2, this];
                    }
                });
            });
        };
        RemoteWebWindow.prototype.moveTo = function (top, left) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.callControl("moveResize", { top: top, left: left }, true)];
                        case 1:
                            _a.sent();
                            return [2, this];
                    }
                });
            });
        };
        RemoteWebWindow.prototype.getBounds = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.callControl("getBounds", {})];
                        case 1:
                            result = _a.sent();
                            return [2, result.returned];
                    }
                });
            });
        };
        RemoteWebWindow.prototype.getContext = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.callControl("getContext", {})];
                        case 1:
                            result = _a.sent();
                            return [2, result.returned];
                    }
                });
            });
        };
        RemoteWebWindow.prototype.getTitle = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.callControl("getTitle", {})];
                        case 1:
                            result = _a.sent();
                            return [2, result.returned._value];
                    }
                });
            });
        };
        RemoteWebWindow.prototype.onContextUpdated = function (callback) {
            throw new Error("Method not implemented.");
        };
        RemoteWebWindow.prototype.updateContext = function (context) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.callControl("updateContext", context, true)];
                        case 1:
                            _a.sent();
                            return [2, this];
                    }
                });
            });
        };
        RemoteWebWindow.prototype.setContext = function (context) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.callControl("setContext", context, true)];
                        case 1:
                            _a.sent();
                            return [2, this];
                    }
                });
            });
        };
        RemoteWebWindow.prototype.callControl = function (command, args, skipResult) {
            if (skipResult === void 0) { skipResult = false; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.control.send({ command: command, domain: "windows", args: args, skipResult: skipResult }, { windowId: this.id })];
                        case 1: return [2, _a.sent()];
                    }
                });
            });
        };
        return RemoteWebWindow;
    }());

    var Control = (function () {
        function Control() {
            this.callbacks = {};
        }
        Control.prototype.start = function (interop, logger) {
            var _this = this;
            this.interop = interop;
            this.logger = logger;
            this.interop.register(Control.CONTROL_METHOD, function (arg) { return __awaiter(_this, void 0, void 0, function () {
                var command, result, callback;
                return __generator(this, function (_a) {
                    command = arg;
                    logger.trace("received control command " + JSON.stringify(command));
                    if (command.domain === "windows") {
                        if (!this.myWindow) {
                            return [2];
                        }
                        result = this.myWindow[command.command].call(this.myWindow, command.args);
                        if (command.skipResult) {
                            return [2, {}];
                        }
                        else {
                            return [2, result];
                        }
                    }
                    if (command.domain === "layouts") {
                        callback = this.callbacks[command.domain];
                        if (callback) {
                            callback(command);
                        }
                    }
                    return [2];
                });
            }); });
        };
        Control.prototype.send = function (command, target) {
            if (!this.interop) {
                throw new Error("Control not started");
            }
            this.logger.info("sending control command " + JSON.stringify(command) + " to " + JSON.stringify(target) + "}");
            return this.interop.invoke(Control.CONTROL_METHOD, command, target);
        };
        Control.prototype.subscribe = function (domain, callback) {
            this.callbacks[domain] = callback;
        };
        Control.prototype.setLocalWindow = function (window) {
            this.myWindow = window;
        };
        Control.CONTROL_METHOD = "GC.Control";
        return Control;
    }());

    function createRegistry(options) {
        if (options && options.errorHandling
            && typeof options.errorHandling !== "function"
            && options.errorHandling !== "log"
            && options.errorHandling !== "silent"
            && options.errorHandling !== "throw") {
            throw new Error("Invalid options passed to createRegistry. Prop errorHandling should be [\"log\" | \"silent\" | \"throw\" | (err) => void], but " + typeof options.errorHandling + " was passed");
        }
        var _userErrorHandler = options && typeof options.errorHandling === "function" && options.errorHandling;
        var callbacks = {};
        function add(key, callback) {
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey) {
                callbacksForKey = [];
                callbacks[key] = callbacksForKey;
            }
            callbacksForKey.push(callback);
            return function () {
                var allForKey = callbacks[key];
                if (!allForKey) {
                    return;
                }
                allForKey = allForKey.reduce(function (acc, element, index) {
                    if (!(element === callback && acc.length === index)) {
                        acc.push(element);
                    }
                    return acc;
                }, []);
                callbacks[key] = allForKey;
            };
        }
        function execute(key) {
            var argumentsArr = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                argumentsArr[_i - 1] = arguments[_i];
            }
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey || callbacksForKey.length === 0) {
                return [];
            }
            var results = [];
            callbacksForKey.forEach(function (callback) {
                try {
                    var result = callback.apply(undefined, argumentsArr);
                    results.push(result);
                }
                catch (err) {
                    results.push(undefined);
                    _handleError(err, key);
                }
            });
            return results;
        }
        function _handleError(exceptionArtifact, key) {
            var errParam = exceptionArtifact instanceof Error ? exceptionArtifact : new Error(exceptionArtifact);
            if (_userErrorHandler) {
                _userErrorHandler(errParam);
                return;
            }
            var msg = "[ERROR] callback-registry: User callback for key \"" + key + "\" failed: " + errParam.stack;
            if (options) {
                switch (options.errorHandling) {
                    case "log":
                        return console.error(msg);
                    case "silent":
                        return;
                    case "throw":
                        throw new Error(msg);
                }
            }
            console.error(msg);
        }
        function clear() {
            callbacks = {};
        }
        function clearKey(key) {
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey) {
                return;
            }
            delete callbacks[key];
        }
        return {
            add: add,
            execute: execute,
            clear: clear,
            clearKey: clearKey
        };
    }
    createRegistry.default = createRegistry;
    var lib$1 = createRegistry;

    var LocalWebWindow = (function () {
        function LocalWebWindow(id, name, window, control, interop) {
            this.id = id;
            this.name = name;
            this.window = window;
            this.control = control;
            this.interop = interop;
            this.context = {};
            this.registry = lib$1();
            control.setLocalWindow(this);
        }
        LocalWebWindow.prototype.getURL = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, this.window.location.href];
                });
            });
        };
        LocalWebWindow.prototype.moveResize = function (_a) {
            var left = _a.left, top = _a.top, width = _a.width, height = _a.height;
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    left = left !== null && left !== void 0 ? left : window.screenLeft;
                    top = top !== null && top !== void 0 ? top : window.screenTop;
                    width = width !== null && width !== void 0 ? width : window.outerWidth;
                    height = height !== null && height !== void 0 ? height : window.outerHeight;
                    window.moveTo(left, top);
                    window.resizeTo(width, height);
                    return [2, this];
                });
            });
        };
        LocalWebWindow.prototype.close = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!this.parent) {
                        throw new Error("can not close window if it's not opened by script");
                    }
                    try {
                        window.close();
                    }
                    catch (_b) {
                        console.log("what");
                    }
                    return [2, this];
                });
            });
        };
        LocalWebWindow.prototype.setTitle = function (title) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (typeof title === "object" && title !== null) {
                        title = title.title;
                    }
                    document.title = title;
                    return [2, this];
                });
            });
        };
        LocalWebWindow.prototype.resizeTo = function (width, height) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.moveResize({ width: width, height: height })];
                        case 1:
                            _a.sent();
                            return [2, this];
                    }
                });
            });
        };
        LocalWebWindow.prototype.moveTo = function (top, left) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.moveResize({ top: top, left: left })];
                        case 1:
                            _a.sent();
                            return [2, this];
                    }
                });
            });
        };
        LocalWebWindow.prototype.getBounds = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, this.getBoundsSync()];
                });
            });
        };
        LocalWebWindow.prototype.getContext = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, this.getContextSync()];
                });
            });
        };
        LocalWebWindow.prototype.getContextSync = function () {
            return this.context;
        };
        LocalWebWindow.prototype.getTitle = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, this.window.document.title];
                });
            });
        };
        LocalWebWindow.prototype.onContextUpdated = function (callback) {
            return this.registry.add("context-updated", callback);
        };
        LocalWebWindow.prototype.updateContext = function (context) {
            var oldContext = this.context;
            this.context = Object.assign({}, context, oldContext);
            this.registry.execute("context-updated", context, oldContext);
            return Promise.resolve(this);
        };
        LocalWebWindow.prototype.setContext = function (context) {
            return __awaiter(this, void 0, void 0, function () {
                var oldContext;
                return __generator(this, function (_a) {
                    oldContext = this.context;
                    this.context = Object.assign({}, context);
                    this.registry.execute("context-updated", context, oldContext);
                    return [2, Promise.resolve(this)];
                });
            });
        };
        LocalWebWindow.prototype.getBoundsSync = function () {
            return {
                left: this.window.screenLeft,
                top: this.window.screenTop,
                width: this.window.outerWidth,
                height: this.window.outerHeight
            };
        };
        return LocalWebWindow;
    }());

    var ChildWebWindow = (function (_super) {
        __extends(ChildWebWindow, _super);
        function ChildWebWindow(window, id, name, control, windows) {
            var _this = _super.call(this, id, name, control, windows) || this;
            _this.window = window;
            _this.id = id;
            _this.name = name;
            return _this;
        }
        return ChildWebWindow;
    }(RemoteWebWindow));

    var registerChildStartupContext = function (interop, parent, id, name, options) {
        var _a;
        var methodName = createMethodName(id);
        var startingContext = {
            context: (_a = options === null || options === void 0 ? void 0 : options.context) !== null && _a !== void 0 ? _a : {},
            name: name,
            parent: parent
        };
        interop.register(methodName, function () { return startingContext; });
    };
    var initStartupContext = function (my, interop) { return __awaiter(void 0, void 0, void 0, function () {
        var methodName, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    methodName = createMethodName(my.id);
                    if (!interop.methods().find(function (m) { return m.name === methodName; })) return [3, 2];
                    return [4, interop.invoke(methodName)];
                case 1:
                    result = _a.sent();
                    if (my) {
                        my.setContext(result.returned.context);
                        my.name = result.returned.name;
                        my.parent = result.returned.parent;
                    }
                    _a.label = 2;
                case 2: return [2];
            }
        });
    }); };
    var createMethodName = function (id) { return "\"GC.Wnd.\"" + id; };

    var Windows = (function () {
        function Windows(interop, control) {
            this.interop = interop;
            this.control = control;
            this.registry = lib$1();
            this.childWindows = [];
            var id = interop.instance.windowId;
            var name = "document.title (" + shortid() + ")";
            this.myWindow = new LocalWebWindow(id, name, window, this.control, this.interop);
            this.trackWindowsLifetime();
        }
        Windows.prototype.list = function () {
            var _this = this;
            var method = this.interop.methods({ name: Control.CONTROL_METHOD })[0];
            if (!method) {
                return [];
            }
            var servers = method.getServers ? method.getServers() : [];
            return servers.reduce(function (prev, current) {
                var remoteWindow = _this.remoteFromServer(current);
                if (remoteWindow) {
                    prev.push(remoteWindow);
                }
                return prev;
            }, []);
        };
        Windows.prototype.findById = function (id) {
            return this.list().find(function (w) { return w.id === id; });
        };
        Windows.prototype.my = function () {
            return this.myWindow;
        };
        Windows.prototype.open = function (name, url, options) {
            var _a, _b, _c, _d, _e;
            return __awaiter(this, void 0, void 0, function () {
                var width, height, left, top, id, relativeWindowId_1, relativeWindow, relativeWindowBounds, relativeDir, newBounds, optionsString, newWindow, remoteWindow;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            width = (_a = options === null || options === void 0 ? void 0 : options.width) !== null && _a !== void 0 ? _a : 400;
                            height = (_b = options === null || options === void 0 ? void 0 : options.height) !== null && _b !== void 0 ? _b : 400;
                            left = (_c = options === null || options === void 0 ? void 0 : options.left) !== null && _c !== void 0 ? _c : window.screen.availWidth - window.screenLeft;
                            top = (_d = options === null || options === void 0 ? void 0 : options.top) !== null && _d !== void 0 ? _d : 0;
                            id = shortid();
                            registerChildStartupContext(this.interop, this.my().id, id, name, options);
                            if (!(options === null || options === void 0 ? void 0 : options.relativeTo)) return [3, 2];
                            relativeWindowId_1 = options.relativeTo;
                            relativeWindow = this.list().find(function (w) { return w.id === relativeWindowId_1; });
                            if (!relativeWindow) return [3, 2];
                            return [4, relativeWindow.getBounds()];
                        case 1:
                            relativeWindowBounds = _f.sent();
                            relativeDir = (_e = options.relativeDirection) !== null && _e !== void 0 ? _e : "right";
                            newBounds = this.getRelativeBounds({ width: width, height: height, left: left, top: top }, relativeWindowBounds, relativeDir);
                            width = newBounds.width;
                            height = newBounds.height;
                            left = newBounds.left;
                            top = newBounds.top;
                            _f.label = 2;
                        case 2:
                            optionsString = "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top + ",scrollbars=none,location=no,status=no,menubar=no";
                            newWindow = window.open(url, id, optionsString);
                            if (!newWindow) {
                                throw new Error("failed to open a window with url=" + url + " and options=" + optionsString);
                            }
                            newWindow.moveTo(left, top);
                            newWindow.resizeTo(width, height);
                            remoteWindow = new ChildWebWindow(newWindow, id, name, this.control, this);
                            this.childWindows.push(remoteWindow);
                            return [2, remoteWindow];
                    }
                });
            });
        };
        Windows.prototype.onWindowAdded = function (callback) {
            return this.registry.add("window-added", callback);
        };
        Windows.prototype.onWindowRemoved = function (callback) {
            return this.registry.add("window-removed", callback);
        };
        Windows.prototype.getChildWindows = function () {
            this.childWindows = this.childWindows.filter(function (cw) { return !cw.window.closed; });
            return this.childWindows;
        };
        Windows.prototype.remoteFromServer = function (server) {
            var _a;
            if (!server.windowId) {
                return undefined;
            }
            return new RemoteWebWindow(server.windowId, (_a = server.application) !== null && _a !== void 0 ? _a : "", this.control, this);
        };
        Windows.prototype.getRelativeBounds = function (rect, relativeTo, relativeDirection) {
            var edgeDistance = 0;
            switch (relativeDirection) {
                case "bottom":
                    return {
                        left: relativeTo.left,
                        top: relativeTo.top + relativeTo.height + edgeDistance,
                        width: relativeTo.width,
                        height: rect.height
                    };
                case "top":
                    return {
                        left: relativeTo.left,
                        top: relativeTo.top - rect.height - edgeDistance,
                        width: relativeTo.width,
                        height: rect.height
                    };
                case "right":
                    return {
                        left: relativeTo.left + relativeTo.width + edgeDistance,
                        top: relativeTo.top,
                        width: rect.width,
                        height: relativeTo.height
                    };
                case "left":
                    return {
                        left: relativeTo.left - rect.width - edgeDistance,
                        top: relativeTo.top,
                        width: rect.width,
                        height: relativeTo.height
                    };
            }
            throw new Error("invalid relativeDirection");
        };
        Windows.prototype.trackWindowsLifetime = function () {
            var _this = this;
            this.interop.serverMethodAdded(function (_a) {
                var server = _a.server, method = _a.method;
                if (method.name !== Control.CONTROL_METHOD) {
                    return;
                }
                var remoteWindow = _this.remoteFromServer(server);
                if (remoteWindow) {
                    _this.registry.execute("window-added", remoteWindow);
                }
            });
            this.interop.serverRemoved(function (server) {
                var remoteWindow = _this.remoteFromServer(server);
                if (remoteWindow) {
                    _this.registry.execute("window-removed", remoteWindow);
                }
            });
        };
        return Windows;
    }());

    var LocalStorage = (function () {
        function LocalStorage() {
        }
        LocalStorage.prototype.getAll = function () {
            var obj = this.getObjectFromLocalStorage();
            return Object.values(obj);
        };
        LocalStorage.prototype.get = function (name, type) {
            var obj = this.getObjectFromLocalStorage();
            var key = this.getKey(name, type);
            return obj[key];
        };
        LocalStorage.prototype.save = function (layout) {
            var obj = this.getObjectFromLocalStorage();
            var key = this.getKey(layout.name, layout.type);
            obj[key] = layout;
            this.setObjectToLocalStorage(obj);
            return Promise.resolve(layout);
        };
        LocalStorage.prototype.remove = function (name, type) {
            var obj = this.getObjectFromLocalStorage();
            var key = this.getKey(name, type);
            delete obj[key];
            return Promise.resolve();
        };
        LocalStorage.prototype.clear = function () {
            this.setObjectToLocalStorage({});
            return Promise.resolve();
        };
        LocalStorage.prototype.getObjectFromLocalStorage = function () {
            var values = window.localStorage.getItem(LocalStorage.KEY);
            if (values) {
                return JSON.parse(values);
            }
            return {};
        };
        LocalStorage.prototype.setObjectToLocalStorage = function (obj) {
            window.localStorage.setItem(LocalStorage.KEY, JSON.stringify(obj));
        };
        LocalStorage.prototype.getKey = function (name, type) {
            return type + "_" + name;
        };
        LocalStorage.KEY = "G0_layouts";
        return LocalStorage;
    }());

    var Layouts = (function () {
        function Layouts(windows, interop, logger, control, config) {
            var _a, _b;
            this.windows = windows;
            this.interop = interop;
            this.logger = logger;
            this.control = control;
            this.storage = new LocalStorage();
            this.registerRequestMethods();
            this.control.subscribe("layouts", this.handleControlMessage.bind(this));
            this.autoSaveContext = (_b = (_a = config === null || config === void 0 ? void 0 : config.layouts) === null || _a === void 0 ? void 0 : _a.autoSaveWindowContext) !== null && _b !== void 0 ? _b : false;
        }
        Layouts.prototype.list = function () {
            return this.storage.getAll();
        };
        Layouts.prototype.save = function (layoutOptions) {
            return __awaiter(this, void 0, void 0, function () {
                var openedWindows, components;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!layoutOptions.name) {
                                return [2, Promise.reject("missing name for layout " + JSON.stringify(layoutOptions))];
                            }
                            openedWindows = this.windows.getChildWindows().map(function (w) { return w.id; });
                            return [4, this.getRemoteWindowsInfo(openedWindows)];
                        case 1:
                            components = _a.sent();
                            components.push(this.getLocalLayoutComponent(layoutOptions.context, true));
                            return [2, this.storage.save({
                                    type: "Global",
                                    name: layoutOptions.name,
                                    components: components,
                                    context: layoutOptions.context || {},
                                    metadata: layoutOptions.metadata || {}
                                })];
                    }
                });
            });
        };
        Layouts.prototype.restore = function (options) {
            return __awaiter(this, void 0, void 0, function () {
                var layout;
                var _this = this;
                return __generator(this, function (_a) {
                    layout = this.list().find(function (l) { return l.name === options.name && l.type === "Global"; });
                    if (!layout) {
                        throw new Error("can not find layout with name " + options.name);
                    }
                    layout.components.forEach(function (c) {
                        if (c.type === "window") {
                            var state = c.state;
                            if (state.main) {
                                return;
                            }
                            var newWindowOptions = __assign(__assign({}, state.bounds), { context: state.context });
                            _this.windows.open(state.name, state.url, newWindowOptions);
                        }
                    });
                    return [2];
                });
            });
        };
        Layouts.prototype.remove = function (type, name) {
            this.storage.remove(name, type);
            return Promise.resolve();
        };
        Layouts.prototype.onSaveRequested = function (callback) {
            var _this = this;
            this.getLocalInfoCallback = callback;
            return function () {
                _this.getLocalInfoCallback = undefined;
            };
        };
        Layouts.prototype.getLocalLayoutComponent = function (context, main) {
            if (main === void 0) { main = false; }
            var requestResult;
            var my = this.windows.my();
            try {
                if (this.autoSaveContext) {
                    requestResult = {
                        windowContext: my.getContextSync()
                    };
                }
                if (this.getLocalInfoCallback) {
                    requestResult = this.getLocalInfoCallback(context);
                }
            }
            catch (err) {
                this.logger.warn("onSaveRequested - error getting data from user function - " + err);
            }
            return {
                type: "window",
                componentType: "application",
                state: {
                    name: my.name,
                    context: (requestResult === null || requestResult === void 0 ? void 0 : requestResult.windowContext) || {},
                    bounds: my.getBoundsSync(),
                    url: window.document.location.href,
                    id: my.id,
                    parentId: my.parent,
                    main: main
                }
            };
        };
        Layouts.prototype.registerRequestMethods = function () {
            var _this = this;
            this.interop.register(Layouts.SaveContextMethodName, function (args) {
                return _this.getLocalLayoutComponent(args);
            });
        };
        Layouts.prototype.handleControlMessage = function (command) {
            return __awaiter(this, void 0, void 0, function () {
                var layoutCommand, args, components;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            layoutCommand = command;
                            if (!(layoutCommand.command === "saveLayoutAndClose")) return [3, 3];
                            args = layoutCommand.args;
                            return [4, this.getRemoteWindowsInfo(args.childWindows)];
                        case 1:
                            components = _a.sent();
                            components.push(args.parentInfo);
                            return [4, this.storage.save({
                                    type: "Global",
                                    name: args.layoutName,
                                    components: components,
                                    context: args.context || {},
                                    metadata: args.metadata || {}
                                })];
                        case 2:
                            _a.sent();
                            args.childWindows.forEach(function (cw) {
                                var _a;
                                (_a = _this.windows.findById(cw)) === null || _a === void 0 ? void 0 : _a.close();
                            });
                            _a.label = 3;
                        case 3: return [2];
                    }
                });
            });
        };
        Layouts.prototype.getRemoteWindowsInfo = function (windows) {
            return __awaiter(this, void 0, void 0, function () {
                var promises, _loop_1, this_1, _i, windows_1, id, responses;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promises = [];
                            _loop_1 = function (id) {
                                var interopServer = this_1.interop.servers().find(function (s) { return s.windowId === id; });
                                if (!interopServer || !interopServer.getMethods) {
                                    return "continue";
                                }
                                var methods = interopServer.getMethods();
                                if (methods.find(function (m) { return m.name === Layouts.SaveContextMethodName; })) {
                                    try {
                                        promises.push(this_1.interop.invoke(Layouts.SaveContextMethodName, {}, { windowId: id }));
                                    }
                                    catch (_a) {
                                    }
                                }
                            };
                            this_1 = this;
                            for (_i = 0, windows_1 = windows; _i < windows_1.length; _i++) {
                                id = windows_1[_i];
                                _loop_1(id);
                            }
                            return [4, Promise.all(promises)];
                        case 1:
                            responses = _a.sent();
                            return [2, responses.map(function (response) { return response.returned; })];
                    }
                });
            });
        };
        Layouts.SaveContextMethodName = "T42.HC.GetSaveContext";
        return Layouts;
    }());

    var Notifications = (function () {
        function Notifications(interop) {
            this.interop = interop;
        }
        Notifications.prototype.raise = function (options) {
            return __awaiter(this, void 0, void 0, function () {
                var permissionPromise, notification, interopOptions_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!("Notification" in window)) {
                                throw new Error("this browser does not support desktop notification");
                            }
                            if (Notification.permission === "granted") {
                                permissionPromise = Promise.resolve("granted");
                            }
                            else if (Notification.permission === "denied") {
                                permissionPromise = Promise.reject("no permissions from user");
                            }
                            else {
                                permissionPromise = Notification.requestPermission();
                            }
                            return [4, permissionPromise];
                        case 1:
                            _a.sent();
                            notification = this.raiseUsingWebApi(options);
                            if (options.clickInterop) {
                                interopOptions_1 = options.clickInterop;
                                notification.onclick = function () {
                                    var _a, _b;
                                    _this.interop.invoke(interopOptions_1.method, (_a = interopOptions_1 === null || interopOptions_1 === void 0 ? void 0 : interopOptions_1.arguments) !== null && _a !== void 0 ? _a : {}, (_b = interopOptions_1 === null || interopOptions_1 === void 0 ? void 0 : interopOptions_1.target) !== null && _b !== void 0 ? _b : "best");
                                };
                            }
                            return [2, notification];
                    }
                });
            });
        };
        Notifications.prototype.raiseUsingWebApi = function (options) {
            return new Notification(options.title, options);
        };
        return Notifications;
    }());

    var defaultSharedLocation = "/glue/";
    var defaultConfigName = "glue.config.json";
    var defaultWorkerName = "worker.js";
    var defaultConfigLocation = "" + defaultSharedLocation + defaultConfigName;
    var defaultWorkerLocation = "" + defaultSharedLocation + defaultWorkerName;
    var defaultConfig = {
        worker: defaultWorkerLocation,
        extends: defaultConfigLocation,
        layouts: {
            autoRestore: false,
            autoSaveWindowContext: false
        },
        logger: "error",
    };

    var fetchTimeout = function (url, timeoutMilliseconds) {
        if (timeoutMilliseconds === void 0) { timeoutMilliseconds = 1000; }
        return new Promise(function (resolve, reject) {
            var timeoutHit = false;
            var timeout = setTimeout(function () {
                timeoutHit = true;
                reject(new Error("Fetch request for: " + url + " timed out at: " + timeoutMilliseconds + " milliseconds"));
            }, timeoutMilliseconds);
            fetch(url)
                .then(function (response) {
                if (!timeoutHit) {
                    clearTimeout(timeout);
                    resolve(response);
                }
            })
                .catch(function (err) {
                if (!timeoutHit) {
                    clearTimeout(timeout);
                    reject(err);
                }
            });
        });
    };
    var getRemoteConfig = function (userConfig) { return __awaiter(void 0, void 0, void 0, function () {
        var extend, response, json, _a;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    extend = (_c = (_b = userConfig.extends) !== null && _b !== void 0 ? _b : defaultConfig.extends) !== null && _c !== void 0 ? _c : defaultConfigLocation;
                    if (extend === false) {
                        return [2, {}];
                    }
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 4, , 5]);
                    return [4, fetchTimeout(extend)];
                case 2:
                    response = _e.sent();
                    if (!response.ok) {
                        return [2, {}];
                    }
                    return [4, response.json()];
                case 3:
                    json = _e.sent();
                    return [2, (_d = json === null || json === void 0 ? void 0 : json.glue) !== null && _d !== void 0 ? _d : {}];
                case 4:
                    _a = _e.sent();
                    return [2, {}];
                case 5: return [2];
            }
        });
    }); };
    var buildConfig = function (userConfig) { return __awaiter(void 0, void 0, void 0, function () {
        var remoteConfig, result, lastIndex, worker;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userConfig = userConfig !== null && userConfig !== void 0 ? userConfig : {};
                    return [4, getRemoteConfig(userConfig)];
                case 1:
                    remoteConfig = _a.sent();
                    result = Object.assign({}, defaultConfig, remoteConfig, userConfig);
                    if (result.extends) {
                        lastIndex = result.extends.lastIndexOf("/");
                        worker = result.extends.substr(0, lastIndex + 1) + defaultWorkerName;
                        result.worker = worker;
                    }
                    return [2, result];
            }
        });
    }); };

    var restoreAutoSavedLayout = function (api) {
        var layoutName = "_auto_" + document.location.href;
        var layout = api.layouts.list().find(function (l) { return l.name === layoutName; });
        if (!layout) {
            return Promise.resolve();
        }
        var my = api.windows.my();
        if (my.parent) {
            return Promise.resolve();
        }
        api.logger.info("restoring layout " + layoutName);
        var mainComponent = layout.components.find(function (c) { return c.state.main; });
        my.setContext(mainComponent === null || mainComponent === void 0 ? void 0 : mainComponent.state.context);
        try {
            return api.layouts.restore({
                name: layoutName,
                closeRunningInstance: false,
            });
        }
        catch (e) {
            api.logger.error(e);
            return Promise.resolve();
        }
    };

    var createFactoryFunction = function (coreFactoryFunction) {
        return function (config) { return __awaiter(void 0, void 0, void 0, function () {
            var gdWindowContext, control, windows, ext, coreConfig, core;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4, buildConfig(config)];
                    case 1:
                        config = _c.sent();
                        if (typeof window !== "undefined") {
                            gdWindowContext = window;
                            if ((gdWindowContext === null || gdWindowContext === void 0 ? void 0 : gdWindowContext.glue42gd) && (gdWindowContext === null || gdWindowContext === void 0 ? void 0 : gdWindowContext.Glue)) {
                                return [2, gdWindowContext.Glue({
                                        windows: true,
                                        logger: config.logger
                                    })];
                            }
                        }
                        control = new Control();
                        ext = {
                            libs: [
                                {
                                    name: "windows",
                                    create: function (coreLib) {
                                        windows = new Windows(coreLib.interop, control);
                                        return windows;
                                    }
                                },
                                {
                                    name: "notifications",
                                    create: function (coreLib) { return new Notifications(coreLib.interop); }
                                },
                                {
                                    name: "layouts",
                                    create: function (coreLib) { return new Layouts(windows, coreLib.interop, coreLib.logger.subLogger("layouts"), control, config); }
                                }
                            ],
                            version: version
                        };
                        coreConfig = {
                            gateway: {
                                sharedWorker: (_a = config === null || config === void 0 ? void 0 : config.worker) !== null && _a !== void 0 ? _a : defaultWorkerLocation
                            },
                            logger: config === null || config === void 0 ? void 0 : config.logger
                        };
                        return [4, coreFactoryFunction(coreConfig, ext)];
                    case 2:
                        core = _c.sent();
                        control.start(core.interop, core.logger.subLogger("control"));
                        return [4, initStartupContext(core.windows.my(), core.interop)];
                    case 3:
                        _c.sent();
                        if (!((_b = config.layouts) === null || _b === void 0 ? void 0 : _b.autoRestore)) return [3, 5];
                        return [4, restoreAutoSavedLayout(core)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: return [4, hookCloseEvents(core, config, control)];
                    case 6:
                        _c.sent();
                        return [2, core];
                }
            });
        }); };
    };
    var hookCloseEvents = function (api, config, control) {
        var done = false;
        var doneFn = function () { return __awaiter(void 0, void 0, void 0, function () {
            var shouldSave, allChildren, firstChild, layoutName, layouts, command;
            var _a;
            return __generator(this, function (_b) {
                if (!done) {
                    done = true;
                    shouldSave = (_a = config === null || config === void 0 ? void 0 : config.layouts) === null || _a === void 0 ? void 0 : _a.autoRestore;
                    if (shouldSave) {
                        allChildren = api.windows.getChildWindows().map(function (w) { return w.id; });
                        firstChild = allChildren[0];
                        layoutName = "_auto_" + document.location.href;
                        if (allChildren.length > 0) {
                            layouts = api.layouts;
                            command = {
                                domain: "layouts",
                                command: "saveLayoutAndClose",
                                args: {
                                    childWindows: allChildren,
                                    closeEveryone: true,
                                    layoutName: layoutName,
                                    context: {},
                                    metadata: {},
                                    parentInfo: layouts.getLocalLayoutComponent({}, true)
                                }
                            };
                            control.send(command, { windowId: firstChild });
                        }
                        else {
                            api.layouts.save({ name: layoutName });
                        }
                    }
                    api.done();
                }
                return [2];
            });
        }); };
        window.addEventListener("beforeunload", function (event) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                doneFn();
                return [2];
            });
        }); });
    };

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics$1 = function(d, b) {
        extendStatics$1 = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics$1(d, b);
    };

    function __extends$1(d, b) {
        extendStatics$1(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign$1 = function() {
        __assign$1 = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign$1.apply(this, arguments);
    };

    function __awaiter$1(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator$1(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    var MetricTypes = {
        STRING: 1,
        NUMBER: 2,
        TIMESTAMP: 3,
        OBJECT: 4
    };

    function getMetricTypeByValue(metric) {
        if (metric.type === MetricTypes.TIMESTAMP) {
            return "timestamp";
        }
        else if (metric.type === MetricTypes.NUMBER) {
            return "number";
        }
        else if (metric.type === MetricTypes.STRING) {
            return "string";
        }
        else if (metric.type === MetricTypes.OBJECT) {
            return "object";
        }
        return "unknown";
    }
    function getTypeByValue(value) {
        if (value.constructor === Date) {
            return "timestamp";
        }
        else if (typeof value === "number") {
            return "number";
        }
        else if (typeof value === "string") {
            return "string";
        }
        else if (typeof value === "object") {
            return "object";
        }
        else {
            return "string";
        }
    }
    function serializeMetric(metric) {
        var serializedMetrics = {};
        var type = getMetricTypeByValue(metric);
        if (type === "object") {
            var values = Object.keys(metric.value).reduce(function (memo, key) {
                var innerType = getTypeByValue(metric.value[key]);
                if (innerType === "object") {
                    var composite = defineNestedComposite(metric.value[key]);
                    memo[key] = {
                        type: "object",
                        description: "",
                        context: {},
                        composite: composite,
                    };
                }
                else {
                    memo[key] = {
                        type: innerType,
                        description: "",
                        context: {},
                    };
                }
                return memo;
            }, {});
            serializedMetrics.composite = values;
        }
        serializedMetrics.name = normalizeMetricName(metric.path.join("/") + "/" + metric.name);
        serializedMetrics.type = type;
        serializedMetrics.description = metric.description;
        serializedMetrics.context = {};
        return serializedMetrics;
    }
    function defineNestedComposite(values) {
        return Object.keys(values).reduce(function (memo, key) {
            var type = getTypeByValue(values[key]);
            if (type === "object") {
                memo[key] = {
                    type: "object",
                    description: "",
                    context: {},
                    composite: defineNestedComposite(values[key]),
                };
            }
            else {
                memo[key] = {
                    type: type,
                    description: "",
                    context: {},
                };
            }
            return memo;
        }, {});
    }
    function normalizeMetricName(name) {
        if (typeof name !== "undefined" && name.length > 0 && name[0] !== "/") {
            return "/" + name;
        }
        else {
            return name;
        }
    }
    function getMetricValueByType(metric) {
        var type = getMetricTypeByValue(metric);
        if (type === "timestamp") {
            return Date.now();
        }
        else {
            return publishNestedComposite(metric.value);
        }
    }
    function publishNestedComposite(values) {
        if (typeof values !== "object") {
            return values;
        }
        return Object.keys(values).reduce(function (memo, key) {
            var value = values[key];
            if (typeof value === "object" && value.constructor !== Date) {
                memo[key] = publishNestedComposite(value);
            }
            else if (value.constructor === Date) {
                memo[key] = new Date(value).getTime();
            }
            else if (value.constructor === Boolean) {
                memo[key] = value.toString();
            }
            else {
                memo[key] = value;
            }
            return memo;
        }, {});
    }
    function flatten(arr) {
        return arr.reduce(function (flat, toFlatten) {
            return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
        }, []);
    }
    function getHighestState(arr) {
        return arr.sort(function (a, b) {
            if (!a.state) {
                return 1;
            }
            if (!b.state) {
                return -1;
            }
            return b.state - a.state;
        })[0];
    }
    function aggregateDescription(arr) {
        var msg = "";
        arr.forEach(function (m, idx, a) {
            var path = m.path.join(".");
            if (idx === a.length - 1) {
                msg += path + "." + m.name + ": " + m.description;
            }
            else {
                msg += path + "." + m.name + ": " + m.description + ",";
            }
        });
        if (msg.length > 100) {
            return msg.slice(0, 100) + "...";
        }
        else {
            return msg;
        }
    }
    function composeMsgForRootStateMetric(system) {
        var aggregatedState = system.root.getAggregateState();
        var merged = flatten(aggregatedState);
        var highestState = getHighestState(merged);
        var aggregateDesc = aggregateDescription(merged);
        return {
            description: aggregateDesc,
            value: highestState.state,
        };
    }

    function gw3 (connection, config) {
        if (!connection || typeof connection !== "object") {
            throw new Error("Connection is required parameter");
        }
        var joinPromise;
        var session;
        var init = function (repo) {
            var resolveReadyPromise;
            joinPromise = new Promise(function (resolve) {
                resolveReadyPromise = resolve;
            });
            session = connection.domain("metrics");
            session.onJoined(function (reconnect) {
                if (!reconnect && resolveReadyPromise) {
                    resolveReadyPromise();
                    resolveReadyPromise = undefined;
                }
                var rootStateMetric = {
                    name: "/State",
                    type: "object",
                    composite: {
                        Description: {
                            type: "string",
                            description: "",
                        },
                        Value: {
                            type: "number",
                            description: "",
                        },
                    },
                    description: "System state",
                    context: {},
                };
                var defineRootMetricsMsg = {
                    type: "define",
                    metrics: [rootStateMetric],
                };
                session.send(defineRootMetricsMsg);
                if (reconnect) {
                    replayRepo(repo);
                }
            });
            session.join();
        };
        var replayRepo = function (repo) {
            replaySystem(repo.root);
        };
        var replaySystem = function (system) {
            createSystem(system);
            system.metrics.forEach(function (m) {
                createMetric(m);
            });
            system.subSystems.forEach(function (ss) {
                replaySystem(ss);
            });
        };
        var createSystem = function (system) {
            if (system.parent === undefined) {
                return;
            }
            joinPromise.then(function () {
                var metric = {
                    name: normalizeMetricName(system.path.join("/") + "/" + system.name + "/State"),
                    type: "object",
                    composite: {
                        Description: {
                            type: "string",
                            description: "",
                        },
                        Value: {
                            type: "number",
                            description: "",
                        },
                    },
                    description: "System state",
                    context: {},
                };
                var createMetricsMsg = {
                    type: "define",
                    metrics: [metric],
                };
                session.send(createMetricsMsg);
            });
        };
        var updateSystem = function (system, state) {
            joinPromise.then(function () {
                var shadowedUpdateMetric = {
                    type: "publish",
                    values: [{
                            name: normalizeMetricName(system.path.join("/") + "/" + system.name + "/State"),
                            value: {
                                Description: state.description,
                                Value: state.state,
                            },
                            timestamp: Date.now(),
                        }],
                };
                session.send(shadowedUpdateMetric);
                var stateObj = composeMsgForRootStateMetric(system);
                var rootMetric = {
                    type: "publish",
                    peer_id: connection.peerId,
                    values: [{
                            name: "/State",
                            value: {
                                Description: stateObj.description,
                                Value: stateObj.value,
                            },
                            timestamp: Date.now(),
                        }],
                };
                session.send(rootMetric);
            });
        };
        var createMetric = function (metric) {
            var metricClone = cloneMetric(metric);
            joinPromise.then(function () {
                var m = serializeMetric(metricClone);
                var createMetricsMsg = {
                    type: "define",
                    metrics: [m],
                };
                session.send(createMetricsMsg);
                if (typeof metricClone.value !== "undefined") {
                    updateMetricCore(metricClone);
                }
            });
        };
        var updateMetric = function (metric) {
            var metricClone = cloneMetric(metric);
            joinPromise.then(function () { return updateMetricCore(metricClone); });
        };
        var updateMetricCore = function (metric) {
            var value = getMetricValueByType(metric);
            var publishMetricsMsg = {
                type: "publish",
                values: [{
                        name: normalizeMetricName(metric.path.join("/") + "/" + metric.name),
                        value: value,
                        timestamp: Date.now(),
                    }],
            };
            session.send(publishMetricsMsg);
        };
        var cloneMetric = function (metric) {
            var metricClone = __assign$1({}, metric);
            if (typeof metric.value === "object" && metric.value !== null) {
                metricClone.value = __assign$1({}, metric.value);
            }
            return metricClone;
        };
        return {
            init: init,
            createSystem: createSystem,
            updateSystem: updateSystem,
            createMetric: createMetric,
            updateMetric: updateMetric,
        };
    }

    var Helpers = {
        validate: function (definition, parent, transport) {
            if (definition === null || typeof definition !== "object") {
                throw new Error("Missing definition");
            }
            if (parent === null || typeof parent !== "object") {
                throw new Error("Missing parent");
            }
            if (transport === null || typeof transport !== "object") {
                throw new Error("Missing transport");
            }
        },
    };

    var BaseMetric = (function () {
        function BaseMetric(definition, system, transport, value, type) {
            this.definition = definition;
            this.system = system;
            this.transport = transport;
            this.value = value;
            this.type = type;
            this.path = [];
            Helpers.validate(definition, system, transport);
            this.path = system.path.slice(0);
            this.path.push(system.name);
            this.name = definition.name;
            this.description = definition.description;
            transport.createMetric(this);
        }
        Object.defineProperty(BaseMetric.prototype, "repo", {
            get: function () {
                var _a;
                return (_a = this.system) === null || _a === void 0 ? void 0 : _a.repo;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseMetric.prototype, "id", {
            get: function () { return this.system.path + "/" + name; },
            enumerable: true,
            configurable: true
        });
        BaseMetric.prototype.update = function (newValue) {
            this.value = newValue;
            this.transport.updateMetric(this);
        };
        return BaseMetric;
    }());

    var NumberMetric = (function (_super) {
        __extends$1(NumberMetric, _super);
        function NumberMetric(definition, system, transport, value) {
            return _super.call(this, definition, system, transport, value, MetricTypes.NUMBER) || this;
        }
        NumberMetric.prototype.incrementBy = function (num) {
            this.update(this.value + num);
        };
        NumberMetric.prototype.increment = function () {
            this.incrementBy(1);
        };
        NumberMetric.prototype.decrement = function () {
            this.incrementBy(-1);
        };
        NumberMetric.prototype.decrementBy = function (num) {
            this.incrementBy(num * -1);
        };
        return NumberMetric;
    }(BaseMetric));

    var ObjectMetric = (function (_super) {
        __extends$1(ObjectMetric, _super);
        function ObjectMetric(definition, system, transport, value) {
            return _super.call(this, definition, system, transport, value, MetricTypes.OBJECT) || this;
        }
        ObjectMetric.prototype.update = function (newValue) {
            this.mergeValues(newValue);
            this.transport.updateMetric(this);
        };
        ObjectMetric.prototype.mergeValues = function (values) {
            var _this = this;
            return Object.keys(this.value).forEach(function (k) {
                if (typeof values[k] !== "undefined") {
                    _this.value[k] = values[k];
                }
            });
        };
        return ObjectMetric;
    }(BaseMetric));

    var StringMetric = (function (_super) {
        __extends$1(StringMetric, _super);
        function StringMetric(definition, system, transport, value) {
            return _super.call(this, definition, system, transport, value, MetricTypes.STRING) || this;
        }
        return StringMetric;
    }(BaseMetric));

    var TimestampMetric = (function (_super) {
        __extends$1(TimestampMetric, _super);
        function TimestampMetric(definition, system, transport, value) {
            return _super.call(this, definition, system, transport, value, MetricTypes.TIMESTAMP) || this;
        }
        TimestampMetric.prototype.now = function () {
            this.update(new Date());
        };
        return TimestampMetric;
    }(BaseMetric));

    function system(name, repo, protocol, parent, description) {
        if (!repo) {
            throw new Error("Repository is required");
        }
        if (!protocol) {
            throw new Error("Transport is required");
        }
        var _transport = protocol;
        var _name = name;
        var _description = description || "";
        var _repo = repo;
        var _parent = parent;
        var _path = _buildPath(parent);
        var _state = {};
        var id = _arrayToString(_path, "/") + name;
        var root = repo.root;
        var _subSystems = [];
        var _metrics = [];
        function subSystem(nameSystem, descriptionSystem) {
            if (!nameSystem || nameSystem.length === 0) {
                throw new Error("name is required");
            }
            var match = _subSystems.filter(function (s) { return s.name === nameSystem; });
            if (match.length > 0) {
                return match[0];
            }
            var _system = system(nameSystem, _repo, _transport, me, descriptionSystem);
            _subSystems.push(_system);
            return _system;
        }
        function setState(state, stateDescription) {
            _state = { state: state, description: stateDescription };
            _transport.updateSystem(me, _state);
        }
        function stringMetric(definition, value) {
            return _getOrCreateMetric(definition, MetricTypes.STRING, value, function (metricDef) { return new StringMetric(metricDef, me, _transport, value); });
        }
        function numberMetric(definition, value) {
            return _getOrCreateMetric(definition, MetricTypes.NUMBER, value, function (metricDef) { return new NumberMetric(metricDef, me, _transport, value); });
        }
        function objectMetric(definition, value) {
            return _getOrCreateMetric(definition, MetricTypes.OBJECT, value, function (metricDef) { return new ObjectMetric(metricDef, me, _transport, value); });
        }
        function timestampMetric(definition, value) {
            return _getOrCreateMetric(definition, MetricTypes.TIMESTAMP, value, function (metricDef) { return new TimestampMetric(metricDef, me, _transport, value); });
        }
        function _getOrCreateMetric(metricObject, expectedType, value, createMetric) {
            var metricDef = { name: "" };
            if (typeof metricObject === "string") {
                metricDef = { name: metricObject };
            }
            else {
                metricDef = metricObject;
            }
            var matching = _metrics.filter(function (shadowedMetric) { return shadowedMetric.name === metricDef.name; });
            if (matching.length > 0) {
                var existing = matching[0];
                if (existing.type !== expectedType) {
                    throw new Error("A metric named " + metricDef.name + " is already defined with different type.");
                }
                if (typeof value !== "undefined") {
                    existing.update(value);
                }
                return existing;
            }
            var metric = createMetric(metricDef);
            _metrics.push(metric);
            return metric;
        }
        function _buildPath(shadowedSystem) {
            if (!shadowedSystem || !shadowedSystem.parent) {
                return [];
            }
            var path = _buildPath(shadowedSystem.parent);
            path.push(shadowedSystem.name);
            return path;
        }
        function _arrayToString(path, separator) {
            return ((path && path.length > 0) ? path.join(separator) : "");
        }
        function getAggregateState() {
            var aggState = [];
            if (Object.keys(_state).length > 0) {
                aggState.push({
                    name: _name,
                    path: _path,
                    state: _state.state,
                    description: _state.description,
                });
            }
            _subSystems.forEach(function (shadowedSubSystem) {
                var result = shadowedSubSystem.getAggregateState();
                if (result.length > 0) {
                    aggState.push.apply(aggState, result);
                }
            });
            return aggState;
        }
        var me = {
            get name() {
                return _name;
            },
            get description() {
                return _description;
            },
            get repo() {
                return _repo;
            },
            get parent() {
                return _parent;
            },
            path: _path,
            id: id,
            root: root,
            get subSystems() {
                return _subSystems;
            },
            get metrics() {
                return _metrics;
            },
            subSystem: subSystem,
            getState: function () {
                return _state;
            },
            setState: setState,
            stringMetric: stringMetric,
            timestampMetric: timestampMetric,
            objectMetric: objectMetric,
            numberMetric: numberMetric,
            getAggregateState: getAggregateState,
        };
        _transport.createSystem(me);
        return me;
    }

    var Repository = (function () {
        function Repository(options, protocol) {
            protocol.init(this);
            this.root = system("", this, protocol);
            this.addSystemMetrics(this.root, options.clickStream || options.clickStream === undefined);
        }
        Repository.prototype.addSystemMetrics = function (rootSystem, useClickStream) {
            if (typeof navigator !== "undefined") {
                rootSystem.stringMetric("UserAgent", navigator.userAgent);
            }
            if (useClickStream && typeof document !== "undefined") {
                var clickStream_1 = rootSystem.subSystem("ClickStream");
                var documentClickHandler = function (e) {
                    if (!e.target) {
                        return;
                    }
                    var target = e.target;
                    clickStream_1.objectMetric("LastBrowserEvent", {
                        type: "click",
                        timestamp: new Date(),
                        target: {
                            className: e.target ? target.className : "",
                            id: target.id,
                            type: "<" + target.tagName.toLowerCase() + ">",
                            href: target.href || "",
                        },
                    });
                };
                clickStream_1.objectMetric("Page", {
                    title: document.title,
                    page: window.location.href,
                });
                if (document.addEventListener) {
                    document.addEventListener("click", documentClickHandler);
                }
                else {
                    document.attachEvent("onclick", documentClickHandler);
                }
            }
            var startTime = rootSystem.stringMetric("StartTime", (new Date()).toString());
            var urlMetric = rootSystem.stringMetric("StartURL", "");
            var appNameMetric = rootSystem.stringMetric("AppName", "");
            if (typeof window !== "undefined") {
                if (typeof window.location !== "undefined") {
                    var startUrl = window.location.href;
                    urlMetric.update(startUrl);
                }
                if (typeof window.glue42gd !== "undefined") {
                    appNameMetric.update(window.glue42gd.appName);
                }
            }
        };
        return Repository;
    }());

    var NullProtocol = (function () {
        function NullProtocol() {
        }
        NullProtocol.prototype.init = function (repo) {
        };
        NullProtocol.prototype.createSystem = function (system) {
        };
        NullProtocol.prototype.updateSystem = function (metric, state) {
        };
        NullProtocol.prototype.createMetric = function (metric) {
        };
        NullProtocol.prototype.updateMetric = function (metric) {
        };
        return NullProtocol;
    }());

    var metrics = (function (options) {
        var protocol;
        if (!options.connection || typeof options.connection !== "object") {
            protocol = new NullProtocol();
        }
        else {
            protocol = gw3(options.connection);
        }
        var repo = new Repository(options, protocol);
        return repo.root;
    });
    function addFAVSupport(system) {
        var reportingSystem = system.subSystem("reporting");
        var def = {
            name: "features"
        };
        var featureMetric;
        var featureMetricFunc = function (name, action, payload) {
            if (typeof name === "undefined" || name === "") {
                throw new Error("name is mandatory");
            }
            else if (typeof action === "undefined" || action === "") {
                throw new Error("action is mandatory");
            }
            else if (typeof payload === "undefined" || payload === "") {
                throw new Error("payload is mandatory");
            }
            if (!featureMetric) {
                featureMetric = reportingSystem.objectMetric(def, { name: name, action: action, payload: payload });
            }
            else {
                featureMetric.update({
                    name: name,
                    action: action,
                    payload: payload
                });
            }
        };
        system.featureMetric = featureMetricFunc;
        return system;
    }

    function createRegistry$1(options) {
        if (options && options.errorHandling
            && typeof options.errorHandling !== "function"
            && options.errorHandling !== "log"
            && options.errorHandling !== "silent"
            && options.errorHandling !== "throw") {
            throw new Error("Invalid options passed to createRegistry. Prop errorHandling should be [\"log\" | \"silent\" | \"throw\" | (err) => void], but " + typeof options.errorHandling + " was passed");
        }
        var _userErrorHandler = options && typeof options.errorHandling === "function" && options.errorHandling;
        var callbacks = {};
        function add(key, callback) {
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey) {
                callbacksForKey = [];
                callbacks[key] = callbacksForKey;
            }
            callbacksForKey.push(callback);
            return function () {
                var allForKey = callbacks[key];
                if (!allForKey) {
                    return;
                }
                allForKey = allForKey.reduce(function (acc, element, index) {
                    if (!(element === callback && acc.length === index)) {
                        acc.push(element);
                    }
                    return acc;
                }, []);
                callbacks[key] = allForKey;
            };
        }
        function execute(key) {
            var argumentsArr = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                argumentsArr[_i - 1] = arguments[_i];
            }
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey || callbacksForKey.length === 0) {
                return [];
            }
            var results = [];
            callbacksForKey.forEach(function (callback) {
                try {
                    var result = callback.apply(undefined, argumentsArr);
                    results.push(result);
                }
                catch (err) {
                    results.push(undefined);
                    _handleError(err, key);
                }
            });
            return results;
        }
        function _handleError(exceptionArtifact, key) {
            var errParam = exceptionArtifact instanceof Error ? exceptionArtifact : new Error(exceptionArtifact);
            if (_userErrorHandler) {
                _userErrorHandler(errParam);
                return;
            }
            var msg = "[ERROR] callback-registry: User callback for key \"" + key + "\" failed: " + errParam.stack;
            if (options) {
                switch (options.errorHandling) {
                    case "log":
                        return console.error(msg);
                    case "silent":
                        return;
                    case "throw":
                        throw new Error(msg);
                }
            }
            console.error(msg);
        }
        function clear() {
            callbacks = {};
        }
        function clearKey(key) {
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey) {
                return;
            }
            delete callbacks[key];
        }
        return {
            add: add,
            execute: execute,
            clear: clear,
            clearKey: clearKey
        };
    }
    createRegistry$1.default = createRegistry$1;
    var lib$2 = createRegistry$1;

    var InProcTransport = (function () {
        function InProcTransport(settings, logger) {
            var _this = this;
            this.registry = lib$2();
            this.gw = settings.facade;
            this.gw.connect(function (_client, message) {
                _this.messageHandler(message);
            }).then(function (client) {
                _this.client = client;
            });
        }
        Object.defineProperty(InProcTransport.prototype, "isObjectBasedTransport", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        InProcTransport.prototype.sendObject = function (msg) {
            if (this.client) {
                this.client.send(msg);
                return Promise.resolve(undefined);
            }
            else {
                return Promise.reject("not connected");
            }
        };
        InProcTransport.prototype.send = function (_msg) {
            return Promise.reject("not supported");
        };
        InProcTransport.prototype.onMessage = function (callback) {
            return this.registry.add("onMessage", callback);
        };
        InProcTransport.prototype.onConnectedChanged = function (callback) {
            callback(true);
        };
        InProcTransport.prototype.close = function () {
            return Promise.resolve();
        };
        InProcTransport.prototype.open = function () {
            return Promise.resolve();
        };
        InProcTransport.prototype.name = function () {
            return "in-memory";
        };
        InProcTransport.prototype.reconnect = function () {
            return Promise.resolve();
        };
        InProcTransport.prototype.messageHandler = function (msg) {
            this.registry.execute("onMessage", msg);
        };
        return InProcTransport;
    }());

    var SharedWorkerTransport = (function () {
        function SharedWorkerTransport(workerFile, logger) {
            var _this = this;
            this.logger = logger;
            this.registry = lib$2();
            this.worker = new SharedWorker(workerFile);
            this.worker.port.onmessage = function (e) {
                _this.messageHandler(e.data);
            };
        }
        Object.defineProperty(SharedWorkerTransport.prototype, "isObjectBasedTransport", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        SharedWorkerTransport.prototype.sendObject = function (msg) {
            this.worker.port.postMessage(msg);
            return Promise.resolve();
        };
        SharedWorkerTransport.prototype.send = function (_msg) {
            return Promise.reject("not supported");
        };
        SharedWorkerTransport.prototype.onMessage = function (callback) {
            return this.registry.add("onMessage", callback);
        };
        SharedWorkerTransport.prototype.onConnectedChanged = function (callback) {
            callback(true);
        };
        SharedWorkerTransport.prototype.close = function () {
            return Promise.resolve();
        };
        SharedWorkerTransport.prototype.open = function () {
            return Promise.resolve();
        };
        SharedWorkerTransport.prototype.name = function () {
            return "shared-worker";
        };
        SharedWorkerTransport.prototype.reconnect = function () {
            return Promise.resolve();
        };
        SharedWorkerTransport.prototype.messageHandler = function (msg) {
            this.registry.execute("onMessage", msg);
        };
        return SharedWorkerTransport;
    }());

    var Utils = (function () {
        function Utils() {
        }
        Utils.getGDMajorVersion = function () {
            if (typeof window === "undefined") {
                return undefined;
            }
            if (!window.glueDesktop) {
                return undefined;
            }
            if (!window.glueDesktop.version) {
                return undefined;
            }
            var ver = Number(window.glueDesktop.version.substr(0, 1));
            return isNaN(ver) ? undefined : ver;
        };
        Utils.isNode = function () {
            if (typeof Utils._isNode !== "undefined") {
                return Utils._isNode;
            }
            try {
                Utils._isNode = Object.prototype.toString.call(global.process) === "[object process]";
            }
            catch (e) {
                Utils._isNode = false;
            }
            return Utils._isNode;
        };
        return Utils;
    }());

    var PromiseWrapper = (function () {
        function PromiseWrapper() {
            var _this = this;
            this.rejected = false;
            this.resolved = false;
            this.promise = new Promise(function (resolve, reject) {
                _this.resolve = function (t) {
                    _this.resolved = true;
                    resolve(t);
                };
                _this.reject = function (err) {
                    _this.rejected = true;
                    reject(err);
                };
            });
        }
        PromiseWrapper.delay = function (time) {
            return new Promise(function (resolve) { return setTimeout(resolve, time); });
        };
        Object.defineProperty(PromiseWrapper.prototype, "ended", {
            get: function () {
                return this.rejected || this.resolved;
            },
            enumerable: true,
            configurable: true
        });
        return PromiseWrapper;
    }());

    var WebSocketConstructor = Utils.isNode() ? require("ws") : window.WebSocket;
    var WS = (function () {
        function WS(settings, logger) {
            this._running = true;
            this._registry = lib$2();
            this.wsRequests = [];
            this.settings = settings;
            this.logger = logger;
            if (!this.settings.ws) {
                throw new Error("ws is missing");
            }
        }
        WS.prototype.onMessage = function (callback) {
            return this._registry.add("onMessage", callback);
        };
        WS.prototype.send = function (msg, options) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.waitForSocketConnection(function () {
                    var _a;
                    try {
                        (_a = _this.ws) === null || _a === void 0 ? void 0 : _a.send(msg);
                        resolve();
                    }
                    catch (e) {
                        reject(e);
                    }
                }, reject);
            });
        };
        WS.prototype.open = function () {
            var _this = this;
            this.logger.info("opening ws...");
            this._running = true;
            return new Promise(function (resolve, reject) {
                _this.waitForSocketConnection(resolve, reject);
            });
        };
        WS.prototype.close = function () {
            this._running = false;
            if (this.ws) {
                this.ws.close();
            }
            return Promise.resolve();
        };
        WS.prototype.onConnectedChanged = function (callback) {
            return this._registry.add("onConnectedChanged", callback);
        };
        WS.prototype.name = function () {
            return "ws " + this.settings.ws;
        };
        WS.prototype.reconnect = function () {
            var _a;
            (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
            var pw = new PromiseWrapper();
            this.waitForSocketConnection(function () {
                pw.resolve();
            });
            return pw.promise;
        };
        WS.prototype.waitForSocketConnection = function (callback, failed) {
            var _a;
            failed = failed !== null && failed !== void 0 ? failed : (function () { });
            if (!this._running) {
                failed("wait for socket on " + this.settings.ws + " failed - socket closed by user");
                return;
            }
            if (((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === 1) {
                callback();
                return;
            }
            this.wsRequests.push({ callback: callback, failed: failed });
            if (this.wsRequests.length > 1) {
                return;
            }
            this.openSocket();
        };
        WS.prototype.openSocket = function (retryInterval, retriesLeft) {
            return __awaiter$1(this, void 0, void 0, function () {
                var _a;
                var _this = this;
                return __generator$1(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (retryInterval === undefined) {
                                retryInterval = this.settings.reconnectInterval;
                            }
                            if (retriesLeft !== undefined) {
                                if (retriesLeft === 0) {
                                    this.notifyForSocketState("wait for socket on " + this.settings.ws + " failed - no more retries left");
                                    return [2];
                                }
                                this.logger.debug("will retry " + retriesLeft + " more times (every " + retryInterval + " ms)");
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4, this.initiateSocket()];
                        case 2:
                            _b.sent();
                            this.notifyForSocketState();
                            return [3, 4];
                        case 3:
                            _a = _b.sent();
                            setTimeout(function () {
                                var retries = retriesLeft === undefined ? undefined : retriesLeft - 1;
                                _this.openSocket(retryInterval, retries);
                            }, retryInterval);
                            return [3, 4];
                        case 4: return [2];
                    }
                });
            });
        };
        WS.prototype.initiateSocket = function () {
            var _this = this;
            var pw = new PromiseWrapper();
            this.logger.debug("initiating ws to " + this.settings.ws + "...");
            this.ws = new WebSocketConstructor(this.settings.ws || "");
            this.ws.onerror = function (err) {
                var reason = "";
                try {
                    reason = JSON.stringify(err);
                }
                catch (error) {
                    var seen_1 = new WeakSet();
                    var replacer = function (key, value) {
                        if (typeof value === "object" && value !== null) {
                            if (seen_1.has(value)) {
                                return;
                            }
                            seen_1.add(value);
                        }
                        return value;
                    };
                    reason = JSON.stringify(err, replacer);
                }
                pw.reject("error");
                _this.notifyStatusChanged(false, reason);
            };
            this.ws.onclose = function (err) {
                _this.logger.info("ws closed " + err);
                pw.reject("closed");
                _this.notifyStatusChanged(false);
            };
            this.ws.onopen = function () {
                var _a;
                _this.logger.info("ws opened " + ((_a = _this.settings.identity) === null || _a === void 0 ? void 0 : _a.application));
                pw.resolve();
                _this.notifyStatusChanged(true);
            };
            this.ws.onmessage = function (message) {
                _this._registry.execute("onMessage", message.data);
            };
            return pw.promise;
        };
        WS.prototype.notifyForSocketState = function (error) {
            this.wsRequests.forEach(function (wsRequest) {
                if (error) {
                    if (wsRequest.failed) {
                        wsRequest.failed(error);
                    }
                }
                else {
                    wsRequest.callback();
                }
            });
            this.wsRequests = [];
        };
        WS.prototype.notifyStatusChanged = function (status, reason) {
            this._registry.execute("onConnectedChanged", status, reason);
        };
        return WS;
    }());

    function createCommonjsModule$1(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    // Found this seed-based random generator somewhere
    // Based on The Central Randomizer 1.3 (C) 1997 by Paul Houle (houle@msc.cornell.edu)

    var seed$1 = 1;

    /**
     * return a random number based on a seed
     * @param seed
     * @returns {number}
     */
    function getNextValue$1() {
        seed$1 = (seed$1 * 9301 + 49297) % 233280;
        return seed$1/(233280.0);
    }

    function setSeed$2(_seed_) {
        seed$1 = _seed_;
    }

    var randomFromSeed$1 = {
        nextValue: getNextValue$1,
        seed: setSeed$2
    };

    var ORIGINAL$1 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
    var alphabet$1;
    var previousSeed$1;

    var shuffled$1;

    function reset$1() {
        shuffled$1 = false;
    }

    function setCharacters$1(_alphabet_) {
        if (!_alphabet_) {
            if (alphabet$1 !== ORIGINAL$1) {
                alphabet$1 = ORIGINAL$1;
                reset$1();
            }
            return;
        }

        if (_alphabet_ === alphabet$1) {
            return;
        }

        if (_alphabet_.length !== ORIGINAL$1.length) {
            throw new Error('Custom alphabet for shortid must be ' + ORIGINAL$1.length + ' unique characters. You submitted ' + _alphabet_.length + ' characters: ' + _alphabet_);
        }

        var unique = _alphabet_.split('').filter(function(item, ind, arr){
           return ind !== arr.lastIndexOf(item);
        });

        if (unique.length) {
            throw new Error('Custom alphabet for shortid must be ' + ORIGINAL$1.length + ' unique characters. These characters were not unique: ' + unique.join(', '));
        }

        alphabet$1 = _alphabet_;
        reset$1();
    }

    function characters$1(_alphabet_) {
        setCharacters$1(_alphabet_);
        return alphabet$1;
    }

    function setSeed$1$1(seed) {
        randomFromSeed$1.seed(seed);
        if (previousSeed$1 !== seed) {
            reset$1();
            previousSeed$1 = seed;
        }
    }

    function shuffle$1() {
        if (!alphabet$1) {
            setCharacters$1(ORIGINAL$1);
        }

        var sourceArray = alphabet$1.split('');
        var targetArray = [];
        var r = randomFromSeed$1.nextValue();
        var characterIndex;

        while (sourceArray.length > 0) {
            r = randomFromSeed$1.nextValue();
            characterIndex = Math.floor(r * sourceArray.length);
            targetArray.push(sourceArray.splice(characterIndex, 1)[0]);
        }
        return targetArray.join('');
    }

    function getShuffled$1() {
        if (shuffled$1) {
            return shuffled$1;
        }
        shuffled$1 = shuffle$1();
        return shuffled$1;
    }

    /**
     * lookup shuffled letter
     * @param index
     * @returns {string}
     */
    function lookup$1(index) {
        var alphabetShuffled = getShuffled$1();
        return alphabetShuffled[index];
    }

    var alphabet_1$1 = {
        characters: characters$1,
        seed: setSeed$1$1,
        lookup: lookup$1,
        shuffled: getShuffled$1
    };

    var crypto$1 = typeof window === 'object' && (window.crypto || window.msCrypto); // IE 11 uses window.msCrypto

    function randomByte$1() {
        if (!crypto$1 || !crypto$1.getRandomValues) {
            return Math.floor(Math.random() * 256) & 0x30;
        }
        var dest = new Uint8Array(1);
        crypto$1.getRandomValues(dest);
        return dest[0] & 0x30;
    }

    var randomByteBrowser$1 = randomByte$1;

    function encode(lookup, number) {
        var loopCounter = 0;
        var done;

        var str = '';

        while (!done) {
            str = str + lookup( ( (number >> (4 * loopCounter)) & 0x0f ) | randomByteBrowser$1() );
            done = number < (Math.pow(16, loopCounter + 1 ) );
            loopCounter++;
        }
        return str;
    }

    var encode_1 = encode;

    /**
     * Decode the id to get the version and worker
     * Mainly for debugging and testing.
     * @param id - the shortid-generated id.
     */
    function decode(id) {
        var characters = alphabet_1$1.shuffled();
        return {
            version: characters.indexOf(id.substr(0, 1)) & 0x0f,
            worker: characters.indexOf(id.substr(1, 1)) & 0x0f
        };
    }

    var decode_1 = decode;

    function isShortId$1(id) {
        if (!id || typeof id !== 'string' || id.length < 6 ) {
            return false;
        }

        var characters = alphabet_1$1.characters();
        var len = id.length;
        for(var i = 0; i < len;i++) {
            if (characters.indexOf(id[i]) === -1) {
                return false;
            }
        }
        return true;
    }

    var isValid$1 = isShortId$1;

    var lib$1$1 = createCommonjsModule$1(function (module) {






    // Ignore all milliseconds before a certain time to reduce the size of the date entropy without sacrificing uniqueness.
    // This number should be updated every year or so to keep the generated id short.
    // To regenerate `new Date() - 0` and bump the version. Always bump the version!
    var REDUCE_TIME = 1459707606518;

    // don't change unless we change the algos or REDUCE_TIME
    // must be an integer and less than 16
    var version = 6;

    // if you are using cluster or multiple servers use this to make each instance
    // has a unique value for worker
    // Note: I don't know if this is automatically set when using third
    // party cluster solutions such as pm2.
    var clusterWorkerId =  0;

    // Counter is used when shortid is called multiple times in one second.
    var counter;

    // Remember the last time shortid was called in case counter is needed.
    var previousSeconds;

    /**
     * Generate unique id
     * Returns string id
     */
    function generate() {

        var str = '';

        var seconds = Math.floor((Date.now() - REDUCE_TIME) * 0.001);

        if (seconds === previousSeconds) {
            counter++;
        } else {
            counter = 0;
            previousSeconds = seconds;
        }

        str = str + encode_1(alphabet_1$1.lookup, version);
        str = str + encode_1(alphabet_1$1.lookup, clusterWorkerId);
        if (counter > 0) {
            str = str + encode_1(alphabet_1$1.lookup, counter);
        }
        str = str + encode_1(alphabet_1$1.lookup, seconds);

        return str;
    }


    /**
     * Set the seed.
     * Highly recommended if you don't want people to try to figure out your id schema.
     * exposed as shortid.seed(int)
     * @param seed Integer value to seed the random alphabet.  ALWAYS USE THE SAME SEED or you might get overlaps.
     */
    function seed(seedValue) {
        alphabet_1$1.seed(seedValue);
        return module.exports;
    }

    /**
     * Set the cluster worker or machine id
     * exposed as shortid.worker(int)
     * @param workerId worker must be positive integer.  Number less than 16 is recommended.
     * returns shortid module so it can be chained.
     */
    function worker(workerId) {
        clusterWorkerId = workerId;
        return module.exports;
    }

    /**
     *
     * sets new characters to use in the alphabet
     * returns the shuffled alphabet
     */
    function characters(newCharacters) {
        if (newCharacters !== undefined) {
            alphabet_1$1.characters(newCharacters);
        }

        return alphabet_1$1.shuffled();
    }


    // Export all other functions as properties of the generate function
    module.exports = generate;
    module.exports.generate = generate;
    module.exports.seed = seed;
    module.exports.worker = worker;
    module.exports.characters = characters;
    module.exports.decode = decode_1;
    module.exports.isValid = isValid$1;
    });
    var lib_1$1 = lib$1$1.generate;
    var lib_2$1 = lib$1$1.seed;
    var lib_3$1 = lib$1$1.worker;
    var lib_4$1 = lib$1$1.characters;
    var lib_5$1 = lib$1$1.decode;
    var lib_6 = lib$1$1.isValid;

    var shortid$1 = lib$1$1;

    function domainSession (domain, connection, logger, successMessages, errorMessages) {
        if (domain == null) {
            domain = "global";
        }
        successMessages = successMessages || ["success"];
        errorMessages = errorMessages || ["error"];
        var isJoined = false;
        var tryReconnecting = false;
        var _latestOptions;
        var _connectionOn = false;
        var callbacks = lib$2();
        connection.disconnected(handleConnectionDisconnected);
        connection.loggedIn(handleConnectionLoggedIn);
        connection.on("success", function (msg) { return handleSuccessMessage(msg); });
        connection.on("error", function (msg) { return handleErrorMessage(msg); });
        connection.on("result", function (msg) { return handleSuccessMessage(msg); });
        if (successMessages) {
            successMessages.forEach(function (sm) {
                connection.on(sm, function (msg) { return handleSuccessMessage(msg); });
            });
        }
        if (errorMessages) {
            errorMessages.forEach(function (sm) {
                connection.on(sm, function (msg) { return handleErrorMessage(msg); });
            });
        }
        var requestsMap = {};
        function join(options) {
            _latestOptions = options;
            return new Promise(function (resolve, reject) {
                if (isJoined) {
                    resolve();
                    return;
                }
                var joinPromise;
                if (domain === "global") {
                    joinPromise = _connectionOn ? Promise.resolve({}) : Promise.reject("not connected to gateway");
                }
                else {
                    logger.debug("joining domain " + domain);
                    var joinMsg = {
                        type: "join",
                        destination: domain,
                        domain: "global",
                        options: options,
                    };
                    joinPromise = send(joinMsg);
                }
                joinPromise
                    .then(function () {
                    handleJoined();
                    resolve();
                })
                    .catch(function (err) {
                    logger.debug("error joining " + domain + " domain: " + JSON.stringify(err));
                    reject(err);
                });
            });
        }
        function leave() {
            if (domain === "global") {
                return Promise.resolve();
            }
            logger.debug("stopping session " + domain + "...");
            var leaveMsg = {
                type: "leave",
                destination: domain,
                domain: "global",
            };
            tryReconnecting = false;
            return send(leaveMsg).then(function () {
                isJoined = false;
                callbacks.execute("onLeft");
            });
        }
        function handleJoined() {
            logger.debug("did join " + domain);
            isJoined = true;
            var wasReconnect = tryReconnecting;
            tryReconnecting = false;
            callbacks.execute("onJoined", wasReconnect);
        }
        function handleConnectionDisconnected() {
            _connectionOn = false;
            logger.debug("connection is down");
            isJoined = false;
            tryReconnecting = true;
            callbacks.execute("onLeft", { disconnected: true });
        }
        function handleConnectionLoggedIn() {
            _connectionOn = true;
            if (tryReconnecting) {
                logger.debug("connection is now up - trying to reconnect...");
                join(_latestOptions);
            }
        }
        function onJoined(callback) {
            if (isJoined) {
                callback(false);
            }
            return callbacks.add("onJoined", callback);
        }
        function onLeft(callback) {
            if (!isJoined) {
                callback();
            }
            return callbacks.add("onLeft", callback);
        }
        function handleErrorMessage(msg) {
            if (domain !== msg.domain) {
                return;
            }
            var requestId = msg.request_id;
            if (!requestId) {
                return;
            }
            var entry = requestsMap[requestId];
            if (!entry) {
                return;
            }
            entry.error(msg);
        }
        function handleSuccessMessage(msg) {
            if (msg.domain !== domain) {
                return;
            }
            var requestId = msg.request_id;
            if (!requestId) {
                return;
            }
            var entry = requestsMap[requestId];
            if (!entry) {
                return;
            }
            entry.success(msg);
        }
        function getNextRequestId() {
            return shortid$1();
        }
        function send(msg, tag, options) {
            options = options || {};
            msg.request_id = msg.request_id || getNextRequestId();
            msg.domain = msg.domain || domain;
            if (!options.skipPeerId) {
                msg.peer_id = connection.peerId;
            }
            var requestId = msg.request_id;
            return new Promise(function (resolve, reject) {
                requestsMap[requestId] = {
                    success: function (successMsg) {
                        delete requestsMap[requestId];
                        successMsg._tag = tag;
                        resolve(successMsg);
                    },
                    error: function (errorMsg) {
                        logger.warn("GW error - " + JSON.stringify(errorMsg) + " for request " + JSON.stringify(msg));
                        delete requestsMap[requestId];
                        errorMsg._tag = tag;
                        reject(errorMsg);
                    },
                };
                connection
                    .send(msg, options)
                    .catch(function (err) {
                    requestsMap[requestId].error({ err: err });
                });
            });
        }
        function sendFireAndForget(msg) {
            msg.request_id = msg.request_id ? msg.request_id : getNextRequestId();
            msg.domain = msg.domain || domain;
            msg.peer_id = connection.peerId;
            connection.send(msg);
        }
        return {
            join: join,
            leave: leave,
            onJoined: onJoined,
            onLeft: onLeft,
            send: send,
            sendFireAndForget: sendFireAndForget,
            on: function (type, callback) {
                connection.on(type, function (msg) {
                    if (msg.domain !== domain) {
                        return;
                    }
                    try {
                        callback(msg);
                    }
                    catch (e) {
                        logger.error("Callback  failed: " + e + " \n " + e.stack + " \n msg was: " + JSON.stringify(msg), e);
                    }
                });
            },
            loggedIn: function (callback) { return connection.loggedIn(callback); },
            connected: function (callback) { return connection.connected(callback); },
            disconnected: function (callback) { return connection.disconnected(callback); },
            get peerId() {
                return connection.peerId;
            },
            get domain() {
                return domain;
            },
        };
    }

    var GW3ProtocolImpl = (function () {
        function GW3ProtocolImpl(connection, settings, logger) {
            var _this = this;
            this.connection = connection;
            this.settings = settings;
            this.logger = logger;
            this.protocolVersion = 3;
            this.datePrefix = "#T42_DATE#";
            this.datePrefixLen = this.datePrefix.length;
            this.dateMinLen = this.datePrefixLen + 1;
            this.datePrefixFirstChar = this.datePrefix[0];
            this.registry = lib$2();
            this._isLoggedIn = false;
            this.shouldTryLogin = true;
            this.initialLogin = true;
            this.initialLoginAttempts = 3;
            this.sessions = [];
            connection.disconnected(function () {
                _this.handleDisconnected();
            });
            this.ping();
        }
        Object.defineProperty(GW3ProtocolImpl.prototype, "isLoggedIn", {
            get: function () {
                return this._isLoggedIn;
            },
            enumerable: true,
            configurable: true
        });
        GW3ProtocolImpl.prototype.processStringMessage = function (message) {
            var _this = this;
            var msg = JSON.parse(message, function (key, value) {
                if (typeof value !== "string") {
                    return value;
                }
                if (value.length < _this.dateMinLen) {
                    return value;
                }
                if (value[0] !== _this.datePrefixFirstChar) {
                    return value;
                }
                if (value.substring(0, _this.datePrefixLen) !== _this.datePrefix) {
                    return value;
                }
                try {
                    var milliseconds = parseInt(value.substring(_this.datePrefixLen, value.length), 10);
                    if (isNaN(milliseconds)) {
                        return value;
                    }
                    return new Date(milliseconds);
                }
                catch (ex) {
                    return value;
                }
            });
            return {
                msg: msg,
                msgType: msg.type,
            };
        };
        GW3ProtocolImpl.prototype.createStringMessage = function (message) {
            var oldToJson = Date.prototype.toJSON;
            try {
                var datePrefix_1 = this.datePrefix;
                Date.prototype.toJSON = function () {
                    return datePrefix_1 + this.getTime();
                };
                var result = JSON.stringify(message);
                return result;
            }
            finally {
                Date.prototype.toJSON = oldToJson;
            }
        };
        GW3ProtocolImpl.prototype.processObjectMessage = function (message) {
            if (!message.type) {
                throw new Error("Object should have type property");
            }
            return {
                msg: message,
                msgType: message.type,
            };
        };
        GW3ProtocolImpl.prototype.createObjectMessage = function (message) {
            return message;
        };
        GW3ProtocolImpl.prototype.login = function (config, reconnect) {
            return __awaiter$1(this, void 0, void 0, function () {
                var authentication, token, e_1, _a, helloMsg, sendOptions, welcomeMsg, msg, token, _b, err_1;
                return __generator$1(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            this.logger.debug("logging in...");
                            this.loginConfig = config;
                            if (!this.loginConfig) {
                                this.loginConfig = { username: "", password: "" };
                            }
                            this.shouldTryLogin = true;
                            authentication = {};
                            this.connection.gatewayToken = config.gatewayToken;
                            if (!config.gatewayToken) return [3, 5];
                            if (!reconnect) return [3, 4];
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4, this.getNewGWToken()];
                        case 2:
                            token = _c.sent();
                            config.gatewayToken = token;
                            return [3, 4];
                        case 3:
                            e_1 = _c.sent();
                            this.logger.warn("failed to get GW token when reconnecting " + ((e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || e_1));
                            return [3, 4];
                        case 4:
                            authentication.method = "gateway-token";
                            authentication.token = config.gatewayToken;
                            this.connection.gatewayToken = config.gatewayToken;
                            return [3, 10];
                        case 5:
                            if (!(config.flowName === "sspi")) return [3, 9];
                            authentication.provider = "win";
                            authentication.method = "access-token";
                            if (!(config.flowCallback && config.sessionId)) return [3, 7];
                            _a = authentication;
                            return [4, config.flowCallback(config.sessionId, null)];
                        case 6:
                            _a.token =
                                (_c.sent())
                                    .data
                                    .toString("base64");
                            return [3, 8];
                        case 7: throw new Error("Invalid SSPI config");
                        case 8: return [3, 10];
                        case 9:
                            if (config.token) {
                                authentication.method = "access-token";
                                authentication.token = config.token;
                            }
                            else if (config.username) {
                                authentication.method = "secret";
                                authentication.login = config.username;
                                authentication.secret = config.password;
                            }
                            else {
                                throw new Error("invalid auth message" + JSON.stringify(config));
                            }
                            _c.label = 10;
                        case 10:
                            helloMsg = {
                                type: "hello",
                                identity: this.settings.identity,
                                authentication: authentication
                            };
                            if (config.sessionId) {
                                helloMsg.request_id = config.sessionId;
                            }
                            this.globalDomain = domainSession("global", this.connection, this.logger.subLogger("global-domain"), [
                                "welcome",
                                "token",
                                "authentication-request"
                            ]);
                            sendOptions = { skipPeerId: true };
                            if (this.initialLogin) {
                                sendOptions.retryInterval = this.settings.reconnectInterval;
                                sendOptions.maxRetries = this.settings.reconnectAttempts;
                            }
                            _c.label = 11;
                        case 11:
                            _c.trys.push([11, 19, 20, 21]);
                            welcomeMsg = void 0;
                            _c.label = 12;
                        case 12:
                            return [4, this.globalDomain.send(helloMsg, undefined, sendOptions)];
                        case 13:
                            msg = _c.sent();
                            if (!(msg.type === "authentication-request")) return [3, 16];
                            token = Buffer.from(msg.authentication.token, "base64");
                            if (!(config.flowCallback && config.sessionId)) return [3, 15];
                            _b = helloMsg.authentication;
                            return [4, config.flowCallback(config.sessionId, token)];
                        case 14:
                            _b.token =
                                (_c.sent())
                                    .data
                                    .toString("base64");
                            _c.label = 15;
                        case 15:
                            helloMsg.request_id = config.sessionId;
                            return [3, 12];
                        case 16:
                            if (msg.type === "welcome") {
                                welcomeMsg = msg;
                                return [3, 18];
                            }
                            else if (msg.type === "error") {
                                throw new Error("Authentication failed: " + msg.reason);
                            }
                            else {
                                throw new Error("Unexpected message type during authentication: " + msg.type);
                            }
                        case 17: return [3, 12];
                        case 18:
                            this.initialLogin = false;
                            this.logger.info("login successful with peerId " + welcomeMsg.peer_id);
                            this.connection.peerId = welcomeMsg.peer_id;
                            this.connection.resolvedIdentity = welcomeMsg.resolved_identity;
                            this.connection.availableDomains = welcomeMsg.available_domains;
                            if (welcomeMsg.options) {
                                this.connection.token = welcomeMsg.options.access_token;
                                this.connection.info = welcomeMsg.options.info;
                            }
                            this.setLoggedIn(true);
                            return [2, welcomeMsg.resolved_identity];
                        case 19:
                            err_1 = _c.sent();
                            this.logger.error("error sending hello message - " + (err_1.message || err_1.msg || err_1.reason || err_1), err_1);
                            throw err_1;
                        case 20:
                            if (config && config.flowCallback && config.sessionId) {
                                config.flowCallback(config.sessionId, null);
                            }
                            return [7];
                        case 21: return [2];
                    }
                });
            });
        };
        GW3ProtocolImpl.prototype.logout = function () {
            return __awaiter$1(this, void 0, void 0, function () {
                var promises;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.debug("logging out...");
                            this.shouldTryLogin = false;
                            if (this.pingTimer) {
                                clearTimeout(this.pingTimer);
                            }
                            promises = this.sessions.map(function (session) {
                                session.leave();
                            });
                            return [4, Promise.all(promises)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            });
        };
        GW3ProtocolImpl.prototype.loggedIn = function (callback) {
            if (this._isLoggedIn) {
                callback();
            }
            return this.registry.add("onLoggedIn", callback);
        };
        GW3ProtocolImpl.prototype.domain = function (domainName, domainLogger, successMessages, errorMessages) {
            var session = this.sessions.filter(function (s) { return s.domain === domainName; })[0];
            if (!session) {
                session = domainSession(domainName, this.connection, domainLogger, successMessages, errorMessages);
                this.sessions.push(session);
            }
            return session;
        };
        GW3ProtocolImpl.prototype.handleDisconnected = function () {
            var _this = this;
            this.setLoggedIn(false);
            var tryToLogin = this.shouldTryLogin;
            if (tryToLogin && this.initialLogin) {
                if (this.initialLoginAttempts <= 0) {
                    return;
                }
                this.initialLoginAttempts--;
            }
            this.logger.debug("disconnected - will try new login?" + this.shouldTryLogin);
            if (this.shouldTryLogin) {
                if (!this.loginConfig) {
                    throw new Error("no login info");
                }
                this.connection.login(this.loginConfig, true)
                    .catch(function () {
                    setTimeout(_this.handleDisconnected, 1000);
                });
            }
        };
        GW3ProtocolImpl.prototype.setLoggedIn = function (value) {
            this._isLoggedIn = value;
            if (this._isLoggedIn) {
                this.registry.execute("onLoggedIn");
            }
        };
        GW3ProtocolImpl.prototype.ping = function () {
            var _this = this;
            if (!this.shouldTryLogin) {
                return;
            }
            if (this._isLoggedIn) {
                this.connection.send({ type: "ping" });
            }
            this.pingTimer = setTimeout(function () {
                _this.ping();
            }, 30 * 1000);
        };
        GW3ProtocolImpl.prototype.authToken = function () {
            var createTokenReq = {
                type: "create-token"
            };
            if (!this.globalDomain) {
                return Promise.reject(new Error("no global domain session"));
            }
            return this.globalDomain.send(createTokenReq)
                .then(function (res) {
                return res.token;
            });
        };
        GW3ProtocolImpl.prototype.getNewGWToken = function () {
            if (typeof window !== undefined) {
                var glue42gd = window.glue42gd;
                if (glue42gd) {
                    return glue42gd.getGWToken();
                }
            }
            return Promise.reject(new Error("not running in GD"));
        };
        return GW3ProtocolImpl;
    }());

    var MessageReplayerImpl = (function () {
        function MessageReplayerImpl(specs) {
            this.specsNames = [];
            this.messages = {};
            this.subs = {};
            this.subsRefCount = {};
            this.specs = {};
            for (var _i = 0, specs_1 = specs; _i < specs_1.length; _i++) {
                var spec = specs_1[_i];
                this.specs[spec.name] = spec;
                this.specsNames.push(spec.name);
            }
        }
        MessageReplayerImpl.prototype.init = function (connection) {
            var _this = this;
            this.connection = connection;
            for (var _i = 0, _a = this.specsNames; _i < _a.length; _i++) {
                var name_1 = _a[_i];
                var _loop_1 = function (type) {
                    var refCount = this_1.subsRefCount[type];
                    if (!refCount) {
                        refCount = 0;
                    }
                    refCount += 1;
                    this_1.subsRefCount[type] = refCount;
                    if (refCount > 1) {
                        return "continue";
                    }
                    var sub = connection.on(type, function (msg) { return _this.processMessage(type, msg); });
                    this_1.subs[type] = sub;
                };
                var this_1 = this;
                for (var _b = 0, _c = this.specs[name_1].types; _b < _c.length; _b++) {
                    var type = _c[_b];
                    _loop_1(type);
                }
            }
        };
        MessageReplayerImpl.prototype.processMessage = function (type, msg) {
            if (this.isDone || !msg) {
                return;
            }
            for (var _i = 0, _a = this.specsNames; _i < _a.length; _i++) {
                var name_2 = _a[_i];
                if (this.specs[name_2].types.indexOf(type) !== -1) {
                    var messages = this.messages[name_2] || [];
                    this.messages[name_2] = messages;
                    messages.push(msg);
                }
            }
        };
        MessageReplayerImpl.prototype.drain = function (name, callback) {
            var _a;
            if (callback) {
                (this.messages[name] || []).forEach(callback);
            }
            delete this.messages[name];
            for (var _i = 0, _b = this.specs[name].types; _i < _b.length; _i++) {
                var type = _b[_i];
                this.subsRefCount[type] -= 1;
                if (this.subsRefCount[type] <= 0) {
                    (_a = this.connection) === null || _a === void 0 ? void 0 : _a.off(this.subs[type]);
                    delete this.subs[type];
                    delete this.subsRefCount[type];
                }
            }
            delete this.specs[name];
            if (!this.specs.length) {
                this.isDone = true;
            }
        };
        return MessageReplayerImpl;
    }());

    var Connection = (function () {
        function Connection(settings, logger) {
            this.settings = settings;
            this.logger = logger;
            this.messageHandlers = {};
            this.ids = 1;
            this.registry = lib$2();
            this._connected = false;
            this.isTrace = false;
            settings = settings || {};
            settings.reconnectAttempts = settings.reconnectAttempts || 10;
            settings.reconnectInterval = settings.reconnectInterval || 1000;
            if (settings.inproc) {
                this.transport = new InProcTransport(settings.inproc, logger.subLogger("inMemory"));
            }
            else if (settings.sharedWorker) {
                this.transport = new SharedWorkerTransport(settings.sharedWorker, logger.subLogger("shared-worker"));
            }
            else if (settings.ws !== undefined) {
                this.transport = new WS(settings, logger.subLogger("ws"));
            }
            else {
                throw new Error("No connection information specified");
            }
            this.isTrace = logger.canPublish("trace");
            logger.info("starting with " + this.transport.name() + " transport");
            this.protocol = new GW3ProtocolImpl(this, settings, logger.subLogger("protocol"));
            this.transport.onConnectedChanged(this.handleConnectionChanged.bind(this));
            this.transport.onMessage(this.handleTransportMessage.bind(this));
            if (settings.replaySpecs && settings.replaySpecs.length) {
                this.replayer = new MessageReplayerImpl(settings.replaySpecs);
                this.replayer.init(this);
            }
        }
        Object.defineProperty(Connection.prototype, "protocolVersion", {
            get: function () {
                var _a;
                return (_a = this.protocol) === null || _a === void 0 ? void 0 : _a.protocolVersion;
            },
            enumerable: true,
            configurable: true
        });
        Connection.prototype.send = function (message, options) {
            if (this.transport.sendObject &&
                this.transport.isObjectBasedTransport) {
                var msg = this.protocol.createObjectMessage(message);
                if (this.isTrace) {
                    this.logger.trace(">> " + JSON.stringify(msg));
                }
                return this.transport.sendObject(msg, options);
            }
            else {
                var strMessage = this.protocol.createStringMessage(message);
                if (this.isTrace) {
                    this.logger.trace(">> " + strMessage);
                }
                return this.transport.send(strMessage, options);
            }
        };
        Connection.prototype.on = function (type, messageHandler) {
            type = type.toLowerCase();
            if (this.messageHandlers[type] === undefined) {
                this.messageHandlers[type] = {};
            }
            var id = this.ids++;
            this.messageHandlers[type][id] = messageHandler;
            return {
                type: type,
                id: id,
            };
        };
        Connection.prototype.off = function (info) {
            delete this.messageHandlers[info.type.toLowerCase()][info.id];
        };
        Object.defineProperty(Connection.prototype, "isConnected", {
            get: function () {
                return this.protocol.isLoggedIn;
            },
            enumerable: true,
            configurable: true
        });
        Connection.prototype.connected = function (callback) {
            var _this = this;
            return this.protocol.loggedIn(function () {
                callback(_this.settings.ws || _this.settings.sharedWorker || "");
            });
        };
        Connection.prototype.disconnected = function (callback) {
            return this.registry.add("disconnected", callback);
        };
        Connection.prototype.login = function (authRequest, reconnect) {
            return __awaiter$1(this, void 0, void 0, function () {
                var identity;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.transport.open()];
                        case 1:
                            _a.sent();
                            identity = this.protocol.login(authRequest, reconnect);
                            return [2, identity];
                    }
                });
            });
        };
        Connection.prototype.logout = function () {
            return __awaiter$1(this, void 0, void 0, function () {
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.protocol.logout()];
                        case 1:
                            _a.sent();
                            return [4, this.transport.close()];
                        case 2:
                            _a.sent();
                            return [2];
                    }
                });
            });
        };
        Connection.prototype.loggedIn = function (callback) {
            return this.protocol.loggedIn(callback);
        };
        Connection.prototype.domain = function (domain, successMessages, errorMessages) {
            return this.protocol.domain(domain, this.logger.subLogger("domain=" + domain), successMessages, errorMessages);
        };
        Connection.prototype.authToken = function () {
            return this.protocol.authToken();
        };
        Connection.prototype.reconnect = function () {
            return this.transport.reconnect();
        };
        Connection.prototype.distributeMessage = function (message, type) {
            var _this = this;
            var handlers = this.messageHandlers[type.toLowerCase()];
            if (handlers !== undefined) {
                Object.keys(handlers).forEach(function (handlerId) {
                    var handler = handlers[handlerId];
                    if (handler !== undefined) {
                        try {
                            handler(message);
                        }
                        catch (error) {
                            _this.logger.error("Message handler failed with " + error.stack, error);
                        }
                    }
                });
            }
        };
        Connection.prototype.handleConnectionChanged = function (connected) {
            if (this._connected === connected) {
                return;
            }
            this._connected = connected;
            if (connected) {
                this.registry.execute("connected");
            }
            else {
                this.registry.execute("disconnected");
            }
        };
        Connection.prototype.handleTransportMessage = function (msg) {
            var msgObj;
            if (typeof msg === "string") {
                msgObj = this.protocol.processStringMessage(msg);
            }
            else {
                msgObj = this.protocol.processObjectMessage(msg);
            }
            if (this.isTrace) {
                this.logger.trace("<< " + JSON.stringify(msgObj));
            }
            this.distributeMessage(msgObj.msg, msgObj.msgType);
        };
        return Connection;
    }());

    var order = ["trace", "debug", "info", "warn", "error", "off"];
    var Logger = (function () {
        function Logger(name, parent, logFn) {
            this.name = name;
            this.parent = parent;
            this.subLoggers = [];
            this.logFn = console;
            this.customLogFn = false;
            this.name = name;
            if (parent) {
                this.path = parent.path + "." + name;
            }
            else {
                this.path = name;
            }
            this.loggerFullName = "[" + this.path + "]";
            this.includeTimeAndLevel = !logFn;
            if (logFn) {
                this.logFn = logFn;
                this.customLogFn = true;
            }
        }
        Logger.prototype.subLogger = function (name) {
            var existingSub = this.subLoggers.filter(function (subLogger) {
                return subLogger.name === name;
            })[0];
            if (existingSub !== undefined) {
                return existingSub;
            }
            Object.keys(this).forEach(function (key) {
                if (key === name) {
                    throw new Error("This sub logger name is not allowed.");
                }
            });
            var sub = new Logger(name, this, this.customLogFn ? this.logFn : undefined);
            this.subLoggers.push(sub);
            return sub;
        };
        Logger.prototype.publishLevel = function (level) {
            var _a;
            if (level) {
                this._publishLevel = level;
            }
            return this._publishLevel || ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.publishLevel());
        };
        Logger.prototype.consoleLevel = function (level) {
            var _a;
            if (level) {
                this._consoleLevel = level;
            }
            return this._consoleLevel || ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.consoleLevel());
        };
        Logger.prototype.log = function (message, level, error) {
            this.publishMessage(level || "info", message, error);
        };
        Logger.prototype.trace = function (message) {
            this.log(message, "trace");
        };
        Logger.prototype.debug = function (message) {
            this.log(message, "debug");
        };
        Logger.prototype.info = function (message) {
            this.log(message, "info");
        };
        Logger.prototype.warn = function (message) {
            this.log(message, "warn");
        };
        Logger.prototype.error = function (message, err) {
            this.log(message, "error");
        };
        Logger.prototype.canPublish = function (level, compareWith) {
            var levelIdx = order.indexOf(level);
            var restrictionIdx = order.indexOf(compareWith || this.consoleLevel() || "trace");
            return levelIdx >= restrictionIdx;
        };
        Logger.prototype.publishMessage = function (level, message, error) {
            var _a, _b;
            var loggerName = this.loggerFullName;
            if (level === "error" && !error) {
                var e = new Error();
                if (e.stack) {
                    message =
                        message +
                            "\n" +
                            e.stack
                                .split("\n")
                                .slice(3)
                                .join("\n");
                }
            }
            if (this.canPublish(level, this.publishLevel())) {
                if (((_a = Logger.Interop) === null || _a === void 0 ? void 0 : _a.methods({ name: Logger.InteropMethodName }).length) > 0) {
                    (_b = Logger.Interop) === null || _b === void 0 ? void 0 : _b.invoke(Logger.InteropMethodName, {
                        msg: "" + message,
                        logger: loggerName,
                        level: level
                    });
                }
            }
            if (this.canPublish(level)) {
                var prefix = "";
                if (this.includeTimeAndLevel) {
                    var date = new Date();
                    var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds();
                    prefix = "[" + time + "] [" + level + "] ";
                }
                var toPrint = "" + prefix + loggerName + ": " + message;
                switch (level) {
                    case "trace":
                        this.logFn.debug(toPrint);
                        break;
                    case "debug":
                        if (this.logFn.debug) {
                            this.logFn.debug(toPrint);
                        }
                        else {
                            this.logFn.log(toPrint);
                        }
                        break;
                    case "info":
                        this.logFn.info(toPrint);
                        break;
                    case "warn":
                        this.logFn.warn(toPrint);
                        break;
                    case "error":
                        this.logFn.error(toPrint, error);
                        break;
                }
            }
        };
        Logger.InteropMethodName = "T42.AppLogger.Log";
        return Logger;
    }());

    var GW_MESSAGE_CREATE_CONTEXT = "create-context";
    var GW_MESSAGE_ACTIVITY_CREATED = "created";
    var GW_MESSAGE_ACTIVITY_DESTROYED = "destroyed";
    var GW_MESSAGE_CONTEXT_CREATED = "context-created";
    var GW_MESSAGE_CONTEXT_ADDED = "context-added";
    var GW_MESSAGE_SUBSCRIBE_CONTEXT = "subscribe-context";
    var GW_MESSAGE_SUBSCRIBED_CONTEXT = "subscribed-context";
    var GW_MESSAGE_UNSUBSCRIBE_CONTEXT = "unsubscribe-context";
    var GW_MESSAGE_DESTROY_CONTEXT = "destroy-context";
    var GW_MESSAGE_CONTEXT_DESTROYED = "context-destroyed";
    var GW_MESSAGE_UPDATE_CONTEXT = "update-context";
    var GW_MESSAGE_CONTEXT_UPDATED = "context-updated";
    var GW_MESSAGE_JOINED_ACTIVITY = "joined";

    var ContextMessageReplaySpec = {
        get name() {
            return "context";
        },
        get types() {
            return [
                GW_MESSAGE_CREATE_CONTEXT,
                GW_MESSAGE_ACTIVITY_CREATED,
                GW_MESSAGE_ACTIVITY_DESTROYED,
                GW_MESSAGE_CONTEXT_CREATED,
                GW_MESSAGE_CONTEXT_ADDED,
                GW_MESSAGE_SUBSCRIBE_CONTEXT,
                GW_MESSAGE_SUBSCRIBED_CONTEXT,
                GW_MESSAGE_UNSUBSCRIBE_CONTEXT,
                GW_MESSAGE_DESTROY_CONTEXT,
                GW_MESSAGE_CONTEXT_DESTROYED,
                GW_MESSAGE_UPDATE_CONTEXT,
                GW_MESSAGE_CONTEXT_UPDATED,
                GW_MESSAGE_JOINED_ACTIVITY
            ];
        }
    };

    var version$2 = "5.0.1";

    function prepareConfig (configuration, ext, glue42gd) {
        var _a, _b, _c, _d;
        var nodeStartingContext;
        if (Utils.isNode()) {
            var startingContextString = process.env._GD_STARTING_CONTEXT_;
            if (startingContextString) {
                try {
                    nodeStartingContext = JSON.parse(startingContextString);
                }
                catch (_e) {
                }
            }
        }
        function getConnection() {
            var _a, _b, _c, _d;
            var gwConfig = configuration.gateway;
            var protocolVersion = (_a = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.protocolVersion) !== null && _a !== void 0 ? _a : 3;
            var reconnectInterval = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.reconnectInterval;
            var reconnectAttempts = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.reconnectAttempts;
            var defaultWs = "ws://localhost:8385";
            var ws = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.ws;
            var sharedWorker = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.sharedWorker;
            var inproc = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.inproc;
            if (glue42gd) {
                ws = glue42gd.gwURL;
            }
            if (Utils.isNode() && nodeStartingContext && nodeStartingContext.gwURL) {
                ws = nodeStartingContext.gwURL;
            }
            if (!ws && !sharedWorker && !inproc) {
                ws = defaultWs;
            }
            var instanceId;
            var windowId;
            var pid;
            var environment;
            var region;
            var appName = getApplication();
            var uniqueAppName = appName;
            if (typeof glue42gd !== "undefined") {
                windowId = glue42gd.windowId;
                pid = glue42gd.pid;
                if (glue42gd.env) {
                    environment = glue42gd.env.env;
                    region = glue42gd.env.region;
                }
                uniqueAppName = (_b = glue42gd.application) !== null && _b !== void 0 ? _b : "glue-app";
                instanceId = glue42gd.appInstanceId;
            }
            else if (Utils.isNode()) {
                pid = process.pid;
                if (nodeStartingContext) {
                    environment = nodeStartingContext.env;
                    region = nodeStartingContext.region;
                    instanceId = nodeStartingContext.instanceId;
                }
            }
            else {
                windowId = window.name || shortid$1();
            }
            var replaySpecs = (_d = (_c = configuration.gateway) === null || _c === void 0 ? void 0 : _c.replaySpecs) !== null && _d !== void 0 ? _d : [];
            replaySpecs.push(ContextMessageReplaySpec);
            return {
                identity: {
                    application: uniqueAppName,
                    applicationName: appName,
                    windowId: windowId,
                    instance: instanceId,
                    process: pid,
                    region: region,
                    environment: environment,
                    api: ext.version || version$2
                },
                reconnectInterval: reconnectInterval,
                ws: ws,
                sharedWorker: sharedWorker,
                inproc: inproc,
                protocolVersion: protocolVersion,
                reconnectAttempts: reconnectAttempts,
                replaySpecs: replaySpecs,
            };
        }
        function getApplication() {
            if (configuration.application) {
                return configuration.application;
            }
            if (glue42gd) {
                return glue42gd.applicationName;
            }
            var uid = shortid$1();
            if (Utils.isNode()) {
                if (nodeStartingContext) {
                    return nodeStartingContext.applicationConfig.name;
                }
                return "NodeJS" + uid;
            }
            if (typeof window !== "undefined" && typeof document !== "undefined") {
                return document.title + (" (" + uid + ")");
            }
            return uid;
        }
        function getAuth() {
            var _a, _b;
            if (typeof configuration.auth === "string") {
                return {
                    token: configuration.auth
                };
            }
            if (configuration.auth) {
                return configuration.auth;
            }
            if (Utils.isNode() && nodeStartingContext && nodeStartingContext.gwToken) {
                return {
                    gatewayToken: nodeStartingContext.gwToken
                };
            }
            if (((_a = configuration.gateway) === null || _a === void 0 ? void 0 : _a.inproc) || ((_b = configuration.gateway) === null || _b === void 0 ? void 0 : _b.sharedWorker)) {
                return {
                    username: "glue42", password: "glue42"
                };
            }
        }
        function getLogger() {
            var _a, _b;
            var config = configuration.logger;
            var defaultLevel = "error";
            if (!config) {
                config = defaultLevel;
            }
            if (typeof config === "string") {
                return { console: config, publish: defaultLevel };
            }
            return {
                console: (_a = config.console) !== null && _a !== void 0 ? _a : defaultLevel,
                publish: (_b = config.publish) !== null && _b !== void 0 ? _b : defaultLevel
            };
        }
        var connection = getConnection();
        return {
            bus: (_a = configuration.bus) !== null && _a !== void 0 ? _a : false,
            auth: getAuth(),
            logger: getLogger(),
            connection: connection,
            metrics: (_b = configuration.metrics) !== null && _b !== void 0 ? _b : true,
            contexts: (_c = configuration.contexts) !== null && _c !== void 0 ? _c : true,
            version: ext.version || version$2,
            libs: (_d = ext.libs) !== null && _d !== void 0 ? _d : [],
            customLogger: configuration.customLogger
        };
    }

    function timer () {
        function now() {
            return new Date().getTime();
        }
        var startTime = now();
        var endTime;
        var period;
        function stop() {
            endTime = now();
            period = now() - startTime;
            return period;
        }
        return {
            get startTime() {
                return startTime;
            },
            get endTime() {
                return endTime;
            },
            get period() {
                return period;
            },
            stop: stop
        };
    }

    var GW3ContextData = (function () {
        function GW3ContextData(contextId, name, isAnnounced, activityId) {
            this.updateCallbacks = {};
            this.contextId = contextId;
            this.name = name;
            this.isAnnounced = isAnnounced;
            this.activityId = activityId;
            this.context = {};
        }
        GW3ContextData.prototype.hasCallbacks = function () {
            return Object.keys(this.updateCallbacks).length > 0;
        };
        GW3ContextData.prototype.getState = function () {
            if (this.isAnnounced && this.hasCallbacks()) {
                return 3;
            }
            if (this.isAnnounced) {
                return 2;
            }
            if (this.hasCallbacks()) {
                return 1;
            }
            return 0;
        };
        return GW3ContextData;
    }());

    function applyContextDelta(context, delta) {
        if (delta) {
            if (delta.reset) {
                context = __assign$1({}, delta.reset);
                return context;
            }
            context = deepClone(context, undefined);
            var added_1 = delta.added;
            var updated_1 = delta.updated;
            var removed = delta.removed;
            if (added_1) {
                Object.keys(added_1).forEach(function (key) {
                    context[key] = added_1[key];
                });
            }
            if (updated_1) {
                Object.keys(updated_1).forEach(function (key) {
                    mergeObjectsProperties(key, context, updated_1);
                });
            }
            if (removed) {
                removed.forEach(function (key) {
                    delete context[key];
                });
            }
        }
        return context;
    }
    function deepClone(obj, hash) {
        hash = hash || new WeakMap();
        if (Object(obj) !== obj) {
            return obj;
        }
        if (obj instanceof Set) {
            return new Set(obj);
        }
        if (hash.has(obj)) {
            return hash.get(obj);
        }
        var result = obj instanceof Date ? new Date(obj)
            : obj instanceof RegExp ? new RegExp(obj.source, obj.flags)
                : obj.constructor ? new obj.constructor()
                    : Object.create(null);
        hash.set(obj, result);
        return Object.assign.apply(Object, __spreadArrays([result], Object.keys(obj).map(function (key) {
            var _a;
            return (_a = {}, _a[key] = deepClone(obj[key], hash), _a);
        })));
    }
    var mergeObjectsProperties = function (key, what, withWhat) {
        var right = withWhat[key];
        if (right === undefined) {
            return what;
        }
        var left = what[key];
        if (!left || !right) {
            what[key] = right;
            return what;
        }
        if (typeof left === "string" ||
            typeof left === "number" ||
            typeof left === "boolean" ||
            typeof right === "string" ||
            typeof right === "number" ||
            typeof right === "boolean" ||
            Array.isArray(left) ||
            Array.isArray(right)) {
            what[key] = right;
            return what;
        }
        what[key] = Object.assign({}, left, right);
        return what;
    };
    function deepEqual(x, y) {
        if (x === y) {
            return true;
        }
        if (!(x instanceof Object) || !(y instanceof Object)) {
            return false;
        }
        if (x.constructor !== y.constructor) {
            return false;
        }
        for (var p in x) {
            if (!x.hasOwnProperty(p)) {
                continue;
            }
            if (!y.hasOwnProperty(p)) {
                return false;
            }
            if (x[p] === y[p]) {
                continue;
            }
            if (typeof (x[p]) !== "object") {
                return false;
            }
            if (!deepEqual(x[p], y[p])) {
                return false;
            }
        }
        for (var p in y) {
            if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
                return false;
            }
        }
        return true;
    }

    var GW3Bridge = (function () {
        function GW3Bridge(config) {
            var _this = this;
            var _a;
            this._contextNameToData = {};
            this._gw3Subscriptions = [];
            this._nextCallbackSubscriptionNumber = 0;
            this._contextNameToId = {};
            this._contextIdToName = {};
            this._connection = config.connection;
            this._logger = config.logger;
            this._gw3Session = this._connection.domain("global", [
                GW_MESSAGE_CONTEXT_CREATED,
                GW_MESSAGE_SUBSCRIBED_CONTEXT,
                GW_MESSAGE_CONTEXT_DESTROYED,
                GW_MESSAGE_CONTEXT_UPDATED,
            ]);
            this.subscribeToContextCreatedMessages();
            this.subscribeToContextUpdatedMessages();
            this.subscribeToContextDestroyedMessages();
            (_a = this._connection.replayer) === null || _a === void 0 ? void 0 : _a.drain(ContextMessageReplaySpec.name, function (message) {
                var type = message.type;
                if (!type) {
                    return;
                }
                if (type === GW_MESSAGE_CONTEXT_CREATED ||
                    type === GW_MESSAGE_CONTEXT_ADDED ||
                    type === GW_MESSAGE_ACTIVITY_CREATED) {
                    _this.handleContextCreatedMessage(message);
                }
                else if (type === GW_MESSAGE_SUBSCRIBED_CONTEXT ||
                    type === GW_MESSAGE_CONTEXT_UPDATED ||
                    type === GW_MESSAGE_JOINED_ACTIVITY) {
                    _this.handleContextUpdatedMessage(message);
                }
                else if (type === GW_MESSAGE_CONTEXT_DESTROYED ||
                    type === GW_MESSAGE_ACTIVITY_DESTROYED) {
                    _this.handleContextDestroyedMessage(message);
                }
            });
        }
        GW3Bridge.prototype.dispose = function () {
            for (var _i = 0, _a = this._gw3Subscriptions; _i < _a.length; _i++) {
                var sub = _a[_i];
                this._connection.off(sub);
            }
            this._gw3Subscriptions.length = 0;
            for (var contextName in this._contextNameToData) {
                if (this._contextNameToId.hasOwnProperty(contextName)) {
                    delete this._contextNameToData[contextName];
                }
            }
        };
        GW3Bridge.prototype.createContext = function (name, data) {
            var _this = this;
            return this._gw3Session
                .send({
                type: GW_MESSAGE_CREATE_CONTEXT,
                domain: "global",
                name: name,
                data: data,
                lifetime: "retained",
            })
                .then(function (createContextMsg) {
                _this._contextNameToId[name] = createContextMsg.context_id;
                if (!_this._contextIdToName[createContextMsg.context_id]) {
                    _this._contextIdToName[createContextMsg.context_id] = name;
                    var contextData = _this._contextNameToData[name] || new GW3ContextData(createContextMsg.context_id, name, true, undefined);
                    contextData.isAnnounced = true;
                    contextData.name = name;
                    contextData.contextId = createContextMsg.context_id;
                    _this._contextNameToData[name] = contextData;
                    contextData.context = createContextMsg.data;
                    contextData.sentExplicitSubscription = true;
                    if (contextData.context) {
                        _this.invokeUpdateCallbacks(contextData, contextData.context, undefined);
                    }
                    return _this.update(name, data).then(function () { return createContextMsg.context_id; });
                }
                return createContextMsg.context_id;
            });
        };
        GW3Bridge.prototype.all = function () {
            var _this = this;
            return Object.keys(this._contextNameToData)
                .filter(function (name) { return _this._contextNameToData[name].isAnnounced; });
        };
        GW3Bridge.prototype.update = function (name, delta) {
            return __awaiter$1(this, void 0, void 0, function () {
                var contextData, currentContext, calculatedDelta;
                var _this = this;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            contextData = this._contextNameToData[name];
                            if (!contextData || !contextData.isAnnounced) {
                                return [2, this.createContext(name, delta)];
                            }
                            currentContext = contextData.context;
                            if (!!contextData.hasCallbacks()) return [3, 2];
                            return [4, this.get(contextData.name, false)];
                        case 1:
                            currentContext = _a.sent();
                            _a.label = 2;
                        case 2:
                            calculatedDelta = this.calculateContextDelta(currentContext, delta);
                            if (!Object.keys(calculatedDelta.added).length
                                && !Object.keys(calculatedDelta.updated).length
                                && !calculatedDelta.removed.length) {
                                return [2, Promise.resolve()];
                            }
                            return [2, this._gw3Session
                                    .send({
                                    type: GW_MESSAGE_UPDATE_CONTEXT,
                                    domain: "global",
                                    context_id: contextData.contextId,
                                    delta: calculatedDelta,
                                }, {}, { skipPeerId: false })
                                    .then(function (gwResponse) {
                                    _this.handleUpdated(contextData, calculatedDelta, {
                                        updaterId: gwResponse.peer_id
                                    });
                                })];
                    }
                });
            });
        };
        GW3Bridge.prototype.set = function (name, data) {
            var _this = this;
            var contextData = this._contextNameToData[name];
            if (!contextData || !contextData.isAnnounced) {
                return this.createContext(name, data);
            }
            return this._gw3Session
                .send({
                type: GW_MESSAGE_UPDATE_CONTEXT,
                domain: "global",
                context_id: contextData.contextId,
                delta: { reset: data },
            }, {}, { skipPeerId: false })
                .then(function (gwResponse) {
                _this.handleUpdated(contextData, { reset: data, added: {}, removed: [], updated: {} }, { updaterId: gwResponse.peer_id });
            });
        };
        GW3Bridge.prototype.get = function (name, resolveImmediately) {
            var _this = this;
            if (resolveImmediately === undefined) {
                resolveImmediately = true;
            }
            var contextData = this._contextNameToData[name];
            if (!contextData ||
                !contextData.isAnnounced ||
                !contextData.hasCallbacks()) {
                if (!resolveImmediately) {
                    return new Promise(function (resolve, reject) { return __awaiter$1(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator$1(this, function (_a) {
                            this.subscribe(name, function (data, delta, removed, un) {
                                _this.unsubscribe(un);
                                resolve(data);
                            });
                            return [2];
                        });
                    }); });
                }
            }
            return Promise.resolve(contextData && contextData.context);
        };
        GW3Bridge.prototype.subscribe = function (name, callback) {
            var thisCallbackSubscriptionNumber = this._nextCallbackSubscriptionNumber;
            this._nextCallbackSubscriptionNumber += 1;
            var contextData = this._contextNameToData[name];
            if (!contextData ||
                !contextData.isAnnounced) {
                contextData = contextData || new GW3ContextData(undefined, name, false, undefined);
                this._contextNameToData[name] = contextData;
                contextData.updateCallbacks[thisCallbackSubscriptionNumber] = callback;
                return Promise.resolve(thisCallbackSubscriptionNumber);
            }
            var hadCallbacks = contextData.hasCallbacks();
            contextData.updateCallbacks[thisCallbackSubscriptionNumber] = callback;
            if (!hadCallbacks) {
                if (!contextData.joinedActivity) {
                    if (contextData.context &&
                        contextData.sentExplicitSubscription) {
                        callback(contextData.context, contextData.context, [], thisCallbackSubscriptionNumber);
                        return Promise.resolve(thisCallbackSubscriptionNumber);
                    }
                    return this.sendSubscribe(contextData)
                        .then(function () { return thisCallbackSubscriptionNumber; });
                }
                else {
                    callback(contextData.context, contextData.context, [], thisCallbackSubscriptionNumber);
                    return Promise.resolve(thisCallbackSubscriptionNumber);
                }
            }
            else {
                callback(contextData.context, contextData.context, [], thisCallbackSubscriptionNumber);
                return Promise.resolve(thisCallbackSubscriptionNumber);
            }
        };
        GW3Bridge.prototype.unsubscribe = function (subscriptionKey) {
            for (var _i = 0, _a = Object.keys(this._contextNameToData); _i < _a.length; _i++) {
                var name_1 = _a[_i];
                var contextId = this._contextNameToId[name_1];
                var contextData = this._contextNameToData[name_1];
                if (!contextData) {
                    return;
                }
                var hadCallbacks = contextData.hasCallbacks();
                delete contextData.updateCallbacks[subscriptionKey];
                if (contextData.isAnnounced &&
                    hadCallbacks &&
                    !contextData.hasCallbacks() &&
                    contextData.sentExplicitSubscription) {
                    this.sendUnsubscribe(contextData);
                }
                if (!contextData.isAnnounced &&
                    !contextData.hasCallbacks()) {
                    delete this._contextNameToData[name_1];
                }
            }
        };
        GW3Bridge.prototype.handleUpdated = function (contextData, delta, extraData) {
            var oldContext = contextData.context;
            contextData.context = applyContextDelta(contextData.context, delta);
            if (this._contextNameToData[contextData.name] === contextData &&
                !deepEqual(oldContext, contextData.context)) {
                this.invokeUpdateCallbacks(contextData, contextData.context, delta, extraData);
            }
        };
        GW3Bridge.prototype.subscribeToContextCreatedMessages = function () {
            var createdMessageTypes = [
                GW_MESSAGE_CONTEXT_ADDED,
                GW_MESSAGE_CONTEXT_CREATED,
                GW_MESSAGE_ACTIVITY_CREATED,
            ];
            for (var _i = 0, createdMessageTypes_1 = createdMessageTypes; _i < createdMessageTypes_1.length; _i++) {
                var createdMessageType = createdMessageTypes_1[_i];
                var sub = this._connection.on(createdMessageType, this.handleContextCreatedMessage.bind(this));
                this._gw3Subscriptions.push(sub);
            }
        };
        GW3Bridge.prototype.handleContextCreatedMessage = function (contextCreatedMsg) {
            var createdMessageType = contextCreatedMsg.type;
            if (createdMessageType === GW_MESSAGE_ACTIVITY_CREATED) {
                this._contextNameToId[contextCreatedMsg.activity_id] = contextCreatedMsg.context_id;
                this._contextIdToName[contextCreatedMsg.context_id] = contextCreatedMsg.activity_id;
            }
            else if (createdMessageType === GW_MESSAGE_CONTEXT_ADDED) {
                this._contextNameToId[contextCreatedMsg.name] = contextCreatedMsg.context_id;
                this._contextIdToName[contextCreatedMsg.context_id] = contextCreatedMsg.name;
            }
            var name = this._contextIdToName[contextCreatedMsg.context_id];
            if (!name) {
                throw new Error("Received created event for context with unknown name: " + contextCreatedMsg.context_id);
            }
            if (!this._contextNameToId[name]) {
                throw new Error("Received created event for context with unknown id: " + contextCreatedMsg.context_id);
            }
            var contextData = this._contextNameToData[name];
            if (contextData) {
                if (contextData.isAnnounced) {
                    return;
                }
                else {
                    if (!contextData.hasCallbacks()) {
                        throw new Error("Assertion failure: contextData.hasCallbacks()");
                    }
                    contextData.isAnnounced = true;
                    contextData.contextId = contextCreatedMsg.context_id;
                    contextData.activityId = contextCreatedMsg.activity_id;
                    if (!contextData.sentExplicitSubscription) {
                        this.sendSubscribe(contextData);
                    }
                }
            }
            else {
                this._contextNameToData[name] = contextData =
                    new GW3ContextData(contextCreatedMsg.context_id, name, true, contextCreatedMsg.activity_id);
            }
        };
        GW3Bridge.prototype.subscribeToContextUpdatedMessages = function () {
            var updatedMessageTypes = [
                GW_MESSAGE_CONTEXT_UPDATED,
                GW_MESSAGE_SUBSCRIBED_CONTEXT,
                GW_MESSAGE_JOINED_ACTIVITY,
            ];
            for (var _i = 0, updatedMessageTypes_1 = updatedMessageTypes; _i < updatedMessageTypes_1.length; _i++) {
                var updatedMessageType = updatedMessageTypes_1[_i];
                var sub = this._connection.on(updatedMessageType, this.handleContextUpdatedMessage.bind(this));
                this._gw3Subscriptions.push(sub);
            }
        };
        GW3Bridge.prototype.handleContextUpdatedMessage = function (contextUpdatedMsg) {
            var updatedMessageType = contextUpdatedMsg.type;
            var contextId = contextUpdatedMsg.context_id;
            var contextData = this._contextNameToData[this._contextIdToName[contextId]];
            var justSeen = !contextData || !contextData.isAnnounced;
            if (updatedMessageType === GW_MESSAGE_JOINED_ACTIVITY) {
                if (!contextData) {
                    contextData = new GW3ContextData(contextId, contextUpdatedMsg.activity_id, true, contextUpdatedMsg.activity_id);
                    this._contextNameToData[contextUpdatedMsg.activity_id] = contextData;
                    this._contextIdToName[contextId] = contextUpdatedMsg.activity_id;
                    this._contextNameToId[contextUpdatedMsg.activity_id] = contextId;
                }
                else {
                    contextData.contextId = contextId;
                    contextData.isAnnounced = true;
                    contextData.activityId = contextUpdatedMsg.activity_id;
                }
                contextData.joinedActivity = true;
            }
            else {
                if (!contextData || !contextData.isAnnounced) {
                    if (updatedMessageType === GW_MESSAGE_SUBSCRIBED_CONTEXT) {
                        contextData = contextData || new GW3ContextData(contextId, contextUpdatedMsg.name, true, undefined);
                        contextData.sentExplicitSubscription = true;
                        this._contextNameToData[contextUpdatedMsg.name] = contextData;
                        this._contextIdToName[contextId] = contextUpdatedMsg.name;
                        this._contextNameToId[contextUpdatedMsg.name] = contextId;
                    }
                    else {
                        this._logger.error("Received 'update' for unknown context: " + contextId);
                    }
                    return;
                }
            }
            var oldContext = contextData.context;
            if (updatedMessageType === GW_MESSAGE_SUBSCRIBED_CONTEXT) {
                contextData.context = contextUpdatedMsg.data || {};
            }
            else if (updatedMessageType === GW_MESSAGE_JOINED_ACTIVITY) {
                contextData.context = contextUpdatedMsg.context_snapshot || {};
            }
            else if (updatedMessageType === GW_MESSAGE_CONTEXT_UPDATED) {
                contextData.context = applyContextDelta(contextData.context, contextUpdatedMsg.delta);
            }
            else {
                throw new Error("Unrecognized context update message " + updatedMessageType);
            }
            if (justSeen ||
                !deepEqual(contextData.context, oldContext) ||
                updatedMessageType === GW_MESSAGE_SUBSCRIBED_CONTEXT) {
                this.invokeUpdateCallbacks(contextData, contextData.context, contextUpdatedMsg.delta, { updaterId: contextUpdatedMsg.updater_id });
            }
        };
        GW3Bridge.prototype.invokeUpdateCallbacks = function (contextData, data, delta, extraData) {
            delta = delta || { added: {}, updated: {}, reset: {}, removed: [] };
            for (var updateCallbackIndex in contextData.updateCallbacks) {
                if (contextData.updateCallbacks.hasOwnProperty(updateCallbackIndex)) {
                    try {
                        var updateCallback = contextData.updateCallbacks[updateCallbackIndex];
                        updateCallback(deepClone(data), Object.assign({}, delta.added || {}, delta.updated || {}, delta.reset || {}), delta.removed, parseInt(updateCallbackIndex, 10), extraData);
                    }
                    catch (err) {
                        this._logger.debug("callback error: " + JSON.stringify(err));
                    }
                }
            }
        };
        GW3Bridge.prototype.subscribeToContextDestroyedMessages = function () {
            var destroyedMessageTypes = [
                GW_MESSAGE_CONTEXT_DESTROYED,
                GW_MESSAGE_ACTIVITY_DESTROYED,
            ];
            for (var _i = 0, destroyedMessageTypes_1 = destroyedMessageTypes; _i < destroyedMessageTypes_1.length; _i++) {
                var destroyedMessageType = destroyedMessageTypes_1[_i];
                var sub = this._connection.on(destroyedMessageType, this.handleContextDestroyedMessage.bind(this));
                this._gw3Subscriptions.push(sub);
            }
        };
        GW3Bridge.prototype.handleContextDestroyedMessage = function (destroyedMsg) {
            var destroyedMessageType = destroyedMsg.type;
            var contextId;
            var name;
            if (destroyedMessageType === GW_MESSAGE_ACTIVITY_DESTROYED) {
                name = destroyedMsg.activity_id;
                contextId = this._contextNameToId[name];
                if (!contextId) {
                    this._logger.error("Received 'destroyed' for unknown activity: " + destroyedMsg.activity_id);
                    return;
                }
            }
            else {
                contextId = destroyedMsg.context_id;
                name = this._contextIdToName[contextId];
                if (!name) {
                    this._logger.error("Received 'destroyed' for unknown context: " + destroyedMsg.context_id);
                    return;
                }
            }
            delete this._contextIdToName[contextId];
            delete this._contextNameToId[name];
            var contextData = this._contextNameToData[name];
            delete this._contextNameToData[name];
            if (!contextData || !contextData.isAnnounced) {
                this._logger.error("Received 'destroyed' for unknown context: " + contextId);
                return;
            }
        };
        GW3Bridge.prototype.sendSubscribe = function (contextData) {
            contextData.sentExplicitSubscription = true;
            return this._gw3Session
                .send({
                type: GW_MESSAGE_SUBSCRIBE_CONTEXT,
                domain: "global",
                context_id: contextData.contextId,
            }).then(function (_) { return undefined; });
        };
        GW3Bridge.prototype.sendUnsubscribe = function (contextData) {
            contextData.sentExplicitSubscription = false;
            return this._gw3Session
                .send({
                type: GW_MESSAGE_UNSUBSCRIBE_CONTEXT,
                domain: "global",
                context_id: contextData.contextId,
            }).then(function (_) { return undefined; });
        };
        GW3Bridge.prototype.calculateContextDelta = function (from, to) {
            var delta = { added: {}, updated: {}, removed: [], reset: undefined };
            if (from) {
                for (var _i = 0, _a = Object.keys(from); _i < _a.length; _i++) {
                    var x = _a[_i];
                    if (Object.keys(to).indexOf(x) !== -1
                        && to[x] !== null
                        && !deepEqual(from[x], to[x])) {
                        delta.updated[x] = to[x];
                    }
                }
            }
            for (var _b = 0, _c = Object.keys(to); _b < _c.length; _b++) {
                var x = _c[_b];
                if (!from || (Object.keys(from).indexOf(x) === -1)) {
                    if (to[x] !== null) {
                        delta.added[x] = to[x];
                    }
                }
                else if (to[x] === null) {
                    delta.removed.push(x);
                }
            }
            return delta;
        };
        return GW3Bridge;
    }());

    var ContextsModule = (function () {
        function ContextsModule(config) {
            this._bridge = new GW3Bridge(config);
        }
        ContextsModule.prototype.all = function () {
            return this._bridge.all();
        };
        ContextsModule.prototype.update = function (name, delta) {
            this.checkName(name);
            return this._bridge.update(name, delta);
        };
        ContextsModule.prototype.set = function (name, data) {
            this.checkName(name);
            return this._bridge.set(name, data);
        };
        ContextsModule.prototype.subscribe = function (name, callback) {
            var _this = this;
            this.checkName(name);
            return this._bridge
                .subscribe(name, function (data, delta, removed, key, extraData) { return callback(data, delta, removed, function () { return _this._bridge.unsubscribe(key); }, extraData); })
                .then(function (key) {
                return function () {
                    _this._bridge.unsubscribe(key);
                };
            });
        };
        ContextsModule.prototype.get = function (name, resolveImmediately) {
            if (resolveImmediately === undefined) {
                resolveImmediately = true;
            }
            return this._bridge.get(name, resolveImmediately);
        };
        ContextsModule.prototype.ready = function () {
            return Promise.resolve(this);
        };
        ContextsModule.prototype.checkName = function (name) {
            if (typeof name !== "string" ||
                name === "") {
                throw new Error("'name' must be non-empty string, got '" + name + "'");
            }
        };
        return ContextsModule;
    }());

    function promisify (promise, successCallback, errorCallback) {
        if (typeof successCallback !== "function" && typeof errorCallback !== "function") {
            return promise;
        }
        if (typeof successCallback !== "function") {
            successCallback = function () { };
        }
        else if (typeof errorCallback !== "function") {
            errorCallback = function () { };
        }
        return promise.then(successCallback, errorCallback);
    }

    function rejectAfter(ms, error) {
        if (ms === void 0) { ms = 0; }
        return new Promise(function (resolve, reject) { return setTimeout(function () { return reject(error); }, ms); });
    }

    var InvokeStatus;
    (function (InvokeStatus) {
        InvokeStatus[InvokeStatus["Success"] = 0] = "Success";
        InvokeStatus[InvokeStatus["Error"] = 1] = "Error";
    })(InvokeStatus || (InvokeStatus = {}));
    var Client = (function () {
        function Client(protocol, repo, instance, configuration) {
            this.protocol = protocol;
            this.repo = repo;
            this.instance = instance;
            this.configuration = configuration;
        }
        Client.prototype.subscribe = function (method, options, successCallback, errorCallback, existingSub) {
            var _this = this;
            var callProtocolSubscribe = function (targetServers, stream, successProxy, errorProxy) {
                var _a;
                options.methodResponseTimeout = (_a = options.methodResponseTimeout) !== null && _a !== void 0 ? _a : options.waitTimeoutMs;
                _this.protocol.client.subscribe(stream, options, targetServers, successProxy, errorProxy, existingSub);
            };
            var promise = new Promise(function (resolve, reject) {
                var successProxy = function (sub) {
                    resolve(sub);
                };
                var errorProxy = function (err) {
                    reject(err);
                };
                if (!method) {
                    reject("Method definition is required. Please, provide either a unique string for a method name or a \u201CmethodDefinition\u201D object with a required \u201Cname\u201D property.");
                    return;
                }
                var methodDef;
                if (typeof method === "string") {
                    methodDef = { name: method };
                }
                else {
                    methodDef = method;
                }
                if (!methodDef.name) {
                    reject("Method definition is required. Please, provide either a unique string for a method name or a \u201CmethodDefinition\u201D object with a required \u201Cname\u201D property.");
                    return;
                }
                if (options === undefined) {
                    options = {};
                }
                var target = options.target;
                if (target === undefined) {
                    target = "best";
                }
                if (typeof target === "string" && target !== "all" && target !== "best") {
                    reject(new Error("\"" + target + "\" is not a valid target. Valid targets are \"all\", \"best\", or an instance."));
                    return;
                }
                if (options.methodResponseTimeout === undefined) {
                    options.methodResponseTimeout = options.method_response_timeout;
                    if (options.methodResponseTimeout === undefined) {
                        options.methodResponseTimeout = _this.configuration.methodResponseTimeout;
                    }
                }
                if (options.waitTimeoutMs === undefined) {
                    options.waitTimeoutMs = options.wait_for_method_timeout;
                    if (options.waitTimeoutMs === undefined) {
                        options.waitTimeoutMs = _this.configuration.waitTimeoutMs;
                    }
                }
                var delayStep = 500;
                var delayTillNow = 0;
                var currentServers = _this.getServerMethodsByFilterAndTarget(methodDef, target);
                if (currentServers.length > 0) {
                    callProtocolSubscribe(currentServers, currentServers[0].methods[0], successProxy, errorProxy);
                }
                else {
                    var retry_1 = function () {
                        if (!target || !(options.waitTimeoutMs)) {
                            return;
                        }
                        delayTillNow += delayStep;
                        currentServers = _this.getServerMethodsByFilterAndTarget(methodDef, target);
                        if (currentServers.length > 0) {
                            var streamInfo = currentServers[0].methods[0];
                            callProtocolSubscribe(currentServers, streamInfo, successProxy, errorProxy);
                        }
                        else if (delayTillNow >= options.waitTimeoutMs) {
                            var def = typeof method === "string" ? { name: method } : method;
                            callProtocolSubscribe(currentServers, def, successProxy, errorProxy);
                        }
                        else {
                            setTimeout(retry_1, delayStep);
                        }
                    };
                    setTimeout(retry_1, delayStep);
                }
            });
            return promisify(promise, successCallback, errorCallback);
        };
        Client.prototype.servers = function (methodFilter) {
            var filterCopy = methodFilter === undefined
                ? undefined
                : __assign$1({}, methodFilter);
            return this.getServers(filterCopy).map(function (serverMethodMap) {
                return serverMethodMap.server.instance;
            });
        };
        Client.prototype.methods = function (methodFilter) {
            var filterCopy = __assign$1({}, methodFilter);
            return this.getMethods(filterCopy);
        };
        Client.prototype.methodsForInstance = function (instance) {
            return this.getMethodsForInstance(instance);
        };
        Client.prototype.methodAdded = function (callback) {
            return this.repo.onMethodAdded(callback);
        };
        Client.prototype.methodRemoved = function (callback) {
            return this.repo.onMethodRemoved(callback);
        };
        Client.prototype.serverAdded = function (callback) {
            return this.repo.onServerAdded(callback);
        };
        Client.prototype.serverRemoved = function (callback) {
            return this.repo.onServerRemoved(function (server, reason) {
                callback(server, reason);
            });
        };
        Client.prototype.serverMethodAdded = function (callback) {
            return this.repo.onServerMethodAdded(function (server, method) {
                callback({ server: server, method: method });
            });
        };
        Client.prototype.serverMethodRemoved = function (callback) {
            return this.repo.onServerMethodRemoved(function (server, method) {
                callback({ server: server, method: method });
            });
        };
        Client.prototype.invoke = function (methodFilter, argumentObj, target, additionalOptions, success, error) {
            return __awaiter$1(this, void 0, void 0, function () {
                var getInvokePromise;
                var _this = this;
                return __generator$1(this, function (_a) {
                    getInvokePromise = function () { return __awaiter$1(_this, void 0, void 0, function () {
                        var methodDefinition, serversMethodMap, err_1, errorObj, timeout, additionalOptionsCopy, invokePromises, invocationMessages, results, allRejected;
                        var _this = this;
                        return __generator$1(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (typeof methodFilter === "string") {
                                        methodDefinition = { name: methodFilter };
                                    }
                                    else {
                                        methodDefinition = __assign$1({}, methodFilter);
                                    }
                                    if (!methodDefinition.name) {
                                        return [2, Promise.reject("Method definition is required. Please, provide either a unique string for a method name or a \u201CmethodDefinition\u201D object with a required \u201Cname\u201D property.")];
                                    }
                                    if (!argumentObj) {
                                        argumentObj = {};
                                    }
                                    if (!target) {
                                        target = "best";
                                    }
                                    if (typeof target === "string" && target !== "all" && target !== "best" && target !== "skipMine") {
                                        return [2, Promise.reject(new Error("\"" + target + "\" is not a valid target. Valid targets are \"all\" and \"best\"."))];
                                    }
                                    if (!additionalOptions) {
                                        additionalOptions = {};
                                    }
                                    if (additionalOptions.methodResponseTimeoutMs === undefined) {
                                        additionalOptions.methodResponseTimeoutMs = additionalOptions.method_response_timeout;
                                        if (additionalOptions.methodResponseTimeoutMs === undefined) {
                                            additionalOptions.methodResponseTimeoutMs = this.configuration.methodResponseTimeout;
                                        }
                                    }
                                    if (additionalOptions.waitTimeoutMs === undefined) {
                                        additionalOptions.waitTimeoutMs = additionalOptions.wait_for_method_timeout;
                                        if (additionalOptions.waitTimeoutMs === undefined) {
                                            additionalOptions.waitTimeoutMs = this.configuration.waitTimeoutMs;
                                        }
                                    }
                                    if (additionalOptions.waitTimeoutMs !== undefined && typeof additionalOptions.waitTimeoutMs !== "number") {
                                        return [2, Promise.reject(new Error("\"" + additionalOptions.waitTimeoutMs + "\" is not a valid number for \"waitTimeoutMs\" "))];
                                    }
                                    if (typeof argumentObj !== "object") {
                                        return [2, Promise.reject(new Error("The method arguments must be an object. method: " + methodDefinition.name))];
                                    }
                                    serversMethodMap = this.getServerMethodsByFilterAndTarget(methodDefinition, target);
                                    if (!(serversMethodMap.length === 0)) return [3, 4];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4, this.tryToAwaitForMethods(methodDefinition, target, additionalOptions)];
                                case 2:
                                    serversMethodMap = _a.sent();
                                    return [3, 4];
                                case 3:
                                    err_1 = _a.sent();
                                    errorObj = {
                                        method: methodDefinition,
                                        called_with: argumentObj,
                                        message: "Can not find a method matching " + JSON.stringify(methodFilter) + " with server filter " + JSON.stringify(target) + ". Is the object a valid instance ?",
                                        executed_by: undefined,
                                        returned: undefined,
                                        status: undefined,
                                    };
                                    return [2, Promise.reject(errorObj)];
                                case 4:
                                    timeout = additionalOptions.methodResponseTimeoutMs;
                                    additionalOptionsCopy = additionalOptions;
                                    invokePromises = serversMethodMap.map(function (serversMethodPair) {
                                        var invId = shortid$1();
                                        return Promise.race([
                                            _this.protocol.client.invoke(invId, serversMethodPair.methods[0], argumentObj, serversMethodPair.server, additionalOptionsCopy),
                                            rejectAfter(timeout, {
                                                invocationId: invId,
                                                message: "Invocation timeout (" + timeout + " ms) reached",
                                                status: InvokeStatus.Error,
                                            })
                                        ]);
                                    });
                                    return [4, Promise.all(invokePromises)];
                                case 5:
                                    invocationMessages = _a.sent();
                                    results = this.getInvocationResultObj(invocationMessages, methodDefinition, argumentObj);
                                    allRejected = invocationMessages.every(function (result) { return result.status === InvokeStatus.Error; });
                                    if (allRejected) {
                                        return [2, Promise.reject(results)];
                                    }
                                    return [2, results];
                            }
                        });
                    }); };
                    return [2, promisify(getInvokePromise(), success, error)];
                });
            });
        };
        Client.prototype.getInvocationResultObj = function (invocationResults, method, calledWith) {
            var all_return_values = invocationResults
                .filter(function (invokeMessage) { return invokeMessage.status === InvokeStatus.Success; })
                .reduce(function (allValues, currentValue) {
                allValues = __spreadArrays(allValues, [
                    {
                        executed_by: currentValue.instance,
                        returned: currentValue.result,
                        called_with: calledWith,
                        method: method,
                        message: currentValue.message,
                        status: currentValue.status,
                    }
                ]);
                return allValues;
            }, []);
            var all_errors = invocationResults
                .filter(function (invokeMessage) { return invokeMessage.status === InvokeStatus.Error; })
                .reduce(function (allErrors, currError) {
                allErrors = __spreadArrays(allErrors, [
                    {
                        executed_by: currError.instance,
                        called_with: calledWith,
                        name: method.name,
                        message: currError.message,
                    }
                ]);
                return allErrors;
            }, []);
            var invResult = invocationResults[0];
            var result = {
                method: method,
                called_with: calledWith,
                returned: invResult.result,
                executed_by: invResult.instance,
                all_return_values: all_return_values,
                all_errors: all_errors,
                message: invResult.message,
                status: invResult.status
            };
            return result;
        };
        Client.prototype.tryToAwaitForMethods = function (methodDefinition, target, additionalOptions) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (additionalOptions.waitTimeoutMs === 0) {
                    reject();
                    return;
                }
                var delayStep = 500;
                var delayTillNow = 0;
                var retry = function () {
                    delayTillNow += delayStep;
                    var serversMethodMap = _this.getServerMethodsByFilterAndTarget(methodDefinition, target);
                    if (serversMethodMap.length > 0) {
                        clearInterval(interval);
                        resolve(serversMethodMap);
                    }
                    else if (delayTillNow >= (additionalOptions.waitTimeoutMs || 10000)) {
                        clearInterval(interval);
                        reject();
                        return;
                    }
                };
                var interval = setInterval(retry, delayStep);
            });
        };
        Client.prototype.filterByTarget = function (target, serverMethodMap) {
            var _this = this;
            if (typeof target === "string") {
                if (target === "all") {
                    return __spreadArrays(serverMethodMap);
                }
                else if (target === "best") {
                    var localMachine = serverMethodMap
                        .find(function (s) { return s.server.instance.isLocal; });
                    if (localMachine) {
                        return [localMachine];
                    }
                    if (serverMethodMap[0] !== undefined) {
                        return [serverMethodMap[0]];
                    }
                }
                else if (target === "skipMine") {
                    return serverMethodMap.filter(function (_a) {
                        var server = _a.server;
                        return server.instance.peerId !== _this.instance.peerId;
                    });
                }
            }
            else {
                var targetArray = void 0;
                if (!Array.isArray(target)) {
                    targetArray = [target];
                }
                else {
                    targetArray = target;
                }
                var allServersMatching = targetArray.reduce(function (matches, filter) {
                    var myMatches = serverMethodMap.filter(function (serverMethodPair) {
                        return _this.instanceMatch(filter, serverMethodPair.server.instance);
                    });
                    return matches.concat(myMatches);
                }, []);
                return allServersMatching;
            }
            return [];
        };
        Client.prototype.instanceMatch = function (instanceFilter, instanceDefinition) {
            return this.containsProps(instanceFilter, instanceDefinition);
        };
        Client.prototype.methodMatch = function (methodFilter, methodDefinition) {
            return this.containsProps(methodFilter, methodDefinition);
        };
        Client.prototype.containsProps = function (filter, repoMethod) {
            var filterProps = Object.keys(filter)
                .filter(function (prop) {
                return filter[prop] !== undefined
                    && typeof filter[prop] !== "function"
                    && prop !== "object_types"
                    && prop !== "display_name"
                    && prop !== "id"
                    && prop !== "gatewayId"
                    && prop !== "identifier"
                    && prop[0] !== "_";
            });
            return filterProps.reduce(function (isMatch, prop) {
                var filterValue = filter[prop];
                var repoMethodValue = repoMethod[prop];
                if (prop === "objectTypes") {
                    var containsAllFromFilter = function (filterObjTypes, repoObjectTypes) {
                        var objTypeToContains = filterObjTypes.reduce(function (object, objType) {
                            object[objType] = false;
                            return object;
                        }, {});
                        repoObjectTypes.forEach(function (repoObjType) {
                            if (objTypeToContains[repoObjType] !== undefined) {
                                objTypeToContains[repoObjType] = true;
                            }
                        });
                        var filterIsFullfilled = function () { return Object.keys(objTypeToContains).reduce(function (isFullfiled, objType) {
                            if (!objTypeToContains[objType]) {
                                isFullfiled = false;
                            }
                            return isFullfiled;
                        }, true); };
                        return filterIsFullfilled();
                    };
                    if (filterValue.length > repoMethodValue.length
                        || containsAllFromFilter(filterValue, repoMethodValue) === false) {
                        isMatch = false;
                    }
                }
                else if (String(filterValue).toLowerCase() !== String(repoMethodValue).toLowerCase()) {
                    isMatch = false;
                }
                return isMatch;
            }, true);
        };
        Client.prototype.getMethods = function (methodFilter) {
            var _this = this;
            if (methodFilter === undefined) {
                return this.repo.getMethods();
            }
            if (typeof methodFilter === "string") {
                methodFilter = { name: methodFilter };
            }
            var methods = this.repo.getMethods().filter(function (method) {
                return _this.methodMatch(methodFilter, method);
            });
            return methods;
        };
        Client.prototype.getMethodsForInstance = function (instanceFilter) {
            var _this = this;
            var allServers = this.repo.getServers();
            var matchingServers = allServers.filter(function (server) {
                return _this.instanceMatch(instanceFilter, server.instance);
            });
            if (matchingServers.length === 0) {
                return [];
            }
            var resultMethodsObject = {};
            if (matchingServers.length === 1) {
                resultMethodsObject = matchingServers[0].methods;
            }
            else {
                matchingServers.forEach(function (server) {
                    Object.keys(server.methods).forEach(function (methodKey) {
                        var method = server.methods[methodKey];
                        resultMethodsObject[method.identifier] = method;
                    });
                });
            }
            return Object.keys(resultMethodsObject)
                .map(function (key) {
                return resultMethodsObject[key];
            });
        };
        Client.prototype.getServers = function (methodFilter) {
            var _this = this;
            var servers = this.repo.getServers();
            if (methodFilter === undefined) {
                return servers.map(function (server) {
                    return { server: server, methods: [] };
                });
            }
            return servers.reduce(function (prev, current) {
                var methodsForServer = _this.repo.getServerMethodsById(current.id);
                var matchingMethods = methodsForServer.filter(function (method) {
                    return _this.methodMatch(methodFilter, method);
                });
                if (matchingMethods.length > 0) {
                    prev.push({ server: current, methods: matchingMethods });
                }
                return prev;
            }, []);
        };
        Client.prototype.getServerMethodsByFilterAndTarget = function (methodFilter, target) {
            var serversMethodMap = this.getServers(methodFilter);
            return this.filterByTarget(target, serversMethodMap);
        };
        return Client;
    }());

    var ServerSubscription = (function () {
        function ServerSubscription(protocol, repoMethod, subscription) {
            this.protocol = protocol;
            this.repoMethod = repoMethod;
            this.subscription = subscription;
        }
        Object.defineProperty(ServerSubscription.prototype, "stream", {
            get: function () {
                if (!this.repoMethod.stream) {
                    throw new Error("no stream");
                }
                return this.repoMethod.stream;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ServerSubscription.prototype, "arguments", {
            get: function () { return this.subscription.arguments || {}; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ServerSubscription.prototype, "branchKey", {
            get: function () { return this.subscription.branchKey; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ServerSubscription.prototype, "instance", {
            get: function () {
                if (!this.subscription.instance) {
                    throw new Error("no instance");
                }
                return this.subscription.instance;
            },
            enumerable: true,
            configurable: true
        });
        ServerSubscription.prototype.close = function () {
            this.protocol.server.closeSingleSubscription(this.repoMethod, this.subscription);
        };
        ServerSubscription.prototype.push = function (data) {
            this.protocol.server.pushDataToSingle(this.repoMethod, this.subscription, data);
        };
        return ServerSubscription;
    }());

    var Request = (function () {
        function Request(protocol, repoMethod, requestContext) {
            this.protocol = protocol;
            this.repoMethod = repoMethod;
            this.requestContext = requestContext;
            this.arguments = requestContext.arguments;
            this.instance = requestContext.instance;
        }
        Request.prototype.accept = function () {
            this.protocol.server.acceptRequestOnBranch(this.requestContext, this.repoMethod, "");
        };
        Request.prototype.acceptOnBranch = function (branch) {
            this.protocol.server.acceptRequestOnBranch(this.requestContext, this.repoMethod, branch);
        };
        Request.prototype.reject = function (reason) {
            this.protocol.server.rejectRequest(this.requestContext, this.repoMethod, reason);
        };
        return Request;
    }());

    var ServerStreaming = (function () {
        function ServerStreaming(protocol, server) {
            var _this = this;
            this.protocol = protocol;
            this.server = server;
            protocol.server.onSubRequest(function (rc, rm) { return _this.handleSubRequest(rc, rm); });
            protocol.server.onSubAdded(function (sub, rm) { return _this.handleSubAdded(sub, rm); });
            protocol.server.onSubRemoved(function (sub, rm) { return _this.handleSubRemoved(sub, rm); });
        }
        ServerStreaming.prototype.handleSubRequest = function (requestContext, repoMethod) {
            if (!(repoMethod &&
                repoMethod.streamCallbacks &&
                typeof repoMethod.streamCallbacks.subscriptionRequestHandler === "function")) {
                return;
            }
            var request = new Request(this.protocol, repoMethod, requestContext);
            repoMethod.streamCallbacks.subscriptionRequestHandler(request);
        };
        ServerStreaming.prototype.handleSubAdded = function (subscription, repoMethod) {
            if (!(repoMethod &&
                repoMethod.streamCallbacks &&
                typeof repoMethod.streamCallbacks.subscriptionAddedHandler === "function")) {
                return;
            }
            var sub = new ServerSubscription(this.protocol, repoMethod, subscription);
            repoMethod.streamCallbacks.subscriptionAddedHandler(sub);
        };
        ServerStreaming.prototype.handleSubRemoved = function (subscription, repoMethod) {
            if (!(repoMethod &&
                repoMethod.streamCallbacks &&
                typeof repoMethod.streamCallbacks.subscriptionRemovedHandler === "function")) {
                return;
            }
            var sub = new ServerSubscription(this.protocol, repoMethod, subscription);
            repoMethod.streamCallbacks.subscriptionRemovedHandler(sub);
        };
        return ServerStreaming;
    }());

    var ServerBranch = (function () {
        function ServerBranch(key, protocol, repoMethod) {
            this.key = key;
            this.protocol = protocol;
            this.repoMethod = repoMethod;
        }
        ServerBranch.prototype.subscriptions = function () {
            var _this = this;
            var subList = this.protocol.server.getSubscriptionList(this.repoMethod, this.key);
            return subList.map(function (sub) {
                return new ServerSubscription(_this.protocol, _this.repoMethod, sub);
            });
        };
        ServerBranch.prototype.close = function () {
            this.protocol.server.closeAllSubscriptions(this.repoMethod, this.key);
        };
        ServerBranch.prototype.push = function (data) {
            this.protocol.server.pushData(this.repoMethod, data, [this.key]);
        };
        return ServerBranch;
    }());

    var ServerStream = (function () {
        function ServerStream(_protocol, _repoMethod, _server) {
            this._protocol = _protocol;
            this._repoMethod = _repoMethod;
            this._server = _server;
            this.name = this._repoMethod.definition.name;
        }
        ServerStream.prototype.branches = function (key) {
            var _this = this;
            var bList = this._protocol.server.getBranchList(this._repoMethod);
            if (key) {
                if (bList.indexOf(key) > -1) {
                    return new ServerBranch(key, this._protocol, this._repoMethod);
                }
                return undefined;
            }
            else {
                return bList.map(function (branchKey) {
                    return new ServerBranch(branchKey, _this._protocol, _this._repoMethod);
                });
            }
        };
        ServerStream.prototype.branch = function (key) {
            return this.branches(key);
        };
        ServerStream.prototype.subscriptions = function () {
            var _this = this;
            var subList = this._protocol.server.getSubscriptionList(this._repoMethod);
            return subList.map(function (sub) {
                return new ServerSubscription(_this._protocol, _this._repoMethod, sub);
            });
        };
        Object.defineProperty(ServerStream.prototype, "definition", {
            get: function () {
                var def2 = this._repoMethod.definition;
                return {
                    accepts: def2.accepts,
                    description: def2.description,
                    displayName: def2.displayName,
                    name: def2.name,
                    objectTypes: def2.objectTypes,
                    returns: def2.returns,
                    supportsStreaming: def2.supportsStreaming,
                };
            },
            enumerable: true,
            configurable: true
        });
        ServerStream.prototype.close = function () {
            this._protocol.server.closeAllSubscriptions(this._repoMethod);
            this._server.unregister(this._repoMethod.definition, true);
        };
        ServerStream.prototype.push = function (data, branches) {
            if (typeof branches !== "string" && !Array.isArray(branches) && branches !== undefined) {
                throw new Error("invalid branches should be string or string array");
            }
            if (typeof data !== "object") {
                throw new Error("Invalid arguments. Data must be an object.");
            }
            this._protocol.server.pushData(this._repoMethod, data, branches);
        };
        ServerStream.prototype.updateRepoMethod = function (repoMethod) {
            this._repoMethod = repoMethod;
        };
        return ServerStream;
    }());

    var Server = (function () {
        function Server(protocol, serverRepository) {
            this.protocol = protocol;
            this.serverRepository = serverRepository;
            this.invocations = 0;
            this.currentlyUnregistering = {};
            this.streaming = new ServerStreaming(protocol, this);
            this.protocol.server.onInvoked(this.onMethodInvoked.bind(this));
        }
        Server.prototype.createStream = function (streamDef, callbacks, successCallback, errorCallback, existingStream) {
            var _this = this;
            var promise = new Promise(function (resolve, reject) {
                if (!streamDef) {
                    reject("The stream name must be unique! Please, provide either a unique string for a stream name to \u201Cglue.interop.createStream()\u201D or a \u201CmethodDefinition\u201D object with a unique \u201Cname\u201D property for the stream.");
                    return;
                }
                var streamMethodDefinition;
                if (typeof streamDef === "string") {
                    streamMethodDefinition = { name: "" + streamDef };
                }
                else {
                    streamMethodDefinition = __assign$1({}, streamDef);
                }
                if (!streamMethodDefinition.name) {
                    return reject("The \u201Cname\u201D property is required for the \u201CstreamDefinition\u201D object and must be unique. Stream definition: " + JSON.stringify(streamMethodDefinition));
                }
                var nameAlreadyExists = _this.serverRepository.getList()
                    .some(function (serverMethod) { return serverMethod.definition.name === streamMethodDefinition.name; });
                if (nameAlreadyExists) {
                    return reject("A stream with the name \"" + streamMethodDefinition.name + "\" already exists! Please, provide a unique name for the stream.");
                }
                streamMethodDefinition.supportsStreaming = true;
                if (!callbacks) {
                    callbacks = {};
                }
                if (typeof callbacks.subscriptionRequestHandler !== "function") {
                    callbacks.subscriptionRequestHandler = function (request) {
                        request.accept();
                    };
                }
                var repoMethod = _this.serverRepository.add({
                    definition: streamMethodDefinition,
                    streamCallbacks: callbacks,
                    protocolState: {},
                });
                _this.protocol.server.createStream(repoMethod)
                    .then(function () {
                    var streamUserObject;
                    if (existingStream) {
                        streamUserObject = existingStream;
                        existingStream.updateRepoMethod(repoMethod);
                    }
                    else {
                        streamUserObject = new ServerStream(_this.protocol, repoMethod, _this);
                    }
                    repoMethod.stream = streamUserObject;
                    resolve(streamUserObject);
                })
                    .catch(function (err) {
                    if (repoMethod.repoId) {
                        _this.serverRepository.remove(repoMethod.repoId);
                    }
                    reject(err);
                });
            });
            return promisify(promise, successCallback, errorCallback);
        };
        Server.prototype.register = function (methodDefinition, callback) {
            var _this = this;
            if (!methodDefinition) {
                return Promise.reject("Method definition is required. Please, provide either a unique string for a method name or a \u201CmethodDefinition\u201D object with a required \u201Cname\u201D property.");
            }
            if (typeof callback !== "function") {
                return Promise.reject("The second parameter must be a callback function. Method: " + (typeof methodDefinition === "string" ? methodDefinition : methodDefinition.name));
            }
            var wrappedCallbackFunction = function (context, resultCallback) { return __awaiter$1(_this, void 0, void 0, function () {
                var result, resultValue, e_1;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            result = callback(context.args, context.instance);
                            if (!(result && typeof result.then === "function")) return [3, 2];
                            return [4, result];
                        case 1:
                            resultValue = _a.sent();
                            resultCallback(undefined, resultValue);
                            return [3, 3];
                        case 2:
                            resultCallback(undefined, result);
                            _a.label = 3;
                        case 3: return [3, 5];
                        case 4:
                            e_1 = _a.sent();
                            if (!e_1) {
                                e_1 = "";
                            }
                            resultCallback(e_1, e_1);
                            return [3, 5];
                        case 5: return [2];
                    }
                });
            }); };
            wrappedCallbackFunction.userCallback = callback;
            return this.registerCore(methodDefinition, wrappedCallbackFunction);
        };
        Server.prototype.registerAsync = function (methodDefinition, callback) {
            if (!methodDefinition) {
                return Promise.reject("Method definition is required. Please, provide either a unique string for a method name or a \u201CmethodDefinition\u201D object with a required \u201Cname\u201D property.");
            }
            if (typeof callback !== "function") {
                return Promise.reject("The second parameter must be a callback function. Method: " + (typeof methodDefinition === "string" ? methodDefinition : methodDefinition.name));
            }
            var wrappedCallback = function (context, resultCallback) {
                try {
                    var resultCalled_1 = false;
                    var success = function (result) {
                        if (!resultCalled_1) {
                            resultCallback(undefined, result);
                        }
                        resultCalled_1 = true;
                    };
                    var error = function (e) {
                        if (!resultCalled_1) {
                            if (!e) {
                                e = "";
                            }
                            resultCallback(e, e);
                        }
                        resultCalled_1 = true;
                    };
                    var methodResult = callback(context.args, context.instance, success, error);
                    if (methodResult && typeof methodResult.then === "function") {
                        methodResult
                            .then(success)
                            .catch(error);
                    }
                }
                catch (e) {
                    resultCallback(e, undefined);
                }
            };
            wrappedCallback.userCallbackAsync = callback;
            return this.registerCore(methodDefinition, wrappedCallback);
        };
        Server.prototype.unregister = function (methodFilter, forStream) {
            if (forStream === void 0) { forStream = false; }
            return __awaiter$1(this, void 0, void 0, function () {
                var methodDefinition, methodToBeRemoved;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (methodFilter === undefined) {
                                return [2, Promise.reject("Please, provide either a unique string for a name or an object containing a \u201Cname\u201D property.")];
                            }
                            if (!(typeof methodFilter === "function")) return [3, 2];
                            return [4, this.unregisterWithPredicate(methodFilter, forStream)];
                        case 1:
                            _a.sent();
                            return [2];
                        case 2:
                            if (typeof methodFilter === "string") {
                                methodDefinition = { name: methodFilter };
                            }
                            else {
                                methodDefinition = methodFilter;
                            }
                            if (methodDefinition.name === undefined) {
                                return [2, Promise.reject("Method name is required. Cannot find a method if the method name is undefined!")];
                            }
                            methodToBeRemoved = this.serverRepository.getList().find(function (serverMethod) {
                                return serverMethod.definition.name === methodDefinition.name
                                    && (serverMethod.definition.supportsStreaming || false) === forStream;
                            });
                            if (!methodToBeRemoved) {
                                return [2, Promise.reject("Method with a name \"" + methodDefinition.name + "\" does not exist or is not registered by your application!")];
                            }
                            return [4, this.removeMethodsOrStreams([methodToBeRemoved])];
                        case 3:
                            _a.sent();
                            return [2];
                    }
                });
            });
        };
        Server.prototype.unregisterWithPredicate = function (filterPredicate, forStream) {
            return __awaiter$1(this, void 0, void 0, function () {
                var methodsOrStreamsToRemove;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            methodsOrStreamsToRemove = this.serverRepository.getList()
                                .filter(function (sm) { return filterPredicate(sm.definition); })
                                .filter(function (serverMethod) {
                                return (serverMethod.definition.supportsStreaming || false) === forStream;
                            });
                            if (!methodsOrStreamsToRemove || methodsOrStreamsToRemove.length === 0) {
                                return [2, Promise.reject("Could not find a " + (forStream ? "stream" : "method") + " matching the specified condition!")];
                            }
                            return [4, this.removeMethodsOrStreams(methodsOrStreamsToRemove)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            });
        };
        Server.prototype.removeMethodsOrStreams = function (methodsToRemove) {
            var _this = this;
            var methodUnregPromises = [];
            methodsToRemove.forEach(function (method) {
                var promise = _this.protocol.server.unregister(method)
                    .then(function () {
                    if (method.repoId) {
                        _this.serverRepository.remove(method.repoId);
                    }
                });
                methodUnregPromises.push(promise);
                _this.addAsCurrentlyUnregistering(method.definition.name, promise);
            });
            return Promise.all(methodUnregPromises);
        };
        Server.prototype.addAsCurrentlyUnregistering = function (methodName, promise) {
            return __awaiter$1(this, void 0, void 0, function () {
                var timeout;
                var _this = this;
                return __generator$1(this, function (_a) {
                    timeout = new Promise(function (resolve) { return setTimeout(resolve, 5000); });
                    this.currentlyUnregistering[methodName] = Promise.race([promise, timeout]).then(function () {
                        delete _this.currentlyUnregistering[methodName];
                    });
                    return [2];
                });
            });
        };
        Server.prototype.registerCore = function (method, theFunction) {
            return __awaiter$1(this, void 0, void 0, function () {
                var methodDefinition, unregisterInProgress, nameAlreadyExists, repoMethod;
                var _this = this;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (typeof method === "string") {
                                methodDefinition = { name: "" + method };
                            }
                            else {
                                methodDefinition = __assign$1({}, method);
                            }
                            if (!methodDefinition.name) {
                                return [2, Promise.reject("Please, provide a (unique) string value for the \u201Cname\u201D property in the \u201CmethodDefinition\u201D object: " + JSON.stringify(method))];
                            }
                            unregisterInProgress = this.currentlyUnregistering[methodDefinition.name];
                            if (!unregisterInProgress) return [3, 2];
                            return [4, unregisterInProgress];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            nameAlreadyExists = this.serverRepository.getList()
                                .some(function (serverMethod) { return serverMethod.definition.name === methodDefinition.name; });
                            if (nameAlreadyExists) {
                                return [2, Promise.reject("A method with the name \"" + methodDefinition.name + "\" already exists! Please, provide a unique name for the method.")];
                            }
                            if (methodDefinition.supportsStreaming) {
                                return [2, Promise.reject("When you create methods with \u201Cglue.interop.register()\u201D or \u201Cglue.interop.registerAsync()\u201D the property \u201CsupportsStreaming\u201D cannot be \u201Ctrue\u201D. If you want \u201C" + methodDefinition.name + "\u201D to be a stream, please use the \u201Cglue.interop.createStream()\u201D method.")];
                            }
                            repoMethod = this.serverRepository.add({
                                definition: methodDefinition,
                                theFunction: theFunction,
                                protocolState: {},
                            });
                            return [2, this.protocol.server.register(repoMethod)
                                    .catch(function (err) {
                                    if (repoMethod === null || repoMethod === void 0 ? void 0 : repoMethod.repoId) {
                                        _this.serverRepository.remove(repoMethod.repoId);
                                    }
                                    throw err;
                                })];
                    }
                });
            });
        };
        Server.prototype.onMethodInvoked = function (methodToExecute, invocationId, invocationArgs) {
            var _this = this;
            if (!methodToExecute || !methodToExecute.theFunction) {
                return;
            }
            methodToExecute.theFunction(invocationArgs, function (err, result) {
                if (err !== undefined && err !== null) {
                    if (err.message && typeof err.message === "string") {
                        err = err.message;
                    }
                    else if (typeof err !== "string") {
                        try {
                            err = JSON.stringify(err);
                        }
                        catch (unStrException) {
                            err = "un-stringifyable error in onMethodInvoked! Top level prop names: " + Object.keys(err);
                        }
                    }
                }
                if (!result) {
                    result = {};
                }
                else if (typeof result !== "object" || Array.isArray(result)) {
                    result = { _value: result };
                }
                _this.protocol.server.methodInvocationResult(methodToExecute, invocationId, err, result);
            });
        };
        return Server;
    }());

    var InstanceWrapper = (function () {
        function InstanceWrapper(instance, connection) {
            var _this = this;
            this.wrapped = {
                getMethods: getMethods,
                getStreams: getStreams,
            };
            if (instance) {
                this.refreshWrappedObject(instance);
            }
            if (connection) {
                connection.loggedIn(function () {
                    _this.refresh(connection);
                });
                this.refresh(connection);
            }
        }
        InstanceWrapper.prototype.unwrap = function () {
            return this.wrapped;
        };
        InstanceWrapper.prototype.refresh = function (connection) {
            if (!connection) {
                return;
            }
            var resolvedIdentity = connection === null || connection === void 0 ? void 0 : connection.resolvedIdentity;
            var instance = Object.assign({}, resolvedIdentity !== null && resolvedIdentity !== void 0 ? resolvedIdentity : {}, { peerId: connection === null || connection === void 0 ? void 0 : connection.peerId });
            this.refreshWrappedObject(instance);
        };
        InstanceWrapper.prototype.refreshWrappedObject = function (resolvedIdentity) {
            var _a, _b, _c;
            this.wrapped.user = resolvedIdentity.user;
            this.wrapped.instance = resolvedIdentity.instance;
            this.wrapped.application = (_a = resolvedIdentity.application) !== null && _a !== void 0 ? _a : shortid$1();
            this.wrapped.applicationName = resolvedIdentity.applicationName;
            this.wrapped.pid = (_c = (_b = resolvedIdentity.pid) !== null && _b !== void 0 ? _b : resolvedIdentity.process) !== null && _c !== void 0 ? _c : Math.floor(Math.random() * 10000000000);
            this.wrapped.machine = resolvedIdentity.machine;
            this.wrapped.environment = resolvedIdentity.environment;
            this.wrapped.region = resolvedIdentity.region;
            this.wrapped.windowId = resolvedIdentity.windowId;
            this.wrapped.isLocal = true;
            this.wrapped.api = resolvedIdentity.api;
            this.wrapped.service = resolvedIdentity.service;
            this.wrapped.peerId = resolvedIdentity.peerId;
        };
        return InstanceWrapper;
    }());
    function getMethods() {
        var _a;
        return (_a = InstanceWrapper.API) === null || _a === void 0 ? void 0 : _a.methodsForInstance(this);
    }
    function getStreams() {
        var _a;
        return (_a = InstanceWrapper.API) === null || _a === void 0 ? void 0 : _a.methodsForInstance(this).filter(function (m) { return m.supportsStreaming; });
    }

    var ClientRepository = (function () {
        function ClientRepository(logger) {
            this.logger = logger;
            this.servers = {};
            this.methodsCount = {};
            this.callbacks = lib$2();
        }
        ClientRepository.prototype.addServer = function (info, serverId) {
            this.logger.debug("adding server " + serverId);
            var current = this.servers[serverId];
            if (current) {
                return current.id;
            }
            var wrapper = new InstanceWrapper(info);
            var serverEntry = {
                id: serverId,
                methods: {},
                instance: wrapper.unwrap(),
                wrapper: wrapper,
            };
            this.servers[serverId] = serverEntry;
            this.callbacks.execute("onServerAdded", serverEntry.instance);
            return serverId;
        };
        ClientRepository.prototype.removeServerById = function (id, reason) {
            var _this = this;
            var server = this.servers[id];
            if (!server) {
                this.logger.warn("not aware of server " + id + ", my state " + JSON.stringify(Object.keys(this.servers)));
                return;
            }
            else {
                this.logger.debug("removing server " + id);
            }
            Object.keys(server.methods).forEach(function (methodId) {
                _this.removeServerMethod(id, methodId);
            });
            delete this.servers[id];
            this.callbacks.execute("onServerRemoved", server.instance, reason);
        };
        ClientRepository.prototype.addServerMethod = function (serverId, method) {
            var server = this.servers[serverId];
            if (!server) {
                throw new Error("server does not exists");
            }
            if (server.methods[method.id]) {
                return;
            }
            var identifier = this.createMethodIdentifier(method);
            var methodDefinition = {
                identifier: identifier,
                gatewayId: method.id,
                name: method.name,
                displayName: method.display_name,
                description: method.description,
                version: method.version,
                objectTypes: method.object_types || [],
                accepts: method.input_signature,
                returns: method.result_signature,
                supportsStreaming: typeof method.flags !== "undefined" ? method.flags.streaming : false,
            };
            methodDefinition.object_types = methodDefinition.objectTypes;
            methodDefinition.display_name = methodDefinition.displayName;
            methodDefinition.version = methodDefinition.version;
            var that = this;
            methodDefinition.getServers = function () {
                return that.getServersByMethod(method.id);
            };
            server.methods[method.id] = methodDefinition;
            if (!this.methodsCount[identifier]) {
                this.methodsCount[identifier] = 0;
                this.callbacks.execute("onMethodAdded", methodDefinition);
            }
            this.methodsCount[identifier] = this.methodsCount[identifier] + 1;
            this.callbacks.execute("onServerMethodAdded", server.instance, methodDefinition);
            return methodDefinition;
        };
        ClientRepository.prototype.removeServerMethod = function (serverId, methodId) {
            var server = this.servers[serverId];
            if (!server) {
                throw new Error("server does not exists");
            }
            var method = server.methods[methodId];
            delete server.methods[methodId];
            this.methodsCount[method.identifier] = this.methodsCount[method.identifier] - 1;
            if (this.methodsCount[method.identifier] === 0) {
                this.callbacks.execute("onMethodRemoved", method);
            }
            this.callbacks.execute("onServerMethodRemoved", server.instance, method);
        };
        ClientRepository.prototype.getMethods = function () {
            var _this = this;
            var allMethods = {};
            Object.keys(this.servers).forEach(function (serverId) {
                var server = _this.servers[serverId];
                Object.keys(server.methods).forEach(function (methodId) {
                    var method = server.methods[methodId];
                    allMethods[method.identifier] = method;
                });
            });
            var methodsAsArray = Object.keys(allMethods).map(function (id) {
                return allMethods[id];
            });
            return methodsAsArray;
        };
        ClientRepository.prototype.getServers = function () {
            var _this = this;
            var allServers = [];
            Object.keys(this.servers).forEach(function (serverId) {
                var server = _this.servers[serverId];
                allServers.push(server);
            });
            return allServers;
        };
        ClientRepository.prototype.getServerMethodsById = function (serverId) {
            var server = this.servers[serverId];
            return Object.keys(server.methods).map(function (id) {
                return server.methods[id];
            });
        };
        ClientRepository.prototype.onServerAdded = function (callback) {
            var unsubscribeFunc = this.callbacks.add("onServerAdded", callback);
            var serversWithMethodsToReplay = this.getServers().map(function (s) { return s.instance; });
            return this.returnUnsubWithDelayedReplay(unsubscribeFunc, serversWithMethodsToReplay, callback);
        };
        ClientRepository.prototype.onMethodAdded = function (callback) {
            var unsubscribeFunc = this.callbacks.add("onMethodAdded", callback);
            var methodsToReplay = this.getMethods();
            return this.returnUnsubWithDelayedReplay(unsubscribeFunc, methodsToReplay, callback);
        };
        ClientRepository.prototype.onServerMethodAdded = function (callback) {
            var unsubscribeFunc = this.callbacks.add("onServerMethodAdded", callback);
            var unsubCalled = false;
            var servers = this.getServers();
            setTimeout(function () {
                servers.forEach(function (server) {
                    var methods = server.methods;
                    Object.keys(methods).forEach(function (methodId) {
                        if (!unsubCalled) {
                            callback(server.instance, methods[methodId]);
                        }
                    });
                });
            }, 0);
            return function () {
                unsubCalled = true;
                unsubscribeFunc();
            };
        };
        ClientRepository.prototype.onMethodRemoved = function (callback) {
            var unsubscribeFunc = this.callbacks.add("onMethodRemoved", callback);
            return unsubscribeFunc;
        };
        ClientRepository.prototype.onServerRemoved = function (callback) {
            var unsubscribeFunc = this.callbacks.add("onServerRemoved", callback);
            return unsubscribeFunc;
        };
        ClientRepository.prototype.onServerMethodRemoved = function (callback) {
            var unsubscribeFunc = this.callbacks.add("onServerMethodRemoved", callback);
            return unsubscribeFunc;
        };
        ClientRepository.prototype.getServerById = function (id) {
            return this.servers[id];
        };
        ClientRepository.prototype.reset = function () {
            var _this = this;
            Object.keys(this.servers).forEach(function (key) {
                _this.removeServerById(key, "reset");
            });
            this.servers = {};
            this.methodsCount = {};
        };
        ClientRepository.prototype.createMethodIdentifier = function (methodInfo) {
            var accepts = methodInfo.input_signature !== undefined ? methodInfo.input_signature : "";
            var returns = methodInfo.result_signature !== undefined ? methodInfo.result_signature : "";
            return (methodInfo.name + accepts + returns).toLowerCase();
        };
        ClientRepository.prototype.getServersByMethod = function (id) {
            var _this = this;
            var allServers = [];
            Object.keys(this.servers).forEach(function (serverId) {
                var server = _this.servers[serverId];
                Object.keys(server.methods).forEach(function (methodId) {
                    if (methodId === id) {
                        allServers.push(server.instance);
                    }
                });
            });
            return allServers;
        };
        ClientRepository.prototype.returnUnsubWithDelayedReplay = function (unsubscribeFunc, collectionToReplay, callback) {
            var unsubCalled = false;
            setTimeout(function () {
                collectionToReplay.forEach(function (item) {
                    if (!unsubCalled) {
                        callback(item);
                    }
                });
            }, 0);
            return function () {
                unsubCalled = true;
                unsubscribeFunc();
            };
        };
        return ClientRepository;
    }());

    var ServerRepository = (function () {
        function ServerRepository() {
            this.nextId = 0;
            this.methods = [];
        }
        ServerRepository.prototype.add = function (method) {
            method.repoId = String(this.nextId);
            this.nextId += 1;
            this.methods.push(method);
            return method;
        };
        ServerRepository.prototype.remove = function (repoId) {
            if (typeof repoId !== "string") {
                return new TypeError("Expecting a string");
            }
            this.methods = this.methods.filter(function (m) {
                return m.repoId !== repoId;
            });
        };
        ServerRepository.prototype.getById = function (id) {
            if (typeof id !== "string") {
                return undefined;
            }
            return this.methods.find(function (m) {
                return m.repoId === id;
            });
        };
        ServerRepository.prototype.getList = function () {
            return this.methods.map(function (m) { return m; });
        };
        ServerRepository.prototype.length = function () {
            return this.methods.length;
        };
        ServerRepository.prototype.reset = function () {
            this.methods = [];
        };
        return ServerRepository;
    }());

    var SUBSCRIPTION_REQUEST = "onSubscriptionRequest";
    var SUBSCRIPTION_ADDED = "onSubscriptionAdded";
    var SUBSCRIPTION_REMOVED = "onSubscriptionRemoved";
    var ServerStreaming$1 = (function () {
        function ServerStreaming(session, repository, serverRepository) {
            var _this = this;
            this.session = session;
            this.repository = repository;
            this.serverRepository = serverRepository;
            this.ERR_URI_SUBSCRIPTION_FAILED = "com.tick42.agm.errors.subscription.failure";
            this.callbacks = lib$2();
            this.nextStreamId = 0;
            session.on("add-interest", function (msg) {
                _this.handleAddInterest(msg);
            });
            session.on("remove-interest", function (msg) {
                _this.handleRemoveInterest(msg);
            });
        }
        ServerStreaming.prototype.acceptRequestOnBranch = function (requestContext, streamingMethod, branch) {
            if (typeof branch !== "string") {
                branch = "";
            }
            if (typeof streamingMethod.protocolState.subscriptionsMap !== "object") {
                throw new TypeError("The streaming method is missing its subscriptions.");
            }
            if (!Array.isArray(streamingMethod.protocolState.branchKeyToStreamIdMap)) {
                throw new TypeError("The streaming method is missing its branches.");
            }
            var streamId = this.getStreamId(streamingMethod, branch);
            var key = requestContext.msg.subscription_id;
            var subscription = {
                id: key,
                arguments: requestContext.arguments,
                instance: requestContext.instance,
                branchKey: branch,
                streamId: streamId,
                subscribeMsg: requestContext.msg,
            };
            streamingMethod.protocolState.subscriptionsMap[key] = subscription;
            this.session.sendFireAndForget({
                type: "accepted",
                subscription_id: key,
                stream_id: streamId,
            });
            this.callbacks.execute(SUBSCRIPTION_ADDED, subscription, streamingMethod);
        };
        ServerStreaming.prototype.rejectRequest = function (requestContext, streamingMethod, reason) {
            if (typeof reason !== "string") {
                reason = "";
            }
            this.sendSubscriptionFailed("Subscription rejected by user. " + reason, requestContext.msg.subscription_id);
        };
        ServerStreaming.prototype.pushData = function (streamingMethod, data, branches) {
            var _this = this;
            if (typeof streamingMethod !== "object" || !Array.isArray(streamingMethod.protocolState.branchKeyToStreamIdMap)) {
                return;
            }
            if (typeof data !== "object") {
                throw new Error("Invalid arguments. Data must be an object.");
            }
            if (typeof branches === "string") {
                branches = [branches];
            }
            else if (!Array.isArray(branches) || branches.length <= 0) {
                branches = [];
            }
            var streamIdList = streamingMethod.protocolState.branchKeyToStreamIdMap
                .filter(function (br) {
                if (!branches || branches.length === 0) {
                    return true;
                }
                return branches.indexOf(br.key) >= 0;
            }).map(function (br) {
                return br.streamId;
            });
            streamIdList.forEach(function (streamId) {
                var publishMessage = {
                    type: "publish",
                    stream_id: streamId,
                    data: data,
                };
                _this.session.sendFireAndForget(publishMessage);
            });
        };
        ServerStreaming.prototype.pushDataToSingle = function (method, subscription, data) {
            if (typeof data !== "object") {
                throw new Error("Invalid arguments. Data must be an object.");
            }
            var postMessage = {
                type: "post",
                subscription_id: subscription.id,
                data: data,
            };
            this.session.sendFireAndForget(postMessage);
        };
        ServerStreaming.prototype.closeSingleSubscription = function (streamingMethod, subscription) {
            if (streamingMethod.protocolState.subscriptionsMap) {
                delete streamingMethod.protocolState.subscriptionsMap[subscription.id];
            }
            var dropSubscriptionMessage = {
                type: "drop-subscription",
                subscription_id: subscription.id,
                reason: "Server dropping a single subscription",
            };
            this.session.sendFireAndForget(dropSubscriptionMessage);
            var subscriber = subscription.instance;
            this.callbacks.execute(SUBSCRIPTION_REMOVED, subscription, streamingMethod);
        };
        ServerStreaming.prototype.closeMultipleSubscriptions = function (streamingMethod, branchKey) {
            var _this = this;
            if (typeof streamingMethod !== "object" || typeof streamingMethod.protocolState.subscriptionsMap !== "object") {
                return;
            }
            if (!streamingMethod.protocolState.subscriptionsMap) {
                return;
            }
            var subscriptionsMap = streamingMethod.protocolState.subscriptionsMap;
            var subscriptionsToClose = Object.keys(subscriptionsMap)
                .map(function (key) {
                return subscriptionsMap[key];
            });
            if (typeof branchKey === "string") {
                subscriptionsToClose = subscriptionsToClose.filter(function (sub) {
                    return sub.branchKey === branchKey;
                });
            }
            subscriptionsToClose.forEach(function (subscription) {
                delete subscriptionsMap[subscription.id];
                var drop = {
                    type: "drop-subscription",
                    subscription_id: subscription.id,
                    reason: "Server dropping all subscriptions on stream_id: " + subscription.streamId,
                };
                _this.session.sendFireAndForget(drop);
            });
        };
        ServerStreaming.prototype.getSubscriptionList = function (streamingMethod, branchKey) {
            if (typeof streamingMethod !== "object") {
                return [];
            }
            var subscriptions = [];
            if (!streamingMethod.protocolState.subscriptionsMap) {
                return [];
            }
            var subscriptionsMap = streamingMethod.protocolState.subscriptionsMap;
            var allSubscriptions = Object.keys(subscriptionsMap)
                .map(function (key) {
                return subscriptionsMap[key];
            });
            if (typeof branchKey !== "string") {
                subscriptions = allSubscriptions;
            }
            else {
                subscriptions = allSubscriptions.filter(function (sub) {
                    return sub.branchKey === branchKey;
                });
            }
            return subscriptions;
        };
        ServerStreaming.prototype.getBranchList = function (streamingMethod) {
            if (typeof streamingMethod !== "object") {
                return [];
            }
            if (!streamingMethod.protocolState.subscriptionsMap) {
                return [];
            }
            var subscriptionsMap = streamingMethod.protocolState.subscriptionsMap;
            var allSubscriptions = Object.keys(subscriptionsMap)
                .map(function (key) {
                return subscriptionsMap[key];
            });
            var result = [];
            allSubscriptions.forEach(function (sub) {
                var branch = "";
                if (typeof sub === "object" && typeof sub.branchKey === "string") {
                    branch = sub.branchKey;
                }
                if (result.indexOf(branch) === -1) {
                    result.push(branch);
                }
            });
            return result;
        };
        ServerStreaming.prototype.onSubAdded = function (callback) {
            this.onSubscriptionLifetimeEvent(SUBSCRIPTION_ADDED, callback);
        };
        ServerStreaming.prototype.onSubRequest = function (callback) {
            this.onSubscriptionLifetimeEvent(SUBSCRIPTION_REQUEST, callback);
        };
        ServerStreaming.prototype.onSubRemoved = function (callback) {
            this.onSubscriptionLifetimeEvent(SUBSCRIPTION_REMOVED, callback);
        };
        ServerStreaming.prototype.handleRemoveInterest = function (msg) {
            var streamingMethod = this.serverRepository.getById(msg.method_id);
            if (typeof msg.subscription_id !== "string" ||
                typeof streamingMethod !== "object") {
                return;
            }
            if (!streamingMethod.protocolState.subscriptionsMap) {
                return;
            }
            if (typeof streamingMethod.protocolState.subscriptionsMap[msg.subscription_id] !== "object") {
                return;
            }
            var subscription = streamingMethod.protocolState.subscriptionsMap[msg.subscription_id];
            delete streamingMethod.protocolState.subscriptionsMap[msg.subscription_id];
            this.callbacks.execute(SUBSCRIPTION_REMOVED, subscription, streamingMethod);
        };
        ServerStreaming.prototype.onSubscriptionLifetimeEvent = function (eventName, handlerFunc) {
            this.callbacks.add(eventName, handlerFunc);
        };
        ServerStreaming.prototype.getNextStreamId = function () {
            return this.nextStreamId++ + "";
        };
        ServerStreaming.prototype.handleAddInterest = function (msg) {
            var caller = this.repository.getServerById(msg.caller_id);
            var instance = caller.instance;
            var requestContext = {
                msg: msg,
                arguments: msg.arguments_kv || {},
                instance: instance,
            };
            var streamingMethod = this.serverRepository.getById(msg.method_id);
            if (streamingMethod === undefined) {
                var errorMsg = "No method with id " + msg.method_id + " on this server.";
                this.sendSubscriptionFailed(errorMsg, msg.subscription_id);
                return;
            }
            if (streamingMethod.protocolState.subscriptionsMap &&
                streamingMethod.protocolState.subscriptionsMap[msg.subscription_id]) {
                this.sendSubscriptionFailed("A subscription with id " + msg.subscription_id + " already exists.", msg.subscription_id);
                return;
            }
            this.callbacks.execute(SUBSCRIPTION_REQUEST, requestContext, streamingMethod);
        };
        ServerStreaming.prototype.sendSubscriptionFailed = function (reason, subscriptionId) {
            var errorMessage = {
                type: "error",
                reason_uri: this.ERR_URI_SUBSCRIPTION_FAILED,
                reason: reason,
                request_id: subscriptionId,
            };
            this.session.sendFireAndForget(errorMessage);
        };
        ServerStreaming.prototype.getStreamId = function (streamingMethod, branchKey) {
            if (typeof branchKey !== "string") {
                branchKey = "";
            }
            if (!streamingMethod.protocolState.branchKeyToStreamIdMap) {
                throw new Error("streaming " + streamingMethod.definition.name + " method without protocol state");
            }
            var needleBranch = streamingMethod.protocolState.branchKeyToStreamIdMap.filter(function (branch) {
                return branch.key === branchKey;
            })[0];
            var streamId = (needleBranch ? needleBranch.streamId : undefined);
            if (typeof streamId !== "string" || streamId === "") {
                streamId = this.getNextStreamId();
                streamingMethod.protocolState.branchKeyToStreamIdMap.push({ key: branchKey, streamId: streamId });
            }
            return streamId;
        };
        return ServerStreaming;
    }());

    var ServerProtocol = (function () {
        function ServerProtocol(session, clientRepository, serverRepository, logger) {
            var _this = this;
            this.session = session;
            this.clientRepository = clientRepository;
            this.serverRepository = serverRepository;
            this.logger = logger;
            this.callbacks = lib$2();
            this.streaming = new ServerStreaming$1(session, clientRepository, serverRepository);
            this.session.on("invoke", function (msg) { return _this.handleInvokeMessage(msg); });
        }
        ServerProtocol.prototype.createStream = function (repoMethod) {
            repoMethod.protocolState.subscriptionsMap = {};
            repoMethod.protocolState.branchKeyToStreamIdMap = [];
            return this.register(repoMethod, true);
        };
        ServerProtocol.prototype.register = function (repoMethod, isStreaming) {
            var _this = this;
            var methodDef = repoMethod.definition;
            var flags = { streaming: isStreaming || false };
            var registerMsg = {
                type: "register",
                methods: [{
                        id: repoMethod.repoId,
                        name: methodDef.name,
                        display_name: methodDef.displayName,
                        description: methodDef.description,
                        version: methodDef.version,
                        flags: flags,
                        object_types: methodDef.objectTypes || methodDef.object_types,
                        input_signature: methodDef.accepts,
                        result_signature: methodDef.returns,
                        restrictions: undefined,
                    }],
            };
            return this.session.send(registerMsg, { methodId: repoMethod.repoId })
                .then(function () {
                _this.logger.debug("registered method " + repoMethod.definition.name + " with id " + repoMethod.repoId);
            })
                .catch(function (msg) {
                _this.logger.warn("failed to register method " + repoMethod.definition.name + " with id " + repoMethod.repoId + " - " + JSON.stringify(msg));
                throw msg;
            });
        };
        ServerProtocol.prototype.onInvoked = function (callback) {
            this.callbacks.add("onInvoked", callback);
        };
        ServerProtocol.prototype.methodInvocationResult = function (method, invocationId, err, result) {
            var msg;
            if (err || err === "") {
                msg = {
                    type: "error",
                    request_id: invocationId,
                    reason_uri: "agm.errors.client_error",
                    reason: err,
                    context: result,
                    peer_id: undefined,
                };
            }
            else {
                msg = {
                    type: "yield",
                    invocation_id: invocationId,
                    peer_id: this.session.peerId,
                    result: result,
                    request_id: undefined,
                };
            }
            this.session.sendFireAndForget(msg);
        };
        ServerProtocol.prototype.unregister = function (method) {
            return __awaiter$1(this, void 0, void 0, function () {
                var msg;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            msg = {
                                type: "unregister",
                                methods: [method.repoId],
                            };
                            return [4, this.session.send(msg)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            });
        };
        ServerProtocol.prototype.getBranchList = function (method) {
            return this.streaming.getBranchList(method);
        };
        ServerProtocol.prototype.getSubscriptionList = function (method, branchKey) {
            return this.streaming.getSubscriptionList(method, branchKey);
        };
        ServerProtocol.prototype.closeAllSubscriptions = function (method, branchKey) {
            this.streaming.closeMultipleSubscriptions(method, branchKey);
        };
        ServerProtocol.prototype.pushData = function (method, data, branches) {
            this.streaming.pushData(method, data, branches);
        };
        ServerProtocol.prototype.pushDataToSingle = function (method, subscription, data) {
            this.streaming.pushDataToSingle(method, subscription, data);
        };
        ServerProtocol.prototype.closeSingleSubscription = function (method, subscription) {
            this.streaming.closeSingleSubscription(method, subscription);
        };
        ServerProtocol.prototype.acceptRequestOnBranch = function (requestContext, method, branch) {
            this.streaming.acceptRequestOnBranch(requestContext, method, branch);
        };
        ServerProtocol.prototype.rejectRequest = function (requestContext, method, reason) {
            this.streaming.rejectRequest(requestContext, method, reason);
        };
        ServerProtocol.prototype.onSubRequest = function (callback) {
            this.streaming.onSubRequest(callback);
        };
        ServerProtocol.prototype.onSubAdded = function (callback) {
            this.streaming.onSubAdded(callback);
        };
        ServerProtocol.prototype.onSubRemoved = function (callback) {
            this.streaming.onSubRemoved(callback);
        };
        ServerProtocol.prototype.handleInvokeMessage = function (msg) {
            var invocationId = msg.invocation_id;
            var callerId = msg.caller_id;
            var methodId = msg.method_id;
            var args = msg.arguments_kv;
            var methodList = this.serverRepository.getList();
            var method = methodList.filter(function (m) {
                return m.repoId === methodId;
            })[0];
            if (method === undefined) {
                return;
            }
            var client = this.clientRepository.getServerById(callerId).instance;
            var invocationArgs = { args: args, instance: client };
            this.callbacks.execute("onInvoked", method, invocationId, invocationArgs);
        };
        return ServerProtocol;
    }());

    var UserSubscription = (function () {
        function UserSubscription(repository, subscriptionData) {
            this.repository = repository;
            this.subscriptionData = subscriptionData;
        }
        Object.defineProperty(UserSubscription.prototype, "requestArguments", {
            get: function () {
                return this.subscriptionData.params.arguments || {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserSubscription.prototype, "servers", {
            get: function () {
                var _this = this;
                return this.subscriptionData.trackedServers
                    .filter(function (pair) { return pair.subscriptionId; })
                    .map(function (pair) { return _this.repository.getServerById(pair.serverId).instance; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserSubscription.prototype, "serverInstance", {
            get: function () {
                return this.servers[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserSubscription.prototype, "stream", {
            get: function () {
                return this.subscriptionData.method;
            },
            enumerable: true,
            configurable: true
        });
        UserSubscription.prototype.onData = function (dataCallback) {
            if (typeof dataCallback !== "function") {
                throw new TypeError("The data callback must be a function.");
            }
            this.subscriptionData.handlers.onData.push(dataCallback);
            if (this.subscriptionData.handlers.onData.length === 1 && this.subscriptionData.queued.data.length > 0) {
                this.subscriptionData.queued.data.forEach(function (dataItem) {
                    dataCallback(dataItem);
                });
            }
        };
        UserSubscription.prototype.onClosed = function (closedCallback) {
            if (typeof closedCallback !== "function") {
                throw new TypeError("The callback must be a function.");
            }
            this.subscriptionData.handlers.onClosed.push(closedCallback);
        };
        UserSubscription.prototype.onFailed = function (callback) {
        };
        UserSubscription.prototype.onConnected = function (callback) {
            if (typeof callback !== "function") {
                throw new TypeError("The callback must be a function.");
            }
            this.subscriptionData.handlers.onConnected.push(callback);
        };
        UserSubscription.prototype.close = function () {
            this.subscriptionData.close();
        };
        UserSubscription.prototype.setNewSubscription = function (newSub) {
            this.subscriptionData = newSub;
        };
        return UserSubscription;
    }());

    var STATUS_AWAITING_ACCEPT = "awaitingAccept";
    var STATUS_SUBSCRIBED = "subscribed";
    var ERR_MSG_SUB_FAILED = "Subscription failed.";
    var ERR_MSG_SUB_REJECTED = "Subscription rejected.";
    var ON_CLOSE_MSG_SERVER_INIT = "ServerInitiated";
    var ON_CLOSE_MSG_CLIENT_INIT = "ClientInitiated";
    var ClientStreaming = (function () {
        function ClientStreaming(session, repository, logger) {
            var _this = this;
            this.session = session;
            this.repository = repository;
            this.logger = logger;
            this.subscriptionsList = {};
            this.subscriptionIdToLocalKeyMap = {};
            this.nextSubLocalKey = 0;
            this.handleErrorSubscribing = function (errorResponse) {
                var tag = errorResponse._tag;
                var subLocalKey = tag.subLocalKey;
                var pendingSub = _this.subscriptionsList[subLocalKey];
                if (typeof pendingSub !== "object") {
                    return;
                }
                pendingSub.trackedServers = pendingSub.trackedServers.filter(function (server) {
                    return server.serverId !== tag.serverId;
                });
                if (pendingSub.trackedServers.length <= 0) {
                    clearTimeout(pendingSub.timeoutId);
                    if (pendingSub.status === STATUS_AWAITING_ACCEPT) {
                        var reason = (typeof errorResponse.reason === "string" && errorResponse.reason !== "") ?
                            ' Publisher said "' + errorResponse.reason + '".' :
                            " No reason given.";
                        var callArgs = typeof pendingSub.params.arguments === "object" ?
                            JSON.stringify(pendingSub.params.arguments) :
                            "{}";
                        pendingSub.error({
                            message: ERR_MSG_SUB_REJECTED + reason + " Called with:" + callArgs,
                            called_with: pendingSub.params.arguments,
                            method: pendingSub.method,
                        });
                    }
                    else if (pendingSub.status === STATUS_SUBSCRIBED) {
                        _this.callOnClosedHandlers(pendingSub);
                    }
                    delete _this.subscriptionsList[subLocalKey];
                }
            };
            this.handleSubscribed = function (msg) {
                var subLocalKey = msg._tag.subLocalKey;
                var pendingSub = _this.subscriptionsList[subLocalKey];
                if (typeof pendingSub !== "object") {
                    return;
                }
                var serverId = msg._tag.serverId;
                var acceptingServer = pendingSub.trackedServers
                    .filter(function (server) {
                    return server.serverId === serverId;
                })[0];
                if (typeof acceptingServer !== "object") {
                    return;
                }
                acceptingServer.subscriptionId = msg.subscription_id;
                _this.subscriptionIdToLocalKeyMap[msg.subscription_id] = subLocalKey;
                var isFirstResponse = (pendingSub.status === STATUS_AWAITING_ACCEPT);
                pendingSub.status = STATUS_SUBSCRIBED;
                if (isFirstResponse) {
                    var reconnect = false;
                    var sub = pendingSub.subscription;
                    if (sub) {
                        sub.setNewSubscription(pendingSub);
                        pendingSub.success(sub);
                        reconnect = true;
                    }
                    else {
                        sub = new UserSubscription(_this.repository, pendingSub);
                        pendingSub.subscription = sub;
                        pendingSub.success(sub);
                    }
                    for (var _i = 0, _a = pendingSub.handlers.onConnected; _i < _a.length; _i++) {
                        var handler = _a[_i];
                        try {
                            handler(sub.serverInstance, reconnect);
                        }
                        catch (e) {
                        }
                    }
                }
            };
            this.handleEventData = function (msg) {
                var subLocalKey = _this.subscriptionIdToLocalKeyMap[msg.subscription_id];
                if (typeof subLocalKey === "undefined") {
                    return;
                }
                var subscription = _this.subscriptionsList[subLocalKey];
                if (typeof subscription !== "object") {
                    return;
                }
                var trackedServersFound = subscription.trackedServers.filter(function (server) {
                    return server.subscriptionId === msg.subscription_id;
                });
                if (trackedServersFound.length !== 1) {
                    return;
                }
                var isPrivateData = msg.oob;
                var sendingServerId = trackedServersFound[0].serverId;
                var receivedStreamData = function () {
                    return {
                        data: msg.data,
                        server: _this.repository.getServerById(sendingServerId).instance,
                        requestArguments: subscription.params.arguments,
                        message: undefined,
                        private: isPrivateData,
                    };
                };
                var onDataHandlers = subscription.handlers.onData;
                var queuedData = subscription.queued.data;
                if (onDataHandlers.length > 0) {
                    onDataHandlers.forEach(function (callback) {
                        if (typeof callback === "function") {
                            callback(receivedStreamData());
                        }
                    });
                }
                else {
                    queuedData.push(receivedStreamData());
                }
            };
            this.handleSubscriptionCancelled = function (msg) {
                var subLocalKey = _this.subscriptionIdToLocalKeyMap[msg.subscription_id];
                if (typeof subLocalKey === "undefined") {
                    return;
                }
                var subscription = _this.subscriptionsList[subLocalKey];
                if (typeof subscription !== "object") {
                    return;
                }
                var expectedNewLength = subscription.trackedServers.length - 1;
                subscription.trackedServers = subscription.trackedServers.filter(function (server) {
                    if (server.subscriptionId === msg.subscription_id) {
                        subscription.queued.closers.push(server.serverId);
                        return false;
                    }
                    else {
                        return true;
                    }
                });
                if (subscription.trackedServers.length !== expectedNewLength) {
                    return;
                }
                if (subscription.trackedServers.length <= 0) {
                    clearTimeout(subscription.timeoutId);
                    _this.callOnClosedHandlers(subscription);
                    delete _this.subscriptionsList[subLocalKey];
                }
                delete _this.subscriptionIdToLocalKeyMap[msg.subscription_id];
            };
            session.on("subscribed", this.handleSubscribed);
            session.on("event", this.handleEventData);
            session.on("subscription-cancelled", this.handleSubscriptionCancelled);
        }
        ClientStreaming.prototype.subscribe = function (streamingMethod, params, targetServers, success, error, existingSub) {
            var _this = this;
            if (targetServers.length === 0) {
                error({
                    method: streamingMethod,
                    called_with: params.arguments,
                    message: ERR_MSG_SUB_FAILED + " No available servers matched the target params.",
                });
                return;
            }
            var subLocalKey = this.getNextSubscriptionLocalKey();
            var pendingSub = this.registerSubscription(subLocalKey, streamingMethod, params, success, error, params.methodResponseTimeout || 10000, existingSub);
            if (typeof pendingSub !== "object") {
                error({
                    method: streamingMethod,
                    called_with: params.arguments,
                    message: ERR_MSG_SUB_FAILED + " Unable to register the user callbacks.",
                });
                return;
            }
            targetServers.forEach(function (target) {
                var serverId = target.server.id;
                var method = target.methods.find(function (m) { return m.name === streamingMethod.name; });
                if (!method) {
                    _this.logger.error("can not find method " + streamingMethod.name + " for target " + target.server.id);
                    return;
                }
                pendingSub.trackedServers.push({
                    serverId: serverId,
                    subscriptionId: undefined,
                });
                var msg = {
                    type: "subscribe",
                    server_id: serverId,
                    method_id: method.gatewayId,
                    arguments_kv: params.arguments,
                };
                _this.session.send(msg, { serverId: serverId, subLocalKey: subLocalKey })
                    .then(function (m) { return _this.handleSubscribed(m); })
                    .catch(function (err) { return _this.handleErrorSubscribing(err); });
            });
        };
        ClientStreaming.prototype.drainSubscriptions = function () {
            var existing = Object.values(this.subscriptionsList);
            this.subscriptionsList = {};
            this.subscriptionIdToLocalKeyMap = {};
            return existing;
        };
        ClientStreaming.prototype.getNextSubscriptionLocalKey = function () {
            var current = this.nextSubLocalKey;
            this.nextSubLocalKey += 1;
            return current;
        };
        ClientStreaming.prototype.registerSubscription = function (subLocalKey, method, params, success, error, timeout, existingSub) {
            var _this = this;
            var subsInfo = {
                localKey: subLocalKey,
                status: STATUS_AWAITING_ACCEPT,
                method: method,
                params: params,
                success: success,
                error: error,
                trackedServers: [],
                handlers: {
                    onData: (existingSub === null || existingSub === void 0 ? void 0 : existingSub.handlers.onData) || [],
                    onClosed: (existingSub === null || existingSub === void 0 ? void 0 : existingSub.handlers.onClosed) || [],
                    onConnected: (existingSub === null || existingSub === void 0 ? void 0 : existingSub.handlers.onConnected) || [],
                },
                queued: {
                    data: [],
                    closers: [],
                },
                timeoutId: undefined,
                close: function () { return _this.closeSubscription(subLocalKey); },
                subscription: existingSub === null || existingSub === void 0 ? void 0 : existingSub.subscription
            };
            if (!existingSub) {
                if (params.onData) {
                    subsInfo.handlers.onData.push(params.onData);
                }
                if (params.onClosed) {
                    subsInfo.handlers.onClosed.push(params.onClosed);
                }
                if (params.onConnected) {
                    subsInfo.handlers.onConnected.push(params.onConnected);
                }
            }
            this.subscriptionsList[subLocalKey] = subsInfo;
            subsInfo.timeoutId = setTimeout(function () {
                if (_this.subscriptionsList[subLocalKey] === undefined) {
                    return;
                }
                var pendingSub = _this.subscriptionsList[subLocalKey];
                if (pendingSub.status === STATUS_AWAITING_ACCEPT) {
                    error({
                        method: method,
                        called_with: params.arguments,
                        message: ERR_MSG_SUB_FAILED + " Subscription attempt timed out after " + timeout + " ms.",
                    });
                    delete _this.subscriptionsList[subLocalKey];
                }
                else if (pendingSub.status === STATUS_SUBSCRIBED && pendingSub.trackedServers.length > 0) {
                    pendingSub.trackedServers = pendingSub.trackedServers.filter(function (server) {
                        return (typeof server.subscriptionId !== "undefined");
                    });
                    delete pendingSub.timeoutId;
                    if (pendingSub.trackedServers.length <= 0) {
                        _this.callOnClosedHandlers(pendingSub);
                        delete _this.subscriptionsList[subLocalKey];
                    }
                }
            }, timeout);
            return subsInfo;
        };
        ClientStreaming.prototype.callOnClosedHandlers = function (subscription, reason) {
            var closersCount = subscription.queued.closers.length;
            var closingServerId = (closersCount > 0) ? subscription.queued.closers[closersCount - 1] : null;
            var closingServer;
            if (closingServerId !== undefined && typeof closingServerId === "string") {
                closingServer = this.repository.getServerById(closingServerId).instance;
            }
            subscription.handlers.onClosed.forEach(function (callback) {
                if (typeof callback !== "function") {
                    return;
                }
                callback({
                    message: reason || ON_CLOSE_MSG_SERVER_INIT,
                    requestArguments: subscription.params.arguments || {},
                    server: closingServer,
                    stream: subscription.method,
                });
            });
        };
        ClientStreaming.prototype.closeSubscription = function (subLocalKey) {
            var _this = this;
            var subscription = this.subscriptionsList[subLocalKey];
            if (typeof subscription !== "object") {
                return;
            }
            subscription.trackedServers.forEach(function (server) {
                if (typeof server.subscriptionId === "undefined") {
                    return;
                }
                subscription.queued.closers.push(server.serverId);
                _this.session.sendFireAndForget({
                    type: "unsubscribe",
                    subscription_id: server.subscriptionId,
                    reason_uri: "",
                    reason: ON_CLOSE_MSG_CLIENT_INIT,
                });
                delete _this.subscriptionIdToLocalKeyMap[server.subscriptionId];
            });
            subscription.trackedServers = [];
            this.callOnClosedHandlers(subscription, ON_CLOSE_MSG_CLIENT_INIT);
            delete this.subscriptionsList[subLocalKey];
        };
        return ClientStreaming;
    }());

    var ClientProtocol = (function () {
        function ClientProtocol(session, repository, logger) {
            var _this = this;
            this.session = session;
            this.repository = repository;
            this.logger = logger;
            session.on("peer-added", function (msg) { return _this.handlePeerAdded(msg); });
            session.on("peer-removed", function (msg) { return _this.handlePeerRemoved(msg); });
            session.on("methods-added", function (msg) { return _this.handleMethodsAddedMessage(msg); });
            session.on("methods-removed", function (msg) { return _this.handleMethodsRemovedMessage(msg); });
            this.streaming = new ClientStreaming(session, repository, logger);
        }
        ClientProtocol.prototype.subscribe = function (stream, options, targetServers, success, error, existingSub) {
            this.streaming.subscribe(stream, options, targetServers, success, error, existingSub);
        };
        ClientProtocol.prototype.invoke = function (id, method, args, target) {
            var _this = this;
            var serverId = target.id;
            var methodId = method.gatewayId;
            var msg = {
                type: "call",
                server_id: serverId,
                method_id: methodId,
                arguments_kv: args,
            };
            return this.session.send(msg, { invocationId: id, serverId: serverId })
                .then(function (m) { return _this.handleResultMessage(m); })
                .catch(function (err) { return _this.handleInvocationError(err); });
        };
        ClientProtocol.prototype.drainSubscriptions = function () {
            return this.streaming.drainSubscriptions();
        };
        ClientProtocol.prototype.handlePeerAdded = function (msg) {
            var newPeerId = msg.new_peer_id;
            var remoteId = msg.identity;
            var isLocal = msg.meta ? msg.meta.local : true;
            var pid = Number(remoteId.process);
            var serverInfo = {
                machine: remoteId.machine,
                pid: isNaN(pid) ? remoteId.process : pid,
                instance: remoteId.instance,
                application: remoteId.application,
                applicationName: remoteId.applicationName,
                environment: remoteId.environment,
                region: remoteId.region,
                user: remoteId.user,
                windowId: remoteId.windowId,
                peerId: newPeerId,
                api: remoteId.api,
                isLocal: isLocal
            };
            this.repository.addServer(serverInfo, newPeerId);
        };
        ClientProtocol.prototype.handlePeerRemoved = function (msg) {
            var removedPeerId = msg.removed_id;
            var reason = msg.reason;
            this.repository.removeServerById(removedPeerId, reason);
        };
        ClientProtocol.prototype.handleMethodsAddedMessage = function (msg) {
            var _this = this;
            var serverId = msg.server_id;
            var methods = msg.methods;
            methods.forEach(function (method) {
                _this.repository.addServerMethod(serverId, method);
            });
        };
        ClientProtocol.prototype.handleMethodsRemovedMessage = function (msg) {
            var _this = this;
            var serverId = msg.server_id;
            var methodIdList = msg.methods;
            var server = this.repository.getServerById(serverId);
            var serverMethodKeys = Object.keys(server.methods);
            serverMethodKeys.forEach(function (methodKey) {
                var method = server.methods[methodKey];
                if (methodIdList.indexOf(method.gatewayId) > -1) {
                    _this.repository.removeServerMethod(serverId, methodKey);
                }
            });
        };
        ClientProtocol.prototype.handleResultMessage = function (msg) {
            var invocationId = msg._tag.invocationId;
            var result = msg.result;
            var serverId = msg._tag.serverId;
            var server = this.repository.getServerById(serverId);
            return {
                invocationId: invocationId,
                result: result,
                instance: server.instance,
                status: InvokeStatus.Success,
                message: ""
            };
        };
        ClientProtocol.prototype.handleInvocationError = function (msg) {
            this.logger.debug("handle invocation error " + JSON.stringify(msg));
            var invocationId = msg._tag.invocationId;
            var serverId = msg._tag.serverId;
            var server = this.repository.getServerById(serverId);
            var message = msg.reason;
            var context = msg.context;
            return {
                invocationId: invocationId,
                result: context,
                instance: server.instance,
                status: InvokeStatus.Error,
                message: message
            };
        };
        return ClientProtocol;
    }());

    function gW3ProtocolFactory (instance, connection, clientRepository, serverRepository, libConfig, interop) {
        var logger = libConfig.logger.subLogger("gw3-protocol");
        var resolveReadyPromise;
        var readyPromise = new Promise(function (resolve) {
            resolveReadyPromise = resolve;
        });
        var session = connection.domain("agm", ["subscribed"]);
        var server = new ServerProtocol(session, clientRepository, serverRepository, logger.subLogger("server"));
        var client = new ClientProtocol(session, clientRepository, logger.subLogger("client"));
        function handleReconnect() {
            logger.info("reconnected - will replay registered methods and subscriptions");
            var existingSubscriptions = client.drainSubscriptions();
            for (var _i = 0, existingSubscriptions_1 = existingSubscriptions; _i < existingSubscriptions_1.length; _i++) {
                var sub = existingSubscriptions_1[_i];
                var methodInfo = sub.method;
                var params = Object.assign({}, sub.params);
                logger.info("trying to re-subscribe to method " + methodInfo.name);
                interop.client.subscribe(methodInfo, params, undefined, undefined, sub);
            }
            var registeredMethods = serverRepository.getList();
            serverRepository.reset();
            for (var _a = 0, registeredMethods_1 = registeredMethods; _a < registeredMethods_1.length; _a++) {
                var method = registeredMethods_1[_a];
                var def = method.definition;
                logger.info("re-publishing method " + def.name);
                if (method.stream) {
                    interop.server.createStream(def, method.streamCallbacks, undefined, undefined, method.stream);
                }
                else if (method.theFunction && method.theFunction.userCallback) {
                    interop.register(def, method.theFunction.userCallback);
                }
                else if (method.theFunction && method.theFunction.userCallbackAsync) {
                    interop.registerAsync(def, method.theFunction.userCallbackAsync);
                }
            }
        }
        function handleInitialJoin() {
            if (resolveReadyPromise) {
                resolveReadyPromise({
                    client: client,
                    server: server,
                });
                resolveReadyPromise = undefined;
            }
        }
        session.onJoined(function (reconnect) {
            clientRepository.addServer(instance, connection.peerId);
            if (reconnect) {
                handleReconnect();
            }
            else {
                handleInitialJoin();
            }
        });
        session.onLeft(function () {
            clientRepository.reset();
        });
        session.join();
        return readyPromise;
    }

    var Interop = (function () {
        function Interop(configuration) {
            var _this = this;
            if (typeof configuration === "undefined") {
                throw new Error("configuration is required");
            }
            if (typeof configuration.connection === "undefined") {
                throw new Error("configuration.connections is required");
            }
            var connection = configuration.connection;
            if (typeof configuration.methodResponseTimeout !== "number") {
                configuration.methodResponseTimeout = 30 * 1000;
            }
            if (typeof configuration.waitTimeoutMs !== "number") {
                configuration.waitTimeoutMs = 30 * 1000;
            }
            InstanceWrapper.API = this;
            this.instance = new InstanceWrapper(undefined, connection).unwrap();
            this.clientRepository = new ClientRepository(configuration.logger.subLogger("cRep"));
            this.serverRepository = new ServerRepository();
            var protocolPromise;
            if (connection.protocolVersion === 3) {
                protocolPromise = gW3ProtocolFactory(this.instance, connection, this.clientRepository, this.serverRepository, configuration, this);
            }
            else {
                throw new Error("protocol " + connection.protocolVersion + " not supported");
            }
            this.readyPromise = protocolPromise.then(function (protocol) {
                _this.protocol = protocol;
                _this.client = new Client(_this.protocol, _this.clientRepository, _this.instance, configuration);
                _this.server = new Server(_this.protocol, _this.serverRepository);
                return _this;
            });
        }
        Interop.prototype.ready = function () {
            return this.readyPromise;
        };
        Interop.prototype.serverRemoved = function (callback) {
            return this.client.serverRemoved(callback);
        };
        Interop.prototype.serverAdded = function (callback) {
            return this.client.serverAdded(callback);
        };
        Interop.prototype.serverMethodRemoved = function (callback) {
            return this.client.serverMethodRemoved(callback);
        };
        Interop.prototype.serverMethodAdded = function (callback) {
            return this.client.serverMethodAdded(callback);
        };
        Interop.prototype.methodRemoved = function (callback) {
            return this.client.methodRemoved(callback);
        };
        Interop.prototype.methodAdded = function (callback) {
            return this.client.methodAdded(callback);
        };
        Interop.prototype.methodsForInstance = function (instance) {
            return this.client.methodsForInstance(instance);
        };
        Interop.prototype.methods = function (methodFilter) {
            return this.client.methods(methodFilter);
        };
        Interop.prototype.servers = function (methodFilter) {
            return this.client.servers(methodFilter);
        };
        Interop.prototype.subscribe = function (method, options, successCallback, errorCallback) {
            return this.client.subscribe(method, options, successCallback, errorCallback);
        };
        Interop.prototype.createStream = function (streamDef, callbacks, successCallback, errorCallback) {
            return this.server.createStream(streamDef, callbacks, successCallback, errorCallback);
        };
        Interop.prototype.unregister = function (methodFilter) {
            return this.server.unregister(methodFilter);
        };
        Interop.prototype.registerAsync = function (methodDefinition, callback) {
            return this.server.registerAsync(methodDefinition, callback);
        };
        Interop.prototype.register = function (methodDefinition, callback) {
            return this.server.register(methodDefinition, callback);
        };
        Interop.prototype.invoke = function (methodFilter, argumentObj, target, additionalOptions, success, error) {
            return this.client.invoke(methodFilter, argumentObj, target, additionalOptions, success, error);
        };
        return Interop;
    }());

    var successMessages = ["subscribed", "success"];
    var MessageBus = (function () {
        function MessageBus(connection, logger) {
            var _this = this;
            this.publish = function (topic, data, options) {
                var _a = options || {}, routingKey = _a.routingKey, target = _a.target;
                var args = _this.removeEmptyValues({
                    type: "publish",
                    topic: topic,
                    data: data,
                    peer_id: _this.peerId,
                    routing_key: routingKey,
                    target_identity: target
                });
                _this.session.send(args);
            };
            this.subscribe = function (topic, callback, options) {
                return new Promise(function (resolve, reject) {
                    var _a = options || {}, routingKey = _a.routingKey, target = _a.target;
                    var args = _this.removeEmptyValues({
                        type: "subscribe",
                        topic: topic,
                        peer_id: _this.peerId,
                        routing_key: routingKey,
                        source: target
                    });
                    _this.session.send(args)
                        .then(function (response) {
                        var subscription_id = response.subscription_id;
                        _this.subscriptions.push({ subscription_id: subscription_id, topic: topic, callback: callback, source: target });
                        resolve({
                            unsubscribe: function () {
                                _this.session.send({ type: "unsubscribe", subscription_id: subscription_id, peer_id: _this.peerId });
                                _this.subscriptions = _this.subscriptions.filter(function (s) { return s.subscription_id !== subscription_id; });
                                return Promise.resolve();
                            }
                        });
                    })
                        .catch(function (error) { return reject(error); });
                });
            };
            this.watchOnEvent = function () {
                _this.session.on("event", function (args) {
                    var data = args.data, subscription_id = args.subscription_id;
                    var source = args["publisher-identity"];
                    var subscription = _this.subscriptions.find(function (s) { return s.subscription_id === subscription_id; });
                    if (subscription) {
                        if (!subscription.source) {
                            subscription.callback(data, subscription.topic, source);
                        }
                        else {
                            if (_this.keysMatch(subscription.source, source)) {
                                subscription.callback(data, subscription.topic, source);
                            }
                        }
                    }
                });
            };
            this.connection = connection;
            this.logger = logger;
            this.peerId = connection.peerId;
            this.subscriptions = [];
            this.session = connection.domain("bus", successMessages);
            this.readyPromise = this.session.join();
            this.readyPromise.then(function () {
                _this.watchOnEvent();
            });
        }
        MessageBus.prototype.ready = function () {
            return this.readyPromise;
        };
        MessageBus.prototype.removeEmptyValues = function (obj) {
            var cleaned = {};
            Object.keys(obj).forEach(function (key) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    cleaned[key] = obj[key];
                }
            });
            return cleaned;
        };
        MessageBus.prototype.keysMatch = function (obj1, obj2) {
            var keysObj1 = Object.keys(obj1);
            var allMatch = true;
            keysObj1.forEach(function (key) {
                if (obj1[key] !== obj2[key]) {
                    allMatch = false;
                }
            });
            return allMatch;
        };
        return MessageBus;
    }());

    var GlueCore = function (userConfig, ext) {
        var gdVersion = Utils.getGDMajorVersion();
        var glue42gd;
        var preloadPromise = Promise.resolve();
        if (gdVersion) {
            if (gdVersion < 3) {
                throw new Error("GD v2 is not supported. Use v4 of the API to run in that context.");
            }
            else if (gdVersion >= 3) {
                glue42gd = window.glue42gd;
                preloadPromise = window.gdPreloadPromise || preloadPromise;
            }
        }
        var glueInitTimer = timer();
        userConfig = userConfig || {};
        ext = ext || {};
        var internalConfig = prepareConfig(userConfig, ext, glue42gd);
        var _connection;
        var _interop;
        var _logger;
        var _metrics;
        var _contexts;
        var _bus;
        var _allowTrace;
        var libs = {};
        function registerLib(name, inner, t) {
            _allowTrace = _logger.canPublish("trace");
            if (_allowTrace) {
                _logger.trace("registering " + name + " module");
            }
            var done = function () {
                inner.initTime = t.stop();
                inner.initEndTime = t.endTime;
                _logger.trace(name + " is ready");
            };
            inner.initStartTime = t.startTime;
            if (inner.ready) {
                inner.ready().then(function () {
                    done();
                });
            }
            else {
                done();
            }
            if (!Array.isArray(name)) {
                name = [name];
            }
            name.forEach(function (n) {
                libs[n] = inner;
                GlueCore[n] = inner;
            });
        }
        function setupConnection() {
            var initTimer = timer();
            _connection = new Connection(internalConfig.connection, _logger.subLogger("connection"));
            var authPromise = Promise.resolve(internalConfig.auth);
            if (internalConfig.connection && !internalConfig.auth) {
                if (glue42gd) {
                    _logger.trace("trying to get gw token...");
                    authPromise = glue42gd.getGWToken().then(function (token) {
                        _logger.trace("got GW token " + (token === null || token === void 0 ? void 0 : token.substring(token.length - 10)));
                        return {
                            gatewayToken: token
                        };
                    });
                }
                else {
                    authPromise = Promise.reject("You need to provide auth information");
                }
            }
            return authPromise
                .then(function (authConfig) {
                var authRequest;
                if (Object.prototype.toString.call(authConfig) === "[object Object]") {
                    authRequest = authConfig;
                }
                else {
                    throw new Error("Invalid auth object - " + JSON.stringify(authConfig));
                }
                return _connection.login(authRequest);
            })
                .then(function () {
                registerLib("connection", _connection, initTimer);
                return internalConfig;
            })
                .catch(function (e) {
                if (_connection) {
                    _connection.logout();
                }
                throw e;
            });
        }
        function setupLogger() {
            var _a;
            var initTimer = timer();
            _logger = new Logger("" + ((_a = internalConfig.connection.identity) === null || _a === void 0 ? void 0 : _a.application), undefined, internalConfig.customLogger);
            _logger.consoleLevel(internalConfig.logger.console);
            _logger.publishLevel(internalConfig.logger.publish);
            registerLib("logger", _logger, initTimer);
            return Promise.resolve(undefined);
        }
        function setupMetrics() {
            var initTimer = timer();
            var config = internalConfig.metrics;
            var rootMetrics = metrics({
                connection: config ? _connection : undefined,
                logger: _logger.subLogger("metrics")
            });
            var rootSystem = rootMetrics;
            if (typeof config !== "boolean" && config.disableAutoAppSystem) {
                rootSystem = rootMetrics;
            }
            else {
                rootSystem = rootMetrics.subSystem("App");
            }
            _metrics = addFAVSupport(rootSystem);
            registerLib("metrics", _metrics, initTimer);
            return Promise.resolve();
        }
        function setupInterop() {
            var initTimer = timer();
            var agmConfig = {
                connection: _connection,
                logger: _logger.subLogger("interop"),
            };
            _interop = new Interop(agmConfig);
            Logger.Interop = _interop;
            registerLib(["interop", "agm"], _interop, initTimer);
            return Promise.resolve();
        }
        function setupContexts() {
            var hasActivities = (internalConfig.activities && _connection.protocolVersion === 3);
            var needsContexts = internalConfig.contexts || hasActivities;
            if (needsContexts) {
                var initTimer = timer();
                _contexts = new ContextsModule({
                    connection: _connection,
                    logger: _logger.subLogger("contexts")
                });
                registerLib("contexts", _contexts, initTimer);
                return _contexts;
            }
            else {
                var replayer = _connection.replayer;
                if (replayer) {
                    replayer.drain(ContextMessageReplaySpec.name);
                }
            }
        }
        function setupBus() {
            return __awaiter$1(this, void 0, void 0, function () {
                var initTimer;
                return __generator$1(this, function (_a) {
                    if (!internalConfig.bus) {
                        return [2, Promise.resolve()];
                    }
                    initTimer = timer();
                    _bus = new MessageBus(_connection, _logger.subLogger("bus"));
                    registerLib("bus", _bus, initTimer);
                    return [2, Promise.resolve()];
                });
            });
        }
        function setupExternalLibs(externalLibs) {
            try {
                externalLibs.forEach(function (lib) {
                    setupExternalLib(lib.name, lib.create);
                });
                return Promise.resolve();
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        function setupExternalLib(name, createCallback) {
            var initTimer = timer();
            var lib = createCallback(libs);
            if (lib) {
                registerLib(name, lib, initTimer);
            }
        }
        function waitForLibs() {
            var libsReadyPromises = Object.keys(libs).map(function (key) {
                var lib = libs[key];
                return lib.ready ?
                    lib.ready() : Promise.resolve();
            });
            return Promise.all(libsReadyPromises);
        }
        function constructGlueObject() {
            var feedbackFunc = function (feedbackInfo) {
                if (!_interop) {
                    return;
                }
                _interop.invoke("T42.ACS.Feedback", feedbackInfo, "best");
            };
            var info = {
                coreVersion: version$2,
                version: internalConfig.version
            };
            glueInitTimer.stop();
            var glue = {
                feedback: feedbackFunc,
                info: info,
                logger: _logger,
                interop: _interop,
                agm: _interop,
                connection: _connection,
                metrics: _metrics,
                contexts: _contexts,
                bus: _bus,
                version: internalConfig.version,
                userConfig: userConfig,
                done: function () {
                    _logger === null || _logger === void 0 ? void 0 : _logger.info("done called by user...");
                    return _connection.logout();
                }
            };
            glue.performance = {
                get glueVer() {
                    return internalConfig.version;
                },
                get glueConfig() {
                    return JSON.stringify(userConfig);
                },
                get browser() {
                    return window.performance.timing.toJSON();
                },
                get memory() {
                    return window.performance.memory;
                },
                get initTimes() {
                    var result = Object.keys(glue)
                        .filter(function (key) {
                        var _a;
                        if (key === "initTimes" || key === "agm") {
                            return false;
                        }
                        return (_a = glue[key]) === null || _a === void 0 ? void 0 : _a.initTime;
                    })
                        .map(function (key) {
                        return {
                            name: key,
                            time: glue[key].initTime,
                            startTime: glue[key].initStartTime,
                            endTime: glue[key].initEndTime
                        };
                    });
                    result.push({
                        name: "glue",
                        startTime: glueInitTimer.startTime,
                        endTime: glueInitTimer.endTime,
                        time: glueInitTimer.period
                    });
                    return result;
                }
            };
            Object.keys(libs).forEach(function (key) {
                var lib = libs[key];
                glue[key] = lib;
            });
            glue.config = {};
            Object.keys(internalConfig).forEach(function (k) {
                glue.config[k] = internalConfig[k];
            });
            if (ext && ext.extOptions) {
                Object.keys(ext.extOptions).forEach(function (k) {
                    glue.config[k] = ext === null || ext === void 0 ? void 0 : ext.extOptions[k];
                });
            }
            if (ext === null || ext === void 0 ? void 0 : ext.enrichGlue) {
                ext.enrichGlue(glue);
            }
            if (glue42gd && glue42gd.updatePerfData) {
                glue42gd.updatePerfData(glue.performance);
            }
            return glue;
        }
        return preloadPromise
            .then(setupLogger)
            .then(setupConnection)
            .then(function () { return Promise.all([setupMetrics(), setupInterop(), setupContexts(), setupBus()]); })
            .then(function () { return _interop.readyPromise; })
            .then(function () {
            return setupExternalLibs(internalConfig.libs || []);
        })
            .then(waitForLibs)
            .then(constructGlueObject)
            .catch(function (err) {
            return Promise.reject({
                err: err,
                libs: libs
            });
        });
    };
    if (typeof window !== "undefined") {
        window.GlueCore = GlueCore;
    }
    GlueCore.version = version$2;
    GlueCore.default = GlueCore;

    var glueWebFactory = createFactoryFunction(GlueCore);
    if (typeof window !== "undefined") {
        window.GlueWeb = glueWebFactory;
    }
    glueWebFactory.default = glueWebFactory;
    glueWebFactory.version = version;

    return glueWebFactory;

})));
//# sourceMappingURL=web.umd.js.map