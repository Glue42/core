(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.workspaces = factory());
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

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

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
    var lib = createRegistry;

    /**
     * Wraps values in an `Ok` type.
     *
     * Example: `ok(5) // => {ok: true, result: 5}`
     */
    var ok = function (result) { return ({ ok: true, result: result }); };
    /**
     * Typeguard for `Ok`.
     */
    var isOk = function (r) { return r.ok === true; };
    /**
     * Wraps errors in an `Err` type.
     *
     * Example: `err('on fire') // => {ok: false, error: 'on fire'}`
     */
    var err = function (error) { return ({ ok: false, error: error }); };
    /**
     * Typeguard for `Err`.
     */
    var isErr = function (r) { return r.ok === false; };
    /**
     * Create a `Promise` that either resolves with the result of `Ok` or rejects
     * with the error of `Err`.
     */
    var asPromise = function (r) {
        return r.ok === true ? Promise.resolve(r.result) : Promise.reject(r.error);
    };
    /**
     * Unwraps a `Result` and returns either the result of an `Ok`, or
     * `defaultValue`.
     *
     * Example:
     * ```
     * Result.withDefault(5, number().run(json))
     * ```
     *
     * It would be nice if `Decoder` had an instance method that mirrored this
     * function. Such a method would look something like this:
     * ```
     * class Decoder<A> {
     *   runWithDefault = (defaultValue: A, json: any): A =>
     *     Result.withDefault(defaultValue, this.run(json));
     * }
     *
     * number().runWithDefault(5, json)
     * ```
     * Unfortunately, the type of `defaultValue: A` on the method causes issues
     * with type inference on  the `object` decoder in some situations. While these
     * inference issues can be solved by providing the optional type argument for
     * `object`s, the extra trouble and confusion doesn't seem worth it.
     */
    var withDefault = function (defaultValue, r) {
        return r.ok === true ? r.result : defaultValue;
    };
    /**
     * Return the successful result, or throw an error.
     */
    var withException = function (r) {
        if (r.ok === true) {
            return r.result;
        }
        else {
            throw r.error;
        }
    };
    /**
     * Given an array of `Result`s, return the successful values.
     */
    var successes = function (results) {
        return results.reduce(function (acc, r) { return (r.ok === true ? acc.concat(r.result) : acc); }, []);
    };
    /**
     * Apply `f` to the result of an `Ok`, or pass the error through.
     */
    var map = function (f, r) {
        return r.ok === true ? ok(f(r.result)) : r;
    };
    /**
     * Apply `f` to the result of two `Ok`s, or pass an error through. If both
     * `Result`s are errors then the first one is returned.
     */
    var map2 = function (f, ar, br) {
        return ar.ok === false ? ar :
            br.ok === false ? br :
                ok(f(ar.result, br.result));
    };
    /**
     * Apply `f` to the error of an `Err`, or pass the success through.
     */
    var mapError = function (f, r) {
        return r.ok === true ? r : err(f(r.error));
    };
    /**
     * Chain together a sequence of computations that may fail, similar to a
     * `Promise`. If the first computation fails then the error will propagate
     * through. If it succeeds, then `f` will be applied to the value, returning a
     * new `Result`.
     */
    var andThen = function (f, r) {
        return r.ok === true ? f(r.result) : r;
    };


    var result = Object.freeze({
    	ok: ok,
    	isOk: isOk,
    	err: err,
    	isErr: isErr,
    	asPromise: asPromise,
    	withDefault: withDefault,
    	withException: withException,
    	successes: successes,
    	map: map,
    	map2: map2,
    	mapError: mapError,
    	andThen: andThen
    });

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */



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

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function isEqual(a, b) {
        if (a === b) {
            return true;
        }
        if (a === null && b === null) {
            return true;
        }
        if (typeof (a) !== typeof (b)) {
            return false;
        }
        if (typeof (a) === 'object') {
            // Array
            if (Array.isArray(a)) {
                if (!Array.isArray(b)) {
                    return false;
                }
                if (a.length !== b.length) {
                    return false;
                }
                for (var i = 0; i < a.length; i++) {
                    if (!isEqual(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            }
            // Hash table
            var keys = Object.keys(a);
            if (keys.length !== Object.keys(b).length) {
                return false;
            }
            for (var i = 0; i < keys.length; i++) {
                if (!b.hasOwnProperty(keys[i])) {
                    return false;
                }
                if (!isEqual(a[keys[i]], b[keys[i]])) {
                    return false;
                }
            }
            return true;
        }
    }
    /*
     * Helpers
     */
    var isJsonArray = function (json) { return Array.isArray(json); };
    var isJsonObject = function (json) {
        return typeof json === 'object' && json !== null && !isJsonArray(json);
    };
    var typeString = function (json) {
        switch (typeof json) {
            case 'string':
                return 'a string';
            case 'number':
                return 'a number';
            case 'boolean':
                return 'a boolean';
            case 'undefined':
                return 'undefined';
            case 'object':
                if (json instanceof Array) {
                    return 'an array';
                }
                else if (json === null) {
                    return 'null';
                }
                else {
                    return 'an object';
                }
            default:
                return JSON.stringify(json);
        }
    };
    var expectedGot = function (expected, got) {
        return "expected " + expected + ", got " + typeString(got);
    };
    var printPath = function (paths) {
        return paths.map(function (path) { return (typeof path === 'string' ? "." + path : "[" + path + "]"); }).join('');
    };
    var prependAt = function (newAt, _a) {
        var at = _a.at, rest = __rest(_a, ["at"]);
        return (__assign({ at: newAt + (at || '') }, rest));
    };
    /**
     * Decoders transform json objects with unknown structure into known and
     * verified forms. You can create objects of type `Decoder<A>` with either the
     * primitive decoder functions, such as `boolean()` and `string()`, or by
     * applying higher-order decoders to the primitives, such as `array(boolean())`
     * or `dict(string())`.
     *
     * Each of the decoder functions are available both as a static method on
     * `Decoder` and as a function alias -- for example the string decoder is
     * defined at `Decoder.string()`, but is also aliased to `string()`. Using the
     * function aliases exported with the library is recommended.
     *
     * `Decoder` exposes a number of 'run' methods, which all decode json in the
     * same way, but communicate success and failure in different ways. The `map`
     * and `andThen` methods modify decoders without having to call a 'run' method.
     *
     * Alternatively, the main decoder `run()` method returns an object of type
     * `Result<A, DecoderError>`. This library provides a number of helper
     * functions for dealing with the `Result` type, so you can do all the same
     * things with a `Result` as with the decoder methods.
     */
    var Decoder = /** @class */ (function () {
        /**
         * The Decoder class constructor is kept private to separate the internal
         * `decode` function from the external `run` function. The distinction
         * between the two functions is that `decode` returns a
         * `Partial<DecoderError>` on failure, which contains an unfinished error
         * report. When `run` is called on a decoder, the relevant series of `decode`
         * calls is made, and then on failure the resulting `Partial<DecoderError>`
         * is turned into a `DecoderError` by filling in the missing information.
         *
         * While hiding the constructor may seem restrictive, leveraging the
         * provided decoder combinators and helper functions such as
         * `andThen` and `map` should be enough to build specialized decoders as
         * needed.
         */
        function Decoder(decode) {
            var _this = this;
            this.decode = decode;
            /**
             * Run the decoder and return a `Result` with either the decoded value or a
             * `DecoderError` containing the json input, the location of the error, and
             * the error message.
             *
             * Examples:
             * ```
             * number().run(12)
             * // => {ok: true, result: 12}
             *
             * string().run(9001)
             * // =>
             * // {
             * //   ok: false,
             * //   error: {
             * //     kind: 'DecoderError',
             * //     input: 9001,
             * //     at: 'input',
             * //     message: 'expected a string, got 9001'
             * //   }
             * // }
             * ```
             */
            this.run = function (json) {
                return mapError(function (error) { return ({
                    kind: 'DecoderError',
                    input: json,
                    at: 'input' + (error.at || ''),
                    message: error.message || ''
                }); }, _this.decode(json));
            };
            /**
             * Run the decoder as a `Promise`.
             */
            this.runPromise = function (json) { return asPromise(_this.run(json)); };
            /**
             * Run the decoder and return the value on success, or throw an exception
             * with a formatted error string.
             */
            this.runWithException = function (json) { return withException(_this.run(json)); };
            /**
             * Construct a new decoder that applies a transformation to the decoded
             * result. If the decoder succeeds then `f` will be applied to the value. If
             * it fails the error will propagated through.
             *
             * Example:
             * ```
             * number().map(x => x * 5).run(10)
             * // => {ok: true, result: 50}
             * ```
             */
            this.map = function (f) {
                return new Decoder(function (json) { return map(f, _this.decode(json)); });
            };
            /**
             * Chain together a sequence of decoders. The first decoder will run, and
             * then the function will determine what decoder to run second. If the result
             * of the first decoder succeeds then `f` will be applied to the decoded
             * value. If it fails the error will propagate through.
             *
             * This is a very powerful method -- it can act as both the `map` and `where`
             * methods, can improve error messages for edge cases, and can be used to
             * make a decoder for custom types.
             *
             * Example of adding an error message:
             * ```
             * const versionDecoder = valueAt(['version'], number());
             * const infoDecoder3 = object({a: boolean()});
             *
             * const decoder = versionDecoder.andThen(version => {
             *   switch (version) {
             *     case 3:
             *       return infoDecoder3;
             *     default:
             *       return fail(`Unable to decode info, version ${version} is not supported.`);
             *   }
             * });
             *
             * decoder.run({version: 3, a: true})
             * // => {ok: true, result: {a: true}}
             *
             * decoder.run({version: 5, x: 'abc'})
             * // =>
             * // {
             * //   ok: false,
             * //   error: {... message: 'Unable to decode info, version 5 is not supported.'}
             * // }
             * ```
             *
             * Example of decoding a custom type:
             * ```
             * // nominal type for arrays with a length of at least one
             * type NonEmptyArray<T> = T[] & { __nonEmptyArrayBrand__: void };
             *
             * const nonEmptyArrayDecoder = <T>(values: Decoder<T>): Decoder<NonEmptyArray<T>> =>
             *   array(values).andThen(arr =>
             *     arr.length > 0
             *       ? succeed(createNonEmptyArray(arr))
             *       : fail(`expected a non-empty array, got an empty array`)
             *   );
             * ```
             */
            this.andThen = function (f) {
                return new Decoder(function (json) {
                    return andThen(function (value) { return f(value).decode(json); }, _this.decode(json));
                });
            };
            /**
             * Add constraints to a decoder _without_ changing the resulting type. The
             * `test` argument is a predicate function which returns true for valid
             * inputs. When `test` fails on an input, the decoder fails with the given
             * `errorMessage`.
             *
             * ```
             * const chars = (length: number): Decoder<string> =>
             *   string().where(
             *     (s: string) => s.length === length,
             *     `expected a string of length ${length}`
             *   );
             *
             * chars(5).run('12345')
             * // => {ok: true, result: '12345'}
             *
             * chars(2).run('HELLO')
             * // => {ok: false, error: {... message: 'expected a string of length 2'}}
             *
             * chars(12).run(true)
             * // => {ok: false, error: {... message: 'expected a string, got a boolean'}}
             * ```
             */
            this.where = function (test, errorMessage) {
                return _this.andThen(function (value) { return (test(value) ? Decoder.succeed(value) : Decoder.fail(errorMessage)); });
            };
        }
        /**
         * Decoder primitive that validates strings, and fails on all other input.
         */
        Decoder.string = function () {
            return new Decoder(function (json) {
                return typeof json === 'string'
                    ? ok(json)
                    : err({ message: expectedGot('a string', json) });
            });
        };
        /**
         * Decoder primitive that validates numbers, and fails on all other input.
         */
        Decoder.number = function () {
            return new Decoder(function (json) {
                return typeof json === 'number'
                    ? ok(json)
                    : err({ message: expectedGot('a number', json) });
            });
        };
        /**
         * Decoder primitive that validates booleans, and fails on all other input.
         */
        Decoder.boolean = function () {
            return new Decoder(function (json) {
                return typeof json === 'boolean'
                    ? ok(json)
                    : err({ message: expectedGot('a boolean', json) });
            });
        };
        Decoder.constant = function (value) {
            return new Decoder(function (json) {
                return isEqual(json, value)
                    ? ok(value)
                    : err({ message: "expected " + JSON.stringify(value) + ", got " + JSON.stringify(json) });
            });
        };
        Decoder.object = function (decoders) {
            return new Decoder(function (json) {
                if (isJsonObject(json) && decoders) {
                    var obj = {};
                    for (var key in decoders) {
                        if (decoders.hasOwnProperty(key)) {
                            var r = decoders[key].decode(json[key]);
                            if (r.ok === true) {
                                // tslint:disable-next-line:strict-type-predicates
                                if (r.result !== undefined) {
                                    obj[key] = r.result;
                                }
                            }
                            else if (json[key] === undefined) {
                                return err({ message: "the key '" + key + "' is required but was not present" });
                            }
                            else {
                                return err(prependAt("." + key, r.error));
                            }
                        }
                    }
                    return ok(obj);
                }
                else if (isJsonObject(json)) {
                    return ok(json);
                }
                else {
                    return err({ message: expectedGot('an object', json) });
                }
            });
        };
        Decoder.array = function (decoder) {
            return new Decoder(function (json) {
                if (isJsonArray(json) && decoder) {
                    var decodeValue_1 = function (v, i) {
                        return mapError(function (err$$1) { return prependAt("[" + i + "]", err$$1); }, decoder.decode(v));
                    };
                    return json.reduce(function (acc, v, i) {
                        return map2(function (arr, result) { return arr.concat([result]); }, acc, decodeValue_1(v, i));
                    }, ok([]));
                }
                else if (isJsonArray(json)) {
                    return ok(json);
                }
                else {
                    return err({ message: expectedGot('an array', json) });
                }
            });
        };
        Decoder.tuple = function (decoders) {
            return new Decoder(function (json) {
                if (isJsonArray(json)) {
                    if (json.length !== decoders.length) {
                        return err({
                            message: "expected a tuple of length " + decoders.length + ", got one of length " + json.length
                        });
                    }
                    var result = [];
                    for (var i = 0; i < decoders.length; i++) {
                        var nth = decoders[i].decode(json[i]);
                        if (nth.ok) {
                            result[i] = nth.result;
                        }
                        else {
                            return err(prependAt("[" + i + "]", nth.error));
                        }
                    }
                    return ok(result);
                }
                else {
                    return err({ message: expectedGot("a tuple of length " + decoders.length, json) });
                }
            });
        };
        Decoder.union = function (ad, bd) {
            var decoders = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                decoders[_i - 2] = arguments[_i];
            }
            return Decoder.oneOf.apply(Decoder, [ad, bd].concat(decoders));
        };
        Decoder.intersection = function (ad, bd) {
            var ds = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                ds[_i - 2] = arguments[_i];
            }
            return new Decoder(function (json) {
                return [ad, bd].concat(ds).reduce(function (acc, decoder) { return map2(Object.assign, acc, decoder.decode(json)); }, ok({}));
            });
        };
        /**
         * Escape hatch to bypass validation. Always succeeds and types the result as
         * `any`. Useful for defining decoders incrementally, particularly for
         * complex objects.
         *
         * Example:
         * ```
         * interface User {
         *   name: string;
         *   complexUserData: ComplexType;
         * }
         *
         * const userDecoder: Decoder<User> = object({
         *   name: string(),
         *   complexUserData: anyJson()
         * });
         * ```
         */
        Decoder.anyJson = function () { return new Decoder(function (json) { return ok(json); }); };
        /**
         * Decoder identity function which always succeeds and types the result as
         * `unknown`.
         */
        Decoder.unknownJson = function () {
            return new Decoder(function (json) { return ok(json); });
        };
        /**
         * Decoder for json objects where the keys are unknown strings, but the values
         * should all be of the same type.
         *
         * Example:
         * ```
         * dict(number()).run({chocolate: 12, vanilla: 10, mint: 37});
         * // => {ok: true, result: {chocolate: 12, vanilla: 10, mint: 37}}
         * ```
         */
        Decoder.dict = function (decoder) {
            return new Decoder(function (json) {
                if (isJsonObject(json)) {
                    var obj = {};
                    for (var key in json) {
                        if (json.hasOwnProperty(key)) {
                            var r = decoder.decode(json[key]);
                            if (r.ok === true) {
                                obj[key] = r.result;
                            }
                            else {
                                return err(prependAt("." + key, r.error));
                            }
                        }
                    }
                    return ok(obj);
                }
                else {
                    return err({ message: expectedGot('an object', json) });
                }
            });
        };
        /**
         * Decoder for values that may be `undefined`. This is primarily helpful for
         * decoding interfaces with optional fields.
         *
         * Example:
         * ```
         * interface User {
         *   id: number;
         *   isOwner?: boolean;
         * }
         *
         * const decoder: Decoder<User> = object({
         *   id: number(),
         *   isOwner: optional(boolean())
         * });
         * ```
         */
        Decoder.optional = function (decoder) {
            return new Decoder(function (json) { return (json === undefined || json === null ? ok(undefined) : decoder.decode(json)); });
        };
        /**
         * Decoder that attempts to run each decoder in `decoders` and either succeeds
         * with the first successful decoder, or fails after all decoders have failed.
         *
         * Note that `oneOf` expects the decoders to all have the same return type,
         * while `union` creates a decoder for the union type of all the input
         * decoders.
         *
         * Examples:
         * ```
         * oneOf(string(), number().map(String))
         * oneOf(constant('start'), constant('stop'), succeed('unknown'))
         * ```
         */
        Decoder.oneOf = function () {
            var decoders = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                decoders[_i] = arguments[_i];
            }
            return new Decoder(function (json) {
                var errors = [];
                for (var i = 0; i < decoders.length; i++) {
                    var r = decoders[i].decode(json);
                    if (r.ok === true) {
                        return r;
                    }
                    else {
                        errors[i] = r.error;
                    }
                }
                var errorsList = errors
                    .map(function (error) { return "at error" + (error.at || '') + ": " + error.message; })
                    .join('", "');
                return err({
                    message: "expected a value matching one of the decoders, got the errors [\"" + errorsList + "\"]"
                });
            });
        };
        /**
         * Decoder that always succeeds with either the decoded value, or a fallback
         * default value.
         */
        Decoder.withDefault = function (defaultValue, decoder) {
            return new Decoder(function (json) {
                return ok(withDefault(defaultValue, decoder.decode(json)));
            });
        };
        /**
         * Decoder that pulls a specific field out of a json structure, instead of
         * decoding and returning the full structure. The `paths` array describes the
         * object keys and array indices to traverse, so that values can be pulled out
         * of a nested structure.
         *
         * Example:
         * ```
         * const decoder = valueAt(['a', 'b', 0], string());
         *
         * decoder.run({a: {b: ['surprise!']}})
         * // => {ok: true, result: 'surprise!'}
         *
         * decoder.run({a: {x: 'cats'}})
         * // => {ok: false, error: {... at: 'input.a.b[0]' message: 'path does not exist'}}
         * ```
         *
         * Note that the `decoder` is ran on the value found at the last key in the
         * path, even if the last key is not found. This allows the `optional`
         * decoder to succeed when appropriate.
         * ```
         * const optionalDecoder = valueAt(['a', 'b', 'c'], optional(string()));
         *
         * optionalDecoder.run({a: {b: {c: 'surprise!'}}})
         * // => {ok: true, result: 'surprise!'}
         *
         * optionalDecoder.run({a: {b: 'cats'}})
         * // => {ok: false, error: {... at: 'input.a.b.c' message: 'expected an object, got "cats"'}
         *
         * optionalDecoder.run({a: {b: {z: 1}}})
         * // => {ok: true, result: undefined}
         * ```
         */
        Decoder.valueAt = function (paths, decoder) {
            return new Decoder(function (json) {
                var jsonAtPath = json;
                for (var i = 0; i < paths.length; i++) {
                    if (jsonAtPath === undefined) {
                        return err({
                            at: printPath(paths.slice(0, i + 1)),
                            message: 'path does not exist'
                        });
                    }
                    else if (typeof paths[i] === 'string' && !isJsonObject(jsonAtPath)) {
                        return err({
                            at: printPath(paths.slice(0, i + 1)),
                            message: expectedGot('an object', jsonAtPath)
                        });
                    }
                    else if (typeof paths[i] === 'number' && !isJsonArray(jsonAtPath)) {
                        return err({
                            at: printPath(paths.slice(0, i + 1)),
                            message: expectedGot('an array', jsonAtPath)
                        });
                    }
                    else {
                        jsonAtPath = jsonAtPath[paths[i]];
                    }
                }
                return mapError(function (error) {
                    return jsonAtPath === undefined
                        ? { at: printPath(paths), message: 'path does not exist' }
                        : prependAt(printPath(paths), error);
                }, decoder.decode(jsonAtPath));
            });
        };
        /**
         * Decoder that ignores the input json and always succeeds with `fixedValue`.
         */
        Decoder.succeed = function (fixedValue) {
            return new Decoder(function (json) { return ok(fixedValue); });
        };
        /**
         * Decoder that ignores the input json and always fails with `errorMessage`.
         */
        Decoder.fail = function (errorMessage) {
            return new Decoder(function (json) { return err({ message: errorMessage }); });
        };
        /**
         * Decoder that allows for validating recursive data structures. Unlike with
         * functions, decoders assigned to variables can't reference themselves
         * before they are fully defined. We can avoid prematurely referencing the
         * decoder by wrapping it in a function that won't be called until use, at
         * which point the decoder has been defined.
         *
         * Example:
         * ```
         * interface Comment {
         *   msg: string;
         *   replies: Comment[];
         * }
         *
         * const decoder: Decoder<Comment> = object({
         *   msg: string(),
         *   replies: lazy(() => array(decoder))
         * });
         * ```
         */
        Decoder.lazy = function (mkDecoder) {
            return new Decoder(function (json) { return mkDecoder().decode(json); });
        };
        return Decoder;
    }());

    /* tslint:disable:variable-name */
    /** See `Decoder.string` */
    var string = Decoder.string;
    /** See `Decoder.number` */
    var number = Decoder.number;
    /** See `Decoder.boolean` */
    var boolean = Decoder.boolean;
    /** See `Decoder.anyJson` */
    var anyJson = Decoder.anyJson;
    /** See `Decoder.constant` */
    var constant = Decoder.constant;
    /** See `Decoder.object` */
    var object = Decoder.object;
    /** See `Decoder.array` */
    var array = Decoder.array;
    /** See `Decoder.optional` */
    var optional = Decoder.optional;
    /** See `Decoder.oneOf` */
    var oneOf = Decoder.oneOf;
    /** See `Decoder.intersection` */
    var intersection = Decoder.intersection;
    /** See `Decoder.lazy` */
    var lazy = Decoder.lazy;

    const nonEmptyStringDecoder = string().where((s) => s.length > 0, "Expected a non-empty string");
    const nonNegativeNumberDecoder = number().where((num) => num >= 0, "Expected a non-negative number");
    const isWindowInSwimlaneResultDecoder = object({
        inWorkspace: boolean()
    });
    const allParentDecoder = oneOf(constant("workspace"), constant("row"), constant("column"), constant("group"));
    const subParentDecoder = oneOf(constant("row"), constant("column"), constant("group"));
    const frameStateDecoder = oneOf(constant("maximized"), constant("minimized"), constant("normal"));
    const checkThrowCallback = (callback, allowUndefined) => {
        const argumentType = typeof callback;
        if (allowUndefined && argumentType !== "function" && argumentType !== "undefined") {
            throw new Error(`Provided argument must be either undefined or of type function, provided: ${argumentType}`);
        }
        if (!allowUndefined && argumentType !== "function") {
            throw new Error(`Provided argument must be of type function, provided: ${argumentType}`);
        }
    };
    const workspaceBuilderCreateConfigDecoder = optional(object({
        saveLayout: optional(boolean())
    }));
    const deleteLayoutConfigDecoder = object({
        name: nonEmptyStringDecoder
    });
    const swimlaneWindowDefinitionDecoder = object({
        type: optional(constant("window")),
        appName: optional(nonEmptyStringDecoder),
        windowId: optional(nonEmptyStringDecoder),
        context: optional(anyJson())
    });
    const strictSwimlaneWindowDefinitionDecoder = object({
        type: constant("window"),
        appName: optional(nonEmptyStringDecoder),
        windowId: optional(nonEmptyStringDecoder),
        context: optional(anyJson())
    });
    const parentDefinitionDecoder = optional(object({
        type: optional(subParentDecoder),
        children: optional(lazy(() => array(oneOf(swimlaneWindowDefinitionDecoder, parentDefinitionDecoder))))
    }));
    const strictParentDefinitionDecoder = object({
        type: subParentDecoder,
        children: optional(lazy(() => array(oneOf(strictSwimlaneWindowDefinitionDecoder, strictParentDefinitionDecoder))))
    });
    const stateDecoder = oneOf(string().where((s) => s.toLowerCase() === "maximized", "Expected a case insensitive variation of 'maximized'"), string().where((s) => s.toLowerCase() === "normal", "Expected a case insensitive variation of 'normal'"));
    const newFrameConfigDecoder = object({
        bounds: optional(object({
            left: optional(number()),
            top: optional(number()),
            width: optional(nonNegativeNumberDecoder),
            height: optional(nonNegativeNumberDecoder)
        }))
    });
    const restoreTypeDecoder = oneOf(constant("direct"), constant("delayed"), constant("lazy"));
    const restoreWorkspaceConfigDecoder = optional(object({
        app: optional(nonEmptyStringDecoder),
        context: optional(anyJson()),
        restoreType: optional(restoreTypeDecoder),
        title: optional(nonEmptyStringDecoder),
        reuseWorkspaceId: optional(nonEmptyStringDecoder),
        frameId: optional(nonEmptyStringDecoder),
        lockdown: optional(boolean()),
        activateFrame: optional(boolean()),
        newFrame: optional(oneOf(newFrameConfigDecoder, boolean())),
        noTabHeader: optional(boolean()),
        inMemoryLayout: optional(boolean())
    }));
    const openWorkspaceConfigDecoder = object({
        name: nonEmptyStringDecoder,
        restoreOptions: optional(restoreWorkspaceConfigDecoder)
    });
    const workspaceDefinitionDecoder = object({
        children: optional(array(oneOf(swimlaneWindowDefinitionDecoder, parentDefinitionDecoder))),
        context: optional(anyJson()),
        config: optional(object({
            title: optional(nonEmptyStringDecoder),
            position: optional(nonNegativeNumberDecoder),
            isFocused: optional(boolean()),
            noTabHeader: optional(boolean())
        })),
        frame: optional(object({
            reuseFrameId: optional(nonEmptyStringDecoder),
            newFrame: optional(oneOf(boolean(), newFrameConfigDecoder))
        }))
    });
    const builderConfigDecoder = object({
        type: allParentDecoder,
        definition: optional(oneOf(workspaceDefinitionDecoder, parentDefinitionDecoder))
    });
    const workspaceCreateConfigDecoder = intersection(workspaceDefinitionDecoder, object({
        saveConfig: optional(object({
            saveLayout: optional(boolean())
        }))
    }));
    const getFrameSummaryConfigDecoder = object({
        itemId: nonEmptyStringDecoder
    });
    const frameSummaryDecoder = object({
        id: nonEmptyStringDecoder
    });
    const workspaceSummaryDecoder = object({
        id: nonEmptyStringDecoder,
        frameId: nonEmptyStringDecoder,
        positionIndex: number(),
        title: nonEmptyStringDecoder,
        focused: boolean(),
        layoutName: optional(nonEmptyStringDecoder)
    });
    const containerSummaryDecoder = object({
        type: subParentDecoder,
        id: nonEmptyStringDecoder,
        frameId: nonEmptyStringDecoder,
        workspaceId: nonEmptyStringDecoder,
        positionIndex: number()
    });
    const eventTypeDecoder = oneOf(constant("frame"), constant("workspace"), constant("container"), constant("window"));
    const streamRequestArgumentsDecoder = object({
        type: eventTypeDecoder,
        branch: nonEmptyStringDecoder
    });
    const workspaceEventActionDecoder = oneOf(constant("opened"), constant("closing"), constant("closed"), constant("focus"), constant("added"), constant("loaded"), constant("removed"), constant("childrenUpdate"), constant("containerChange"), constant("maximized"), constant("minimized"), constant("normal"), constant("selected"));
    const workspaceConfigResultDecoder = object({
        frameId: nonEmptyStringDecoder,
        title: nonEmptyStringDecoder,
        positionIndex: nonNegativeNumberDecoder,
        name: nonEmptyStringDecoder,
        layoutName: optional(nonEmptyStringDecoder)
    });
    const baseChildSnapshotConfigDecoder = object({
        frameId: nonEmptyStringDecoder,
        workspaceId: nonEmptyStringDecoder,
        positionIndex: number()
    });
    const parentSnapshotConfigDecoder = anyJson();
    const swimlaneWindowSnapshotConfigDecoder = intersection(baseChildSnapshotConfigDecoder, object({
        windowId: optional(nonEmptyStringDecoder),
        isMaximized: optional(boolean()),
        isFocused: boolean(),
        title: optional(string()),
        appName: optional(nonEmptyStringDecoder)
    }));
    const childSnapshotResultDecoder = object({
        id: nonEmptyStringDecoder,
        config: oneOf(parentSnapshotConfigDecoder, swimlaneWindowSnapshotConfigDecoder),
        children: optional(lazy(() => array(childSnapshotResultDecoder))),
        type: oneOf(constant("window"), constant("row"), constant("column"), constant("group"))
    });
    const workspaceSnapshotResultDecoder = object({
        id: nonEmptyStringDecoder,
        config: workspaceConfigResultDecoder,
        children: array(childSnapshotResultDecoder),
        frameSummary: frameSummaryDecoder
    });
    const customWorkspaceChildSnapshotDecoder = object({
        id: optional(nonEmptyStringDecoder),
        config: oneOf(parentSnapshotConfigDecoder, swimlaneWindowSnapshotConfigDecoder),
        children: optional(lazy(() => array(customWorkspaceChildSnapshotDecoder))),
        type: oneOf(constant("window"), constant("row"), constant("column"), constant("group"))
    });
    const windowLayoutItemDecoder = object({
        type: constant("window"),
        config: object({
            appName: nonEmptyStringDecoder,
            url: optional(nonEmptyStringDecoder)
        })
    });
    const groupLayoutItemDecoder = object({
        type: constant("group"),
        config: anyJson(),
        children: array(oneOf(windowLayoutItemDecoder))
    });
    const columnLayoutItemDecoder = object({
        type: constant("column"),
        config: anyJson(),
        children: array(oneOf(groupLayoutItemDecoder, windowLayoutItemDecoder, lazy(() => columnLayoutItemDecoder), lazy(() => rowLayoutItemDecoder)))
    });
    const rowLayoutItemDecoder = object({
        type: constant("row"),
        config: anyJson(),
        children: array(oneOf(columnLayoutItemDecoder, groupLayoutItemDecoder, windowLayoutItemDecoder, lazy(() => rowLayoutItemDecoder)))
    });
    const workspaceLayoutDecoder = object({
        name: nonEmptyStringDecoder,
        type: constant("Workspace"),
        metadata: optional(anyJson()),
        components: array(object({
            type: constant("Workspace"),
            state: object({
                config: anyJson(),
                context: anyJson(),
                children: array(oneOf(rowLayoutItemDecoder, columnLayoutItemDecoder, groupLayoutItemDecoder, windowLayoutItemDecoder))
            })
        }))
    });
    const workspacesImportLayoutDecoder = object({
        layout: workspaceLayoutDecoder,
        mode: oneOf(constant("replace"), constant("merge"))
    });
    const exportedLayoutsResultDecoder = object({
        layouts: array(workspaceLayoutDecoder)
    });
    const frameSummaryResultDecoder = object({
        id: nonEmptyStringDecoder,
    });
    const frameSummariesResultDecoder = object({
        summaries: array(frameSummaryResultDecoder)
    });
    const workspaceSummaryResultDecoder = object({
        id: nonEmptyStringDecoder,
        config: workspaceConfigResultDecoder
    });
    const workspaceSummariesResultDecoder = object({
        summaries: array(workspaceSummaryResultDecoder)
    });
    const frameSnapshotResultDecoder = object({
        id: nonEmptyStringDecoder,
        config: anyJson(),
        workspaces: array(workspaceSnapshotResultDecoder)
    });
    const layoutSummaryDecoder = object({
        name: nonEmptyStringDecoder
    });
    const layoutSummariesDecoder = object({
        summaries: array(layoutSummaryDecoder)
    });
    const simpleWindowOperationSuccessResultDecoder = object({
        windowId: nonEmptyStringDecoder
    });
    const voidResultDecoder = anyJson();
    const frameStateResultDecoder = object({
        state: frameStateDecoder
    });
    const resizeConfigDecoder = object({
        width: optional(nonNegativeNumberDecoder),
        height: optional(nonNegativeNumberDecoder),
        relative: optional(boolean())
    });
    const moveConfigDecoder = object({
        top: optional(number()),
        left: optional(number()),
        relative: optional(boolean())
    });
    const simpleItemConfigDecoder = object({
        itemId: nonEmptyStringDecoder
    });
    const frameStateConfigDecoder = object({
        frameId: nonEmptyStringDecoder,
        requestedState: frameStateDecoder
    });
    const setItemTitleConfigDecoder = object({
        itemId: nonEmptyStringDecoder,
        title: nonEmptyStringDecoder
    });
    const moveWindowConfigDecoder = object({
        itemId: nonEmptyStringDecoder,
        containerId: nonEmptyStringDecoder
    });
    const resizeItemConfigDecoder = intersection(simpleItemConfigDecoder, resizeConfigDecoder);
    const moveFrameConfigDecoder = intersection(simpleItemConfigDecoder, moveConfigDecoder);
    const simpleParentDecoder = object({
        id: nonEmptyStringDecoder,
        type: subParentDecoder
    });
    const addWindowConfigDecoder = object({
        definition: swimlaneWindowDefinitionDecoder,
        parentId: nonEmptyStringDecoder,
        parentType: allParentDecoder
    });
    const addContainerConfigDecoder = object({
        definition: strictParentDefinitionDecoder,
        parentId: nonEmptyStringDecoder,
        parentType: allParentDecoder
    });
    const addItemResultDecoder = object({
        itemId: nonEmptyStringDecoder,
        windowId: optional(nonEmptyStringDecoder)
    });
    const pingResultDecoder = object({
        live: boolean()
    });
    const bundleConfigDecoder = object({
        type: oneOf(constant("row"), constant("column")),
        workspaceId: nonEmptyStringDecoder
    });
    const containerSummaryResultDecoder = object({
        itemId: nonEmptyStringDecoder,
        config: parentSnapshotConfigDecoder
    });
    const frameStreamDataDecoder = object({
        frameSummary: frameSummaryDecoder
    });
    const workspaceStreamDataDecoder = object({
        workspaceSummary: workspaceSummaryResultDecoder,
        frameSummary: frameSummaryDecoder
    });
    const containerStreamDataDecoder = object({
        containerSummary: containerSummaryResultDecoder
    });
    const windowStreamDataDecoder = object({
        windowSummary: object({
            itemId: nonEmptyStringDecoder,
            parentId: nonEmptyStringDecoder,
            config: swimlaneWindowSnapshotConfigDecoder
        })
    });
    const workspaceLayoutSaveConfigDecoder = object({
        name: nonEmptyStringDecoder,
        workspaceId: nonEmptyStringDecoder,
        saveContext: optional(boolean())
    });

    const webPlatformMethodName = "T42.Web.Platform.Control";
    const webPlatformWspStreamName = "T42.Web.Platform.WSP.Stream";
    const METHODS = {
        control: { name: "T42.Workspaces.Control", isStream: false },
        frameStream: { name: "T42.Workspaces.Stream.Frame", isStream: true },
        workspaceStream: { name: "T42.Workspaces.Stream.Workspace", isStream: true },
        containerStream: { name: "T42.Workspaces.Stream.Container", isStream: true },
        windowStream: { name: "T42.Workspaces.Stream.Window", isStream: true }
    };
    const STREAMS = {
        frame: { name: "T42.Workspaces.Stream.Frame", payloadDecoder: frameStreamDataDecoder },
        workspace: { name: "T42.Workspaces.Stream.Workspace", payloadDecoder: workspaceStreamDataDecoder },
        container: { name: "T42.Workspaces.Stream.Container", payloadDecoder: containerStreamDataDecoder },
        window: { name: "T42.Workspaces.Stream.Window", payloadDecoder: windowStreamDataDecoder }
    };
    const OPERATIONS = {
        ping: { name: "ping", resultDecoder: pingResultDecoder },
        isWindowInWorkspace: { name: "isWindowInWorkspace", argsDecoder: simpleItemConfigDecoder, resultDecoder: isWindowInSwimlaneResultDecoder },
        createWorkspace: { name: "createWorkspace", resultDecoder: workspaceSnapshotResultDecoder, argsDecoder: workspaceCreateConfigDecoder },
        getAllFramesSummaries: { name: "getAllFramesSummaries", resultDecoder: frameSummariesResultDecoder },
        getFrameSummary: { name: "getFrameSummary", resultDecoder: frameSummaryDecoder, argsDecoder: getFrameSummaryConfigDecoder },
        getAllWorkspacesSummaries: { name: "getAllWorkspacesSummaries", resultDecoder: workspaceSummariesResultDecoder },
        getWorkspaceSnapshot: { name: "getWorkspaceSnapshot", resultDecoder: workspaceSnapshotResultDecoder, argsDecoder: simpleItemConfigDecoder },
        getAllLayoutsSummaries: { name: "getAllLayoutsSummaries", resultDecoder: layoutSummariesDecoder },
        openWorkspace: { name: "openWorkspace", argsDecoder: openWorkspaceConfigDecoder, resultDecoder: workspaceSnapshotResultDecoder },
        deleteLayout: { name: "deleteLayout", resultDecoder: voidResultDecoder, argsDecoder: deleteLayoutConfigDecoder },
        saveLayout: { name: "saveLayout", resultDecoder: workspaceLayoutDecoder, argsDecoder: workspaceLayoutSaveConfigDecoder },
        importLayout: { name: "importLayout", resultDecoder: voidResultDecoder, argsDecoder: workspacesImportLayoutDecoder },
        exportAllLayouts: { name: "exportAllLayouts", resultDecoder: exportedLayoutsResultDecoder },
        restoreItem: { name: "restoreItem", argsDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder },
        maximizeItem: { name: "maximizeItem", argsDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder },
        focusItem: { name: "focusItem", argsDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder },
        closeItem: { name: "closeItem", argsDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder },
        resizeItem: { name: "resizeItem", argsDecoder: resizeItemConfigDecoder, resultDecoder: voidResultDecoder },
        changeFrameState: { name: "changeFrameState", argsDecoder: frameStateConfigDecoder, resultDecoder: voidResultDecoder },
        getFrameState: { name: "getFrameState", argsDecoder: simpleItemConfigDecoder, resultDecoder: frameStateResultDecoder },
        moveFrame: { name: "moveFrame", argsDecoder: moveFrameConfigDecoder, resultDecoder: voidResultDecoder },
        getFrameSnapshot: { name: "getFrameSnapshot", argsDecoder: simpleItemConfigDecoder, resultDecoder: frameSnapshotResultDecoder },
        forceLoadWindow: { name: "forceLoadWindow", argsDecoder: simpleItemConfigDecoder, resultDecoder: simpleWindowOperationSuccessResultDecoder },
        ejectWindow: { name: "ejectWindow", argsDecoder: simpleItemConfigDecoder, resultDecoder: simpleWindowOperationSuccessResultDecoder },
        setItemTitle: { name: "setItemTitle", argsDecoder: setItemTitleConfigDecoder, resultDecoder: voidResultDecoder },
        moveWindowTo: { name: "moveWindowTo", argsDecoder: moveWindowConfigDecoder, resultDecoder: voidResultDecoder },
        addWindow: { name: "addWindow", argsDecoder: addWindowConfigDecoder, resultDecoder: addItemResultDecoder },
        addContainer: { name: "addContainer", argsDecoder: addContainerConfigDecoder, resultDecoder: addItemResultDecoder },
        bundleWorkspace: { name: "bundleWorkspace", argsDecoder: bundleConfigDecoder, resultDecoder: voidResultDecoder }
    };

    class Bridge {
        constructor(transport, registry) {
            this.transport = transport;
            this.registry = registry;
            this.activeSubscriptions = [];
        }
        createCoreEventSubscription() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.transport.coreSubscriptionReady(this.handleCoreEvent.bind(this));
            });
        }
        handleCoreSubscription(config) {
            const registryKey = `${config.eventType}-${config.action}`;
            const scope = config.scope;
            const scopeId = config.scopeId;
            return this.registry.add(registryKey, (args) => {
                var _a, _b, _c, _d, _e;
                const scopeConfig = {
                    type: scope,
                    id: scopeId
                };
                const receivedIds = {
                    frame: ((_a = args.frameSummary) === null || _a === void 0 ? void 0 : _a.id) || ((_b = args.windowSummary) === null || _b === void 0 ? void 0 : _b.config.frameId),
                    workspace: ((_c = args.workspaceSummary) === null || _c === void 0 ? void 0 : _c.id) || ((_d = args.windowSummary) === null || _d === void 0 ? void 0 : _d.config.workspaceId),
                    window: (_e = args.windowSummary) === null || _e === void 0 ? void 0 : _e.config.windowId
                };
                const shouldInvokeCallback = this.checkScopeMatch(scopeConfig, receivedIds);
                if (!shouldInvokeCallback) {
                    return;
                }
                config.callback(args);
            });
        }
        send(operationName, operationArgs) {
            return __awaiter(this, void 0, void 0, function* () {
                const operationDefinition = Object.values(OPERATIONS).find((operation) => operation.name === operationName);
                if (!operationDefinition) {
                    throw new Error(`Cannot find definition for operation name: ${operationName}`);
                }
                if (operationDefinition.argsDecoder) {
                    try {
                        operationDefinition.argsDecoder.runWithException(operationArgs);
                    }
                    catch (error) {
                        throw new Error(`Unexpected internal outgoing validation error: ${error.message}, for input: ${JSON.stringify(error.input)}`);
                    }
                }
                let operationResult;
                try {
                    const operationResultRaw = yield this.transport.transmitControl(operationDefinition.name, operationArgs);
                    operationResult = operationDefinition.resultDecoder.runWithException(operationResultRaw);
                }
                catch (error) {
                    if (error.kind) {
                        throw new Error(`Unexpected internal incoming validation error: ${error.message}, for input: ${JSON.stringify(error.input)}`);
                    }
                    throw new Error(error.message);
                }
                return operationResult;
            });
        }
        subscribe(config) {
            return __awaiter(this, void 0, void 0, function* () {
                let activeSub = this.getActiveSubscription(config);
                const registryKey = this.getRegistryKey(config);
                if (!activeSub) {
                    const stream = STREAMS[config.eventType];
                    const gdSub = yield this.transport.subscribe(stream.name, this.getBranchKey(config), config.eventType);
                    gdSub.onData((streamData) => {
                        const data = streamData.data;
                        const requestedArgumentsResult = streamRequestArgumentsDecoder.run(streamData.requestArguments);
                        const actionResult = workspaceEventActionDecoder.run(data.action);
                        if (!requestedArgumentsResult.ok || !actionResult.ok) {
                            return;
                        }
                        const streamType = requestedArgumentsResult.result.type;
                        const branch = requestedArgumentsResult.result.branch;
                        const validatedPayload = STREAMS[streamType].payloadDecoder.run(data.payload);
                        if (!validatedPayload.ok) {
                            return;
                        }
                        const keyToExecute = `${streamType}-${branch}-${actionResult.result}`;
                        this.registry.execute(keyToExecute, validatedPayload.result);
                    });
                    activeSub = {
                        streamType: config.eventType,
                        level: config.scope,
                        levelId: config.scopeId,
                        callbacksCount: 0,
                        gdSub
                    };
                    this.activeSubscriptions.push(activeSub);
                }
                const unsubscribe = this.registry.add(registryKey, config.callback);
                ++activeSub.callbacksCount;
                return () => {
                    unsubscribe();
                    --activeSub.callbacksCount;
                    if (activeSub.callbacksCount === 0) {
                        activeSub.gdSub.close();
                        this.activeSubscriptions.splice(this.activeSubscriptions.indexOf(activeSub), 1);
                    }
                };
            });
        }
        checkScopeMatch(scope, receivedIds) {
            if (scope.type === "global") {
                return true;
            }
            if (scope.type === "frame" && scope.id === receivedIds.frame) {
                return true;
            }
            if (scope.type === "workspace" && scope.id === receivedIds.workspace) {
                return true;
            }
            if (scope.type === "window" && scope.id === receivedIds.window) {
                return true;
            }
            return false;
        }
        handleCoreEvent(args) {
            const data = args.data;
            try {
                const verifiedAction = workspaceEventActionDecoder.runWithException(data.action);
                const verifiedType = eventTypeDecoder.runWithException(data.type);
                const verifiedPayload = STREAMS[verifiedType].payloadDecoder.runWithException(data.payload);
                const registryKey = `${verifiedType}-${verifiedAction}`;
                this.registry.execute(registryKey, verifiedPayload);
            }
            catch (error) {
                console.warn(`Cannot handle event with data ${JSON.stringify(data)}, because of validation error: ${error.message}`);
            }
        }
        getBranchKey(config) {
            return config.scope === "global" ? config.scope : `${config.scope}_${config.scopeId}`;
        }
        getRegistryKey(config) {
            return `${config.eventType}-${this.getBranchKey(config)}-${config.action}`;
        }
        getActiveSubscription(config) {
            return this.activeSubscriptions
                .find((activeSub) => activeSub.streamType === config.eventType &&
                activeSub.level === config.scope &&
                activeSub.levelId === config.scopeId);
        }
    }

    const promisePlus = (promise, timeoutMilliseconds, timeoutMessage) => {
        return new Promise((resolve, reject) => {
            let promiseActive = true;
            const timeout = setTimeout(() => {
                if (!promiseActive) {
                    return;
                }
                promiseActive = false;
                const message = timeoutMessage || `Promise timeout hit: ${timeoutMilliseconds}`;
                reject(message);
            }, timeoutMilliseconds);
            promise()
                .then((result) => {
                if (!promiseActive) {
                    return;
                }
                promiseActive = false;
                clearTimeout(timeout);
                resolve(result);
            })
                .catch((error) => {
                if (!promiseActive) {
                    return;
                }
                promiseActive = false;
                clearTimeout(timeout);
                reject(error);
            });
        });
    };

    class InteropTransport {
        constructor(agm) {
            this.agm = agm;
            this.defaultTransportTimeout = 30000;
            this.coreEventMethodInitiated = false;
        }
        initiate(actualWindowId) {
            return __awaiter(this, void 0, void 0, function* () {
                if (window.glue42gd) {
                    yield Promise.all(Object.values(METHODS).map((method) => {
                        return this.verifyMethodLive(method.name);
                    }));
                    return;
                }
                yield Promise.all([
                    this.verifyMethodLive(webPlatformMethodName),
                    this.verifyMethodLive(webPlatformWspStreamName)
                ]);
                yield this.transmitControl("frameHello", { windowId: actualWindowId });
            });
        }
        coreSubscriptionReady(eventCallback) {
            if (!this.coreEventMethodInitiated) {
                this.subscribePlatform(eventCallback);
            }
            return this.corePlatformSubPromise;
        }
        subscribePlatform(eventCallback) {
            this.coreEventMethodInitiated = true;
            this.corePlatformSubPromise = this.agm.subscribe(webPlatformWspStreamName);
            this.corePlatformSubPromise
                .then((sub) => {
                sub.onData((data) => eventCallback(data.data));
            });
        }
        subscribe(streamName, streamBranch, streamType) {
            return __awaiter(this, void 0, void 0, function* () {
                const subscriptionArgs = {
                    branch: streamBranch,
                    type: streamType
                };
                let subscription;
                try {
                    subscription = yield this.agm.subscribe(streamName, { arguments: subscriptionArgs });
                }
                catch (error) {
                    const message = `Internal subscription error! Error details: stream - ${streamName}, branch: ${streamBranch}. Internal message: ${error.message}`;
                    throw new Error(message);
                }
                return subscription;
            });
        }
        transmitControl(operation, operationArguments) {
            return __awaiter(this, void 0, void 0, function* () {
                const invocationArguments = window.glue42gd ? { operation, operationArguments } : { operation, domain: "workspaces", data: operationArguments };
                const methodName = window.glue42gd ? METHODS.control.name : webPlatformMethodName;
                let invocationResult;
                const baseErrorMessage = `Internal Workspaces Communication Error. Attempted operation: ${JSON.stringify(invocationArguments)}. `;
                try {
                    invocationResult = yield this.agm.invoke(methodName, invocationArguments, "best", { methodResponseTimeoutMs: this.defaultTransportTimeout });
                    if (!invocationResult) {
                        throw new Error("Received unsupported result from GD - empty result");
                    }
                    if (!Array.isArray(invocationResult.all_return_values) || invocationResult.all_return_values.length === 0) {
                        throw new Error("Received unsupported result from GD - empty values collection");
                    }
                }
                catch (error) {
                    if (error && error.all_errors && error.all_errors.length) {
                        const invocationErrorMessage = error.all_errors[0].message;
                        throw new Error(`${baseErrorMessage} -> Inner message: ${invocationErrorMessage}`);
                    }
                    throw new Error(`${baseErrorMessage} -> Inner message: ${error.message}`);
                }
                return invocationResult.all_return_values[0].returned;
            });
        }
        verifyMethodLive(name) {
            return promisePlus(() => {
                return new Promise((resolve) => {
                    const hasMethod = this.agm.methods().some((method) => method.name === name);
                    if (hasMethod) {
                        resolve();
                        return;
                    }
                    let unsubscribe = this.agm.methodAdded((method) => {
                        if (method.name !== name) {
                            return;
                        }
                        if (unsubscribe) {
                            unsubscribe();
                            unsubscribe = null;
                        }
                        else {
                            setTimeout(() => {
                                if (unsubscribe) {
                                    unsubscribe();
                                }
                            }, 0);
                        }
                        resolve();
                    });
                });
            }, 15000, "Timeout waiting for the Workspaces communication channels");
        }
    }

    const privateData = new WeakMap();
    class ParentBuilder {
        constructor(definition, base) {
            const children = base.wrapChildren(definition.children);
            delete definition.children;
            privateData.set(this, { base, children, definition });
        }
        get type() {
            return privateData.get(this).definition.type;
        }
        addColumn(definition) {
            const base = privateData.get(this).base;
            return base.add("column", privateData.get(this).children, definition);
        }
        addRow(definition) {
            const base = privateData.get(this).base;
            return base.add("row", privateData.get(this).children, definition);
        }
        addGroup(definition) {
            const base = privateData.get(this).base;
            return base.add("group", privateData.get(this).children, definition);
        }
        addWindow(definition) {
            const base = privateData.get(this).base;
            base.addWindow(privateData.get(this).children, definition);
            return this;
        }
        serialize() {
            const definition = privateData.get(this).definition;
            definition.children = privateData.get(this).base.serializeChildren(privateData.get(this).children);
            return definition;
        }
    }

    class BaseBuilder {
        constructor(getBuilder) {
            this.getBuilder = getBuilder;
        }
        wrapChildren(children) {
            return children.map((child) => {
                if (child.type === "window") {
                    return child;
                }
                return this.getBuilder({ type: child.type, definition: child });
            });
        }
        add(type, children, definition) {
            const validatedDefinition = parentDefinitionDecoder.runWithException(definition);
            const childBuilder = this.getBuilder({ type, definition: validatedDefinition });
            children.push(childBuilder);
            return childBuilder;
        }
        addWindow(children, definition) {
            const validatedDefinition = swimlaneWindowDefinitionDecoder.runWithException(definition);
            validatedDefinition.type = "window";
            children.push(validatedDefinition);
        }
        serializeChildren(children) {
            return children.map((child) => {
                if (child instanceof ParentBuilder) {
                    return child.serialize();
                }
                else {
                    return child;
                }
            });
        }
    }

    const privateData$1 = new WeakMap();
    class WorkspaceBuilder {
        constructor(definition, base, controller) {
            const children = base.wrapChildren(definition.children);
            delete definition.children;
            privateData$1.set(this, { base, children, definition, controller });
        }
        addColumn(definition) {
            const children = privateData$1.get(this).children;
            const areAllColumns = children.every((child) => child instanceof ParentBuilder && child.type === "column");
            if (!areAllColumns) {
                throw new Error("Cannot add a column to this workspace, because there are already children of another type");
            }
            const base = privateData$1.get(this).base;
            return base.add("column", children, definition);
        }
        addRow(definition) {
            const children = privateData$1.get(this).children;
            const areAllRows = children.every((child) => child instanceof ParentBuilder && child.type === "row");
            if (!areAllRows) {
                throw new Error("Cannot add a row to this workspace, because there are already children of another type");
            }
            const base = privateData$1.get(this).base;
            return base.add("row", children, definition);
        }
        addGroup(definition) {
            const children = privateData$1.get(this).children;
            if (children.length !== 0) {
                throw new Error("Cannot add a group to this workspace, because there are already defined children.");
            }
            const base = privateData$1.get(this).base;
            return base.add("group", children, definition);
        }
        addWindow(definition) {
            const children = privateData$1.get(this).children;
            if (children.length !== 0) {
                throw new Error("Cannot add a window to this workspace, because there are already defined children.");
            }
            const base = privateData$1.get(this).base;
            base.addWindow(children, definition);
            return this;
        }
        getChildAt(index) {
            nonNegativeNumberDecoder.runWithException(index);
            const data = privateData$1.get(this).children;
            return data[index];
        }
        create(config) {
            return __awaiter(this, void 0, void 0, function* () {
                const saveConfig = workspaceBuilderCreateConfigDecoder.runWithException(config);
                const definition = privateData$1.get(this).definition;
                definition.children = privateData$1.get(this).base.serializeChildren(privateData$1.get(this).children);
                const controller = privateData$1.get(this).controller;
                return controller.createWorkspace(definition, saveConfig);
            });
        }
    }

    const privateData$2 = new WeakMap();
    const getBase = (model) => {
        return privateData$2.get(model).base;
    };
    class Row {
        constructor(base) {
            privateData$2.set(this, { base });
        }
        get type() {
            return "row";
        }
        get id() {
            return getBase(this).getId(this);
        }
        get frameId() {
            return getBase(this).getFrameId(this);
        }
        get workspaceId() {
            return getBase(this).getWorkspaceId(this);
        }
        get positionIndex() {
            return getBase(this).getPositionIndex(this);
        }
        get children() {
            return getBase(this).getAllChildren(this);
        }
        get parent() {
            return getBase(this).getMyParent(this);
        }
        get frame() {
            return getBase(this).getMyFrame(this);
        }
        get workspace() {
            return getBase(this).getMyWorkspace(this);
        }
        addWindow(definition) {
            return getBase(this).addWindow(this, definition, "row");
        }
        addGroup(definition) {
            return __awaiter(this, void 0, void 0, function* () {
                if ((definition === null || definition === void 0 ? void 0 : definition.type) && definition.type !== "group") {
                    throw new Error(`Expected a group definition, but received ${definition.type}`);
                }
                return getBase(this).addParent(this, "group", "row", definition);
            });
        }
        addColumn(definition) {
            return __awaiter(this, void 0, void 0, function* () {
                if ((definition === null || definition === void 0 ? void 0 : definition.type) && definition.type !== "column") {
                    throw new Error(`Expected a column definition, but received ${definition.type}`);
                }
                return getBase(this).addParent(this, "column", "row", definition);
            });
        }
        addRow() {
            return __awaiter(this, void 0, void 0, function* () {
                throw new Error("Adding rows as row children is not supported");
            });
        }
        removeChild(predicate) {
            return getBase(this).removeChild(this, predicate);
        }
        maximize() {
            return getBase(this).maximize(this);
        }
        restore() {
            return getBase(this).restore(this);
        }
        close() {
            return getBase(this).close(this);
        }
    }

    const privateData$3 = new WeakMap();
    const getBase$1 = (model) => {
        return privateData$3.get(model).base;
    };
    class Column {
        constructor(base) {
            privateData$3.set(this, { base });
        }
        get type() {
            return "column";
        }
        get id() {
            return getBase$1(this).getId(this);
        }
        get frameId() {
            return getBase$1(this).getFrameId(this);
        }
        get workspaceId() {
            return getBase$1(this).getWorkspaceId(this);
        }
        get positionIndex() {
            return getBase$1(this).getPositionIndex(this);
        }
        get children() {
            return getBase$1(this).getAllChildren(this);
        }
        get parent() {
            return getBase$1(this).getMyParent(this);
        }
        get frame() {
            return getBase$1(this).getMyFrame(this);
        }
        get workspace() {
            return getBase$1(this).getMyWorkspace(this);
        }
        addWindow(definition) {
            return getBase$1(this).addWindow(this, definition, "column");
        }
        addGroup(definition) {
            return __awaiter(this, void 0, void 0, function* () {
                if ((definition === null || definition === void 0 ? void 0 : definition.type) && definition.type !== "group") {
                    throw new Error(`Expected a group definition, but received ${definition.type}`);
                }
                return getBase$1(this).addParent(this, "group", "column", definition);
            });
        }
        addColumn(definition) {
            return __awaiter(this, void 0, void 0, function* () {
                throw new Error("Adding columns as column children is not supported");
            });
        }
        addRow(definition) {
            return __awaiter(this, void 0, void 0, function* () {
                if ((definition === null || definition === void 0 ? void 0 : definition.type) && definition.type !== "row") {
                    throw new Error(`Expected a row definition, but received ${definition.type}`);
                }
                return getBase$1(this).addParent(this, "row", "column", definition);
            });
        }
        removeChild(predicate) {
            return getBase$1(this).removeChild(this, predicate);
        }
        maximize() {
            return getBase$1(this).maximize(this);
        }
        restore() {
            return getBase$1(this).restore(this);
        }
        close() {
            return getBase$1(this).close(this);
        }
    }

    const privateData$4 = new WeakMap();
    const getBase$2 = (model) => {
        return privateData$4.get(model).base;
    };
    class Group {
        constructor(base) {
            privateData$4.set(this, { base });
        }
        get type() {
            return "group";
        }
        get id() {
            return getBase$2(this).getId(this);
        }
        get frameId() {
            return getBase$2(this).getFrameId(this);
        }
        get workspaceId() {
            return getBase$2(this).getWorkspaceId(this);
        }
        get positionIndex() {
            return getBase$2(this).getPositionIndex(this);
        }
        get children() {
            return getBase$2(this).getAllChildren(this);
        }
        get parent() {
            return getBase$2(this).getMyParent(this);
        }
        get frame() {
            return getBase$2(this).getMyFrame(this);
        }
        get workspace() {
            return getBase$2(this).getMyWorkspace(this);
        }
        addWindow(definition) {
            return getBase$2(this).addWindow(this, definition, "group");
        }
        addGroup() {
            return __awaiter(this, void 0, void 0, function* () {
                throw new Error("Adding groups as group child is not supported");
            });
        }
        addColumn() {
            return __awaiter(this, void 0, void 0, function* () {
                throw new Error("Adding columns as group child is not supported");
            });
        }
        addRow() {
            return __awaiter(this, void 0, void 0, function* () {
                throw new Error("Adding rows as group child is not supported");
            });
        }
        removeChild(predicate) {
            return getBase$2(this).removeChild(this, predicate);
        }
        maximize() {
            return getBase$2(this).maximize(this);
        }
        restore() {
            return getBase$2(this).restore(this);
        }
        close() {
            return getBase$2(this).close(this);
        }
    }

    const data = new WeakMap();
    const getData = (model) => {
        return data.get(model).manager.getWorkspaceData(model);
    };
    const getDataManager = (model) => {
        return data.get(model).manager;
    };
    class Workspace {
        constructor(dataManager) {
            data.set(this, { manager: dataManager });
        }
        get id() {
            return getData(this).id;
        }
        get frameId() {
            return getData(this).config.frameId;
        }
        get positionIndex() {
            return getData(this).config.positionIndex;
        }
        get title() {
            return getData(this).config.title;
        }
        get layoutName() {
            return getData(this).config.layoutName;
        }
        get children() {
            return getData(this).children;
        }
        get frame() {
            return getData(this).frame;
        }
        removeChild(predicate) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(predicate);
                const child = this.children.find(predicate);
                if (!child) {
                    return;
                }
                yield child.close();
                yield this.refreshReference();
            });
        }
        remove(predicate) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(predicate);
                const controller = getData(this).controller;
                const child = controller.iterateFindChild(this.children, predicate);
                yield child.close();
                yield this.refreshReference();
            });
        }
        focus() {
            return __awaiter(this, void 0, void 0, function* () {
                yield getData(this).controller.focusItem(this.id);
                yield this.refreshReference();
            });
        }
        close() {
            return __awaiter(this, void 0, void 0, function* () {
                const controller = getData(this).controller;
                const workspaces = yield getData(this).frame.workspaces();
                const shouldCloseFrame = workspaces.length === 1 && workspaces.every((wsp) => wsp.id === this.id);
                if (shouldCloseFrame) {
                    return this.frame.close();
                }
                yield controller.closeItem(this.id);
            });
        }
        snapshot() {
            return getData(this).controller.getSnapshot(this.id, "workspace");
        }
        saveLayout(name, config) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(name);
                yield getData(this).controller.saveLayout({ name, workspaceId: this.id, saveContext: config === null || config === void 0 ? void 0 : config.saveContext });
            });
        }
        setTitle(title) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(title);
                const controller = getData(this).controller;
                yield controller.setItemTitle(this.id, title);
                yield this.refreshReference();
            });
        }
        getContext() {
            const controller = getData(this).controller;
            return controller.getWorkspaceContext(this.id);
        }
        setContext(data) {
            const controller = getData(this).controller;
            return controller.setWorkspaceContext(this.id, data);
        }
        updateContext(data) {
            const controller = getData(this).controller;
            return controller.updateWorkspaceContext(this.id, data);
        }
        onContextUpdated(callback) {
            const controller = getData(this).controller;
            return controller.subscribeWorkspaceContextUpdated(this.id, callback);
        }
        refreshReference() {
            return __awaiter(this, void 0, void 0, function* () {
                const newSnapshot = (yield getData(this).controller.getSnapshot(this.id, "workspace"));
                const existingChildren = newSnapshot.children.reduce((foundChildren, child) => {
                    let foundChild;
                    if (child.type === "window") {
                        foundChild = this.getWindow((swimlaneWindow) => swimlaneWindow.id === child.id);
                    }
                    else {
                        foundChild = this.getBox((parent) => parent.id === child.id);
                    }
                    if (foundChild) {
                        foundChildren.push(foundChild);
                    }
                    return foundChildren;
                }, []);
                const newChildren = getData(this).controller.refreshChildren({
                    existingChildren,
                    workspace: this,
                    parent: this,
                    children: newSnapshot.children
                });
                const currentFrame = this.frame;
                let actualFrame;
                if (currentFrame.id === newSnapshot.config.frameId) {
                    getDataManager(this).remapFrame(currentFrame, newSnapshot.frameSummary);
                    actualFrame = currentFrame;
                }
                else {
                    const frameCreateConfig = {
                        summary: newSnapshot.frameSummary
                    };
                    const newFrame = getData(this).ioc.getModel("frame", frameCreateConfig);
                    actualFrame = newFrame;
                }
                getDataManager(this).remapWorkspace(this, {
                    config: newSnapshot.config,
                    children: newChildren,
                    frame: actualFrame
                });
            });
        }
        getBox(predicate) {
            checkThrowCallback(predicate);
            const children = getData(this).children;
            const controller = getData(this).controller;
            return controller.iterateFindChild(children, (child) => child.type !== "window" && predicate(child));
        }
        getAllBoxes(predicate) {
            checkThrowCallback(predicate, true);
            const children = getData(this).children;
            const controller = getData(this).controller;
            const allParents = controller.iterateFilterChildren(children, (child) => child.type !== "window");
            if (!predicate) {
                return allParents;
            }
            return allParents.filter(predicate);
        }
        getRow(predicate) {
            checkThrowCallback(predicate);
            return this.getBox((parent) => parent.type === "row" && predicate(parent));
        }
        getAllRows(predicate) {
            checkThrowCallback(predicate, true);
            if (predicate) {
                return this.getAllBoxes((parent) => parent.type === "row" && predicate(parent));
            }
            return this.getAllBoxes((parent) => parent.type === "row");
        }
        getColumn(predicate) {
            checkThrowCallback(predicate);
            return this.getBox((parent) => parent.type === "column" && predicate(parent));
        }
        getAllColumns(predicate) {
            checkThrowCallback(predicate, true);
            if (predicate) {
                return this.getAllBoxes((parent) => parent.type === "column" && predicate(parent));
            }
            return this.getAllBoxes((parent) => parent.type === "column");
        }
        getGroup(predicate) {
            checkThrowCallback(predicate);
            return this.getBox((parent) => parent.type === "group" && predicate(parent));
        }
        getAllGroups(predicate) {
            checkThrowCallback(predicate, true);
            if (predicate) {
                return this.getAllBoxes((parent) => parent.type === "group" && predicate(parent));
            }
            return this.getAllBoxes((parent) => parent.type === "group");
        }
        getWindow(predicate) {
            checkThrowCallback(predicate);
            const children = getData(this).children;
            const controller = getData(this).controller;
            return controller.iterateFindChild(children, (child) => child.type === "window" && predicate(child));
        }
        getAllWindows(predicate) {
            checkThrowCallback(predicate, true);
            const children = getData(this).children;
            const controller = getData(this).controller;
            const allWindows = controller.iterateFilterChildren(children, (child) => child.type === "window");
            if (!predicate) {
                return allWindows;
            }
            return allWindows.filter(predicate);
        }
        addRow(definition) {
            return getData(this).base.addParent(this, "row", "workspace", definition);
        }
        addColumn(definition) {
            return getData(this).base.addParent(this, "column", "workspace", definition);
        }
        addGroup(definition) {
            return getData(this).base.addParent(this, "group", "workspace", definition);
        }
        addWindow(definition) {
            return getData(this).base.addWindow(this, definition, "workspace");
        }
        bundleToRow() {
            return __awaiter(this, void 0, void 0, function* () {
                yield getData(this).controller.bundleTo("row", this.id);
                yield this.refreshReference();
            });
        }
        bundleToColumn() {
            return __awaiter(this, void 0, void 0, function* () {
                yield getData(this).controller.bundleTo("column", this.id);
                yield this.refreshReference();
            });
        }
        onClosed(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const id = getData(this).id;
                const wrappedCallback = () => __awaiter(this, void 0, void 0, function* () {
                    callback();
                });
                const config = {
                    action: "closed",
                    eventType: "workspace",
                    scope: "workspace",
                    scopeId: id,
                    callback: wrappedCallback
                };
                const unsubscribe = yield getData(this).controller.processLocalSubscription(config, id);
                return unsubscribe;
            });
        }
        onWindowAdded(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const id = getData(this).id;
                const wrappedCallback = (payload) => __awaiter(this, void 0, void 0, function* () {
                    yield this.refreshReference();
                    const windowParent = this.getBox((parent) => parent.id === payload.windowSummary.parentId);
                    const foundWindow = windowParent.children.find((child) => {
                        return child.type === "window" && child.positionIndex === payload.windowSummary.config.positionIndex;
                    });
                    callback(foundWindow);
                });
                const config = {
                    action: "added",
                    eventType: "window",
                    scope: "workspace",
                    scopeId: id,
                    callback: wrappedCallback
                };
                const unsubscribe = yield getData(this).controller.processLocalSubscription(config, id);
                return unsubscribe;
            });
        }
        onWindowRemoved(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const id = getData(this).id;
                const wrappedCallback = (payload) => __awaiter(this, void 0, void 0, function* () {
                    yield this.refreshReference();
                    const { windowId, workspaceId, frameId } = payload.windowSummary.config;
                    callback({ windowId, workspaceId, frameId });
                });
                const config = {
                    action: "removed",
                    eventType: "window",
                    scope: "workspace",
                    scopeId: id,
                    callback: wrappedCallback
                };
                const unsubscribe = yield getData(this).controller.processLocalSubscription(config, id);
                return unsubscribe;
            });
        }
        onWindowLoaded(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const id = getData(this).id;
                const wrappedCallback = (payload) => __awaiter(this, void 0, void 0, function* () {
                    yield this.refreshReference();
                    const foundWindow = this.getWindow((win) => {
                        return win.id && win.id === payload.windowSummary.config.windowId;
                    });
                    callback(foundWindow);
                });
                const config = {
                    action: "loaded",
                    eventType: "window",
                    scope: "workspace",
                    scopeId: id,
                    callback: wrappedCallback
                };
                const unsubscribe = yield getData(this).controller.processLocalSubscription(config, id);
                return unsubscribe;
            });
        }
    }

    const data$1 = new WeakMap();
    const getData$1 = (model) => {
        return data$1.get(model).manager.getWindowData(model);
    };
    class Window {
        constructor(dataManager) {
            data$1.set(this, { manager: dataManager });
        }
        get id() {
            return getData$1(this).config.windowId;
        }
        get type() {
            return "window";
        }
        get frameId() {
            return getData$1(this).frame.id;
        }
        get workspaceId() {
            return getData$1(this).workspace.id;
        }
        get positionIndex() {
            return getData$1(this).config.positionIndex;
        }
        get isMaximized() {
            return getData$1(this).config.isMaximized;
        }
        get isLoaded() {
            return getData$1(this).controller.checkIsWindowLoaded(this.id);
        }
        get focused() {
            return getData$1(this).config.isFocused;
        }
        get title() {
            return getData$1(this).config.title;
        }
        get workspace() {
            return getData$1(this).workspace;
        }
        get frame() {
            return getData$1(this).frame;
        }
        get parent() {
            return getData$1(this).parent;
        }
        get appName() {
            return getData$1(this).config.appName;
        }
        forceLoad() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isLoaded) {
                    return;
                }
                const controller = getData$1(this).controller;
                const itemId = getData$1(this).id;
                const windowId = yield controller.forceLoadWindow(itemId);
                getData$1(this).config.windowId = windowId;
            });
        }
        focus() {
            return __awaiter(this, void 0, void 0, function* () {
                const id = getData$1(this).id;
                const controller = getData$1(this).controller;
                yield controller.focusItem(id);
            });
        }
        close() {
            return __awaiter(this, void 0, void 0, function* () {
                const id = getData$1(this).id;
                const controller = getData$1(this).controller;
                yield controller.closeItem(id);
                yield getData$1(this)
                    .parent
                    .removeChild((child) => child.id === id);
            });
        }
        setTitle(title) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(title);
                const itemId = getData$1(this).id;
                const controller = getData$1(this).controller;
                yield controller.setItemTitle(itemId, title);
            });
        }
        maximize() {
            return __awaiter(this, void 0, void 0, function* () {
                const id = getData$1(this).id;
                const controller = getData$1(this).controller;
                yield controller.maximizeItem(id);
            });
        }
        restore() {
            return __awaiter(this, void 0, void 0, function* () {
                const id = getData$1(this).id;
                const controller = getData$1(this).controller;
                yield controller.restoreItem(id);
            });
        }
        eject() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.isLoaded) {
                    throw new Error("Cannot eject this window, because it is not loaded yet");
                }
                const itemId = getData$1(this).id;
                const newWindowId = yield getData$1(this).controller.ejectWindow(itemId);
                getData$1(this).config.windowId = newWindowId;
                return this.getGdWindow();
            });
        }
        getGdWindow() {
            if (!this.isLoaded) {
                throw new Error("Cannot fetch this GD window, because the window is not yet loaded");
            }
            const myId = getData$1(this).config.windowId;
            const controller = getData$1(this).controller;
            return controller.getGDWindow(myId);
        }
        moveTo(parent) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!(parent instanceof Row || parent instanceof Column || parent instanceof Group)) {
                    throw new Error("Cannot add to the provided parent, because the provided parent is not an instance of Row, Column or Group");
                }
                const myId = getData$1(this).id;
                const controller = getData$1(this).controller;
                const foundParent = yield controller.getParent((p) => p.id === parent.id);
                if (!foundParent) {
                    throw new Error("Cannot move the window to the selected parent, because this parent does not exist.");
                }
                return controller.moveWindowTo(myId, parent.id);
            });
        }
        onRemoved(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const id = getData$1(this).id;
                const wrappedCallback = () => __awaiter(this, void 0, void 0, function* () {
                    yield this.workspace.refreshReference();
                    callback();
                });
                const config = {
                    callback: wrappedCallback,
                    action: "removed",
                    eventType: "window",
                    scope: "window"
                };
                const unsubscribe = yield getData$1(this).controller.processLocalSubscription(config, id);
                return unsubscribe;
            });
        }
    }

    const data$2 = new WeakMap();
    const getData$2 = (model) => {
        return data$2.get(model).manager.getFrameData(model);
    };
    class Frame {
        constructor(dataManager) {
            data$2.set(this, { manager: dataManager });
        }
        get id() {
            return getData$2(this).summary.id;
        }
        resize(config) {
            const validatedConfig = resizeConfigDecoder.runWithException(config);
            const myId = getData$2(this).summary.id;
            return getData$2(this).controller.resizeItem(myId, validatedConfig);
        }
        move(config) {
            const validatedConfig = moveConfigDecoder.runWithException(config);
            const myId = getData$2(this).summary.id;
            return getData$2(this).controller.moveFrame(myId, validatedConfig);
        }
        focus() {
            const myId = getData$2(this).summary.id;
            return getData$2(this).controller.focusItem(myId);
        }
        state() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!window.glue42gd) {
                    throw new Error("State operations are not supported in Glue42 Core");
                }
                const myId = getData$2(this).summary.id;
                return getData$2(this).controller.getFrameState(myId);
            });
        }
        minimize() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!window.glue42gd) {
                    throw new Error("State operations are not supported in Glue42 Core");
                }
                const myId = getData$2(this).summary.id;
                return getData$2(this).controller.changeFrameState(myId, "minimized");
            });
        }
        maximize() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!window.glue42gd) {
                    throw new Error("State operations are not supported in Glue42 Core");
                }
                const myId = getData$2(this).summary.id;
                return getData$2(this).controller.changeFrameState(myId, "maximized");
            });
        }
        restore() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!window.glue42gd) {
                    throw new Error("State operations are not supported in Glue42 Core");
                }
                const myId = getData$2(this).summary.id;
                return getData$2(this).controller.changeFrameState(myId, "normal");
            });
        }
        close() {
            const myId = getData$2(this).summary.id;
            return getData$2(this).controller.closeItem(myId);
        }
        snapshot() {
            const myId = getData$2(this).summary.id;
            return getData$2(this).controller.getSnapshot(myId, "frame");
        }
        workspaces() {
            return __awaiter(this, void 0, void 0, function* () {
                const controller = getData$2(this).controller;
                return controller.getWorkspaces((wsp) => wsp.frameId === this.id);
            });
        }
        restoreWorkspace(name, options) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(name);
                const validatedOptions = restoreWorkspaceConfigDecoder.runWithException(options);
                return getData$2(this).controller.restoreWorkspace(name, validatedOptions);
            });
        }
        createWorkspace(definition, config) {
            const validatedDefinition = workspaceDefinitionDecoder.runWithException(definition);
            const validatedConfig = workspaceBuilderCreateConfigDecoder.runWithException(config);
            return getData$2(this).controller.createWorkspace(validatedDefinition, validatedConfig);
        }
        onClosed(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const myId = getData$2(this).summary.id;
                const wrappedCallback = (payload) => {
                    callback({ frameId: payload.frameSummary.id });
                };
                const config = {
                    callback: wrappedCallback,
                    action: "closed",
                    eventType: "frame",
                    scope: "frame"
                };
                const unsubscribe = yield getData$2(this).controller.processLocalSubscription(config, myId);
                return unsubscribe;
            });
        }
        onMaximized(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const myId = getData$2(this).summary.id;
                const wrappedCallback = () => {
                    callback();
                };
                const config = {
                    callback: wrappedCallback,
                    action: "maximized",
                    eventType: "frame",
                    scope: "frame"
                };
                const unsubscribe = yield getData$2(this).controller.processLocalSubscription(config, myId);
                return unsubscribe;
            });
        }
        onMinimized(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const myId = getData$2(this).summary.id;
                const wrappedCallback = () => {
                    callback();
                };
                const config = {
                    callback: wrappedCallback,
                    action: "minimized",
                    eventType: "frame",
                    scope: "frame"
                };
                const unsubscribe = yield getData$2(this).controller.processLocalSubscription(config, myId);
                return unsubscribe;
            });
        }
        onNormal(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const myId = getData$2(this).summary.id;
                const wrappedCallback = () => {
                    callback();
                };
                const config = {
                    callback: wrappedCallback,
                    action: "normal",
                    eventType: "frame",
                    scope: "frame"
                };
                const unsubscribe = yield getData$2(this).controller.processLocalSubscription(config, myId);
                return unsubscribe;
            });
        }
        onWorkspaceOpened(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const myId = getData$2(this).summary.id;
                const wrappedCallback = (payload) => __awaiter(this, void 0, void 0, function* () {
                    const workspace = yield getData$2(this).controller.getWorkspace((wsp) => wsp.id === payload.workspaceSummary.id);
                    callback(workspace);
                });
                const config = {
                    callback: wrappedCallback,
                    action: "opened",
                    eventType: "workspace",
                    scope: "frame"
                };
                const unsubscribe = yield getData$2(this).controller.processLocalSubscription(config, myId);
                return unsubscribe;
            });
        }
        onWorkspaceSelected(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const myId = getData$2(this).summary.id;
                const wrappedCallback = (payload) => __awaiter(this, void 0, void 0, function* () {
                    const workspace = yield getData$2(this).controller.getWorkspace((wsp) => wsp.id === payload.workspaceSummary.id);
                    callback(workspace);
                });
                const config = {
                    callback: wrappedCallback,
                    action: "selected",
                    eventType: "workspace",
                    scope: "frame"
                };
                const unsubscribe = yield getData$2(this).controller.processLocalSubscription(config, myId);
                return unsubscribe;
            });
        }
        onWorkspaceClosed(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const myId = getData$2(this).summary.id;
                const wrappedCallback = (payload) => {
                    callback({ frameId: payload.frameSummary.id, workspaceId: payload.workspaceSummary.id });
                };
                const config = {
                    callback: wrappedCallback,
                    action: "closed",
                    eventType: "workspace",
                    scope: "frame"
                };
                const unsubscribe = yield getData$2(this).controller.processLocalSubscription(config, myId);
                return unsubscribe;
            });
        }
        onWindowAdded(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const myId = getData$2(this).summary.id;
                const wrappedCallback = (payload) => __awaiter(this, void 0, void 0, function* () {
                    const foundParent = yield getData$2(this).controller.getParent((parent) => parent.id === payload.windowSummary.parentId);
                    const foundWindow = foundParent.children.find((child) => child.type === "window" && child.positionIndex === payload.windowSummary.config.positionIndex);
                    callback(foundWindow);
                });
                const config = {
                    callback: wrappedCallback,
                    action: "added",
                    eventType: "window",
                    scope: "frame"
                };
                const unsubscribe = yield getData$2(this).controller.processLocalSubscription(config, myId);
                return unsubscribe;
            });
        }
        onWindowRemoved(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const myId = getData$2(this).summary.id;
                const wrappedCallback = (payload) => {
                    const { windowId, workspaceId, frameId } = payload.windowSummary.config;
                    callback({ windowId, workspaceId, frameId });
                };
                const config = {
                    callback: wrappedCallback,
                    action: "removed",
                    eventType: "window",
                    scope: "frame"
                };
                const unsubscribe = yield getData$2(this).controller.processLocalSubscription(config, myId);
                return unsubscribe;
            });
        }
        onWindowLoaded(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(callback);
                const myId = getData$2(this).summary.id;
                const wrappedCallback = (payload) => __awaiter(this, void 0, void 0, function* () {
                    const foundParent = yield getData$2(this).controller.getParent((parent) => {
                        return parent.id === payload.windowSummary.parentId;
                    });
                    const foundWindow = foundParent.children.find((child) => child.type === "window" && child.positionIndex === payload.windowSummary.config.positionIndex);
                    callback(foundWindow);
                });
                const config = {
                    callback: wrappedCallback,
                    action: "loaded",
                    eventType: "window",
                    scope: "frame"
                };
                const unsubscribe = yield getData$2(this).controller.processLocalSubscription(config, myId);
                return unsubscribe;
            });
        }
    }

    class PrivateDataManager {
        constructor() {
            this.parentsData = new WeakMap();
            this.workspacesData = new WeakMap();
            this.windowsData = new WeakMap();
            this.framesData = new WeakMap();
            this.windowPlacementIdData = {};
        }
        deleteData(model) {
            if (model instanceof Window) {
                const keyForDeleting = Object.keys(this.windowPlacementIdData)
                    .find((k) => this.windowPlacementIdData[k] === model);
                if (keyForDeleting) {
                    delete this.windowPlacementIdData[keyForDeleting];
                }
                this.windowsData.delete(model);
            }
            if (model instanceof Workspace) {
                this.workspacesData.delete(model);
            }
            if (model instanceof Row || model instanceof Column || model instanceof Group) {
                this.parentsData.delete(model);
            }
            if (model instanceof Frame) {
                this.framesData.delete(model);
            }
        }
        setWindowData(model, data) {
            this.windowPlacementIdData[data.id] = model;
            this.windowsData.set(model, data);
        }
        setWorkspaceData(model, data) {
            this.workspacesData.set(model, data);
        }
        setParentData(model, data) {
            this.parentsData.set(model, data);
        }
        setFrameData(model, data) {
            this.framesData.set(model, data);
        }
        getWindowData(model) {
            return this.windowsData.get(model);
        }
        getWindowByPlacementId(placementId) {
            return this.windowPlacementIdData[placementId];
        }
        getWorkspaceData(model) {
            return this.workspacesData.get(model);
        }
        getParentData(model) {
            return this.parentsData.get(model);
        }
        getFrameData(model) {
            return this.framesData.get(model);
        }
        remapChild(model, newData) {
            if (model instanceof Window) {
                const data = this.windowsData.get(model);
                data.parent = newData.parent || data.parent;
                data.config = newData.config || data.config;
            }
            if (model instanceof Row || model instanceof Column || model instanceof Group) {
                const data = this.parentsData.get(model);
                data.parent = newData.parent || data.parent;
                data.config = newData.config || data.config;
                data.children = newData.children || data.children;
            }
        }
        remapFrame(model, newData) {
            const data = this.framesData.get(model);
            data.summary = newData;
        }
        remapWorkspace(model, newData) {
            const data = this.workspacesData.get(model);
            data.frame = newData.frame || data.frame;
            data.config = newData.config || data.config;
            data.children = newData.children || data.children;
        }
    }

    const data$3 = new WeakMap();
    const getData$3 = (base, model) => {
        const manager = data$3.get(base).manager;
        if (model instanceof Workspace) {
            return manager.getWorkspaceData(model);
        }
        return data$3.get(base).manager.getParentData(model);
    };
    const getWindowFromPlacementId = (base, placemenId) => {
        const manager = data$3.get(base).manager;
        return manager.getWindowByPlacementId(placemenId);
    };
    class Base {
        constructor(dataManager) {
            data$3.set(this, { manager: dataManager });
        }
        getId(model) {
            return getData$3(this, model).id;
        }
        getPositionIndex(model) {
            return getData$3(this, model).config.positionIndex;
        }
        getWorkspaceId(model) {
            const privateData = getData$3(this, model);
            return privateData.config.workspaceId || privateData.workspace.id;
        }
        getFrameId(model) {
            return getData$3(this, model).frame.id;
        }
        getAllChildren(model, predicate) {
            checkThrowCallback(predicate, true);
            const children = getData$3(this, model).children;
            if (typeof predicate === "undefined") {
                return children;
            }
            return children.filter(predicate);
        }
        getMyParent(model) {
            if (model instanceof Workspace) {
                return;
            }
            return getData$3(this, model).parent;
        }
        getMyFrame(model) {
            return getData$3(this, model).frame;
        }
        getMyWorkspace(model) {
            if (model instanceof Workspace) {
                return;
            }
            return getData$3(this, model).workspace;
        }
        addWindow(model, definition, parentType) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!definition.appName && !definition.windowId) {
                    throw new Error("The window definition should contain either an appName or a windowId");
                }
                const validatedDefinition = swimlaneWindowDefinitionDecoder.runWithException(definition);
                const controller = getData$3(this, model).controller;
                const operationResult = yield controller.add("window", getData$3(this, model).id, parentType, validatedDefinition);
                if (model instanceof Workspace) {
                    yield model.refreshReference();
                    return getWindowFromPlacementId(this, operationResult.itemId);
                }
                yield this.getMyWorkspace(model).refreshReference();
                return getWindowFromPlacementId(this, operationResult.itemId);
            });
        }
        addParent(model, typeToAdd, parentType, definition) {
            return __awaiter(this, void 0, void 0, function* () {
                const parentDefinition = this.transformDefinition(typeToAdd, definition);
                const controller = getData$3(this, model).controller;
                const newParentId = (yield controller.add("container", getData$3(this, model).id, parentType, parentDefinition)).itemId;
                if (model instanceof Workspace) {
                    yield model.refreshReference();
                    return model.getBox((parent) => parent.id === newParentId);
                }
                const myWorkspace = this.getMyWorkspace(model);
                yield myWorkspace.refreshReference();
                return myWorkspace.getBox((parent) => parent.id === newParentId);
            });
        }
        removeChild(model, predicate) {
            return __awaiter(this, void 0, void 0, function* () {
                checkThrowCallback(predicate);
                const child = this.getAllChildren(model).find(predicate);
                if (!child) {
                    return;
                }
                yield child.close();
                if (model instanceof Workspace) {
                    yield model.refreshReference();
                    return;
                }
                yield this.getMyWorkspace(model).refreshReference();
            });
        }
        maximize(model) {
            return __awaiter(this, void 0, void 0, function* () {
                const controller = getData$3(this, model).controller;
                yield controller.maximizeItem(getData$3(this, model).id);
            });
        }
        restore(model) {
            return __awaiter(this, void 0, void 0, function* () {
                const controller = getData$3(this, model).controller;
                yield controller.restoreItem(getData$3(this, model).id);
            });
        }
        close(model) {
            return __awaiter(this, void 0, void 0, function* () {
                const modelData = getData$3(this, model);
                const controller = getData$3(this, model).controller;
                yield controller.closeItem(modelData.id);
                if (modelData.parent instanceof Workspace) {
                    yield modelData.parent.refreshReference();
                }
                else {
                    yield this.getMyWorkspace(modelData.parent).refreshReference();
                }
            });
        }
        transformDefinition(type, definition) {
            let parentDefinition;
            if (typeof definition === "undefined") {
                parentDefinition = { type, children: [] };
            }
            else if (definition instanceof ParentBuilder) {
                parentDefinition = definition.serialize();
            }
            else {
                if (typeof definition.type === "undefined") {
                    definition.type = type;
                }
                parentDefinition = strictParentDefinitionDecoder.runWithException(definition);
                parentDefinition.children = parentDefinition.children || [];
            }
            return parentDefinition;
        }
    }

    class BaseController {
        constructor(ioc, windows, contexts, layouts) {
            this.ioc = ioc;
            this.windows = windows;
            this.contexts = contexts;
            this.layouts = layouts;
        }
        get bridge() {
            return this.ioc.bridge;
        }
        get privateDataManager() {
            return this.ioc.privateDataManager;
        }
        checkIsWindowLoaded(windowId) {
            return windowId && this.windows.list().some((win) => win.id === windowId);
        }
        createWorkspace(createConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                const snapshot = yield this.bridge.send(OPERATIONS.createWorkspace.name, createConfig);
                const frameConfig = {
                    summary: snapshot.frameSummary
                };
                const frame = this.ioc.getModel("frame", frameConfig);
                const workspaceConfig = { frame, snapshot };
                return this.ioc.getModel("workspace", workspaceConfig);
            });
        }
        restoreWorkspace(name, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const snapshot = yield this.bridge.send(OPERATIONS.openWorkspace.name, { name, restoreOptions: options });
                const frameSummary = yield this.bridge.send(OPERATIONS.getFrameSummary.name, { itemId: snapshot.config.frameId });
                const frameConfig = {
                    summary: frameSummary
                };
                const frame = this.ioc.getModel("frame", frameConfig);
                const workspaceConfig = { frame, snapshot };
                return this.ioc.getModel("workspace", workspaceConfig);
            });
        }
        add(type, parentId, parentType, definition) {
            return __awaiter(this, void 0, void 0, function* () {
                let operationName;
                const operationArgs = { definition, parentId, parentType };
                if (type === "window") {
                    operationName = OPERATIONS.addWindow.name;
                }
                else if (type === "container") {
                    operationName = OPERATIONS.addContainer.name;
                }
                else {
                    throw new Error(`Unrecognized add type: ${type}`);
                }
                return yield this.bridge.send(operationName, operationArgs);
            });
        }
        getFrame(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const frameSummary = yield this.bridge.send(OPERATIONS.getFrameSummary.name, { itemId: windowId });
                const frameConfig = {
                    summary: frameSummary
                };
                return this.ioc.getModel("frame", frameConfig);
            });
        }
        getFrames(allFrameSummaries, predicate) {
            return allFrameSummaries.reduce((frames, frameSummary) => {
                const frameConfig = {
                    summary: frameSummary
                };
                const frameToCheck = this.ioc.getModel("frame", frameConfig);
                if (!predicate || predicate(frameToCheck)) {
                    frames.push(frameToCheck);
                }
                return frames;
            }, []);
        }
        getAllWorkspaceSummaries(...bridgeResults) {
            const allSummaries = bridgeResults.reduce((summaries, summaryResult) => {
                summaries.push(...summaryResult.summaries);
                return summaries;
            }, []);
            return allSummaries.map((summary) => {
                return {
                    id: summary.id,
                    frameId: summary.config.frameId,
                    positionIndex: summary.config.positionIndex,
                    title: summary.config.title,
                    layoutName: summary.config.layoutName
                };
            });
        }
        handleOnSaved(callback) {
            const wrappedCallback = (layout) => {
                if (layout.type !== "Workspace") {
                    return;
                }
                callback(layout);
            };
            const addedUnSub = this.layouts.onAdded(wrappedCallback);
            const changedUnSub = this.layouts.onChanged(wrappedCallback);
            return () => {
                addedUnSub();
                changedUnSub();
            };
        }
        handleOnRemoved(callback) {
            const wrappedCallback = (layout) => {
                if (layout.type !== "Workspace") {
                    return;
                }
                callback(layout);
            };
            return this.layouts.onRemoved(wrappedCallback);
        }
        fetchWorkspace(workspaceId) {
            return __awaiter(this, void 0, void 0, function* () {
                const snapshot = yield this.bridge.send(OPERATIONS.getWorkspaceSnapshot.name, { itemId: workspaceId });
                const frameConfig = {
                    summary: snapshot.frameSummary
                };
                const frame = this.ioc.getModel("frame", frameConfig);
                const workspaceConfig = { frame, snapshot };
                return this.ioc.getModel("workspace", workspaceConfig);
            });
        }
        bundleTo(type, workspaceId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send(OPERATIONS.bundleWorkspace.name, { type, workspaceId });
            });
        }
        getWorkspaceContext(workspaceId) {
            const contextName = `___workspace___${workspaceId}`;
            return this.contexts.get(contextName);
        }
        setWorkspaceContext(workspaceId, data) {
            const contextName = `___workspace___${workspaceId}`;
            return this.contexts.set(contextName, data);
        }
        updateWorkspaceContext(workspaceId, data) {
            const contextName = `___workspace___${workspaceId}`;
            return this.contexts.update(contextName, data);
        }
        subscribeWorkspaceContextUpdated(workspaceId, callback) {
            const contextName = `___workspace___${workspaceId}`;
            return this.contexts.subscribe(contextName, callback);
        }
        restoreItem(itemId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send(OPERATIONS.restoreItem.name, { itemId });
            });
        }
        maximizeItem(itemId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send(OPERATIONS.maximizeItem.name, { itemId });
            });
        }
        focusItem(itemId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send(OPERATIONS.focusItem.name, { itemId });
            });
        }
        closeItem(itemId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send(OPERATIONS.closeItem.name, { itemId });
            });
        }
        resizeItem(itemId, config) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send(OPERATIONS.resizeItem.name, Object.assign({}, { itemId }, config));
            });
        }
        moveFrame(itemId, config) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send(OPERATIONS.moveFrame.name, Object.assign({}, { itemId }, config));
            });
        }
        getGDWindow(itemId) {
            return this.windows.list().find((gdWindow) => gdWindow.id === itemId);
        }
        forceLoadWindow(itemId) {
            return __awaiter(this, void 0, void 0, function* () {
                const controlResult = yield this.bridge.send(OPERATIONS.forceLoadWindow.name, { itemId });
                return controlResult.windowId;
            });
        }
        ejectWindow(itemId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.bridge.send(OPERATIONS.ejectWindow.name, { itemId });
            });
        }
        moveWindowTo(itemId, newParentId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send(OPERATIONS.moveWindowTo.name, { itemId, containerId: newParentId });
            });
        }
        getSnapshot(itemId, type) {
            return __awaiter(this, void 0, void 0, function* () {
                let result;
                if (type === "workspace") {
                    result = yield this.bridge.send(OPERATIONS.getWorkspaceSnapshot.name, { itemId });
                }
                else if (type === "frame") {
                    result = yield this.bridge.send(OPERATIONS.getFrameSnapshot.name, { itemId });
                }
                return result;
            });
        }
        setItemTitle(itemId, title) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send(OPERATIONS.setItemTitle.name, { itemId, title });
            });
        }
        refreshChildren(config) {
            const { parent, children, existingChildren, workspace } = config;
            if (parent instanceof Window) {
                return;
            }
            const newChildren = children.map((newChildSnapshot) => {
                let childToAdd = existingChildren.find((c) => c.id === newChildSnapshot.id);
                const childType = newChildSnapshot.type;
                if (childToAdd) {
                    this.privateDataManager.remapChild(childToAdd, {
                        parent,
                        children: [],
                        config: newChildSnapshot.config
                    });
                }
                else {
                    if (childType === "window") {
                        const createConfig = {
                            id: newChildSnapshot.id,
                            parent,
                            frame: workspace.frame,
                            workspace,
                            config: newChildSnapshot.config
                        };
                        childToAdd = this.ioc.getModel(childType, createConfig);
                    }
                    else {
                        const createConfig = {
                            id: newChildSnapshot.id,
                            children: [],
                            parent,
                            frame: workspace.frame,
                            workspace,
                            config: newChildSnapshot.config
                        };
                        childToAdd = this.ioc.getModel(childType, createConfig);
                    }
                }
                if (childType !== "window") {
                    this.refreshChildren({
                        workspace, existingChildren,
                        children: newChildSnapshot.children,
                        parent: childToAdd
                    });
                }
                return childToAdd;
            });
            if (parent instanceof Workspace) {
                return newChildren;
            }
            else {
                this.privateDataManager.remapChild(parent, { children: newChildren });
                return newChildren;
            }
        }
        iterateFindChild(children, predicate) {
            let foundChild = children.find((child) => predicate(child));
            if (foundChild) {
                return foundChild;
            }
            children.some((child) => {
                if (child instanceof Window) {
                    return false;
                }
                foundChild = this.iterateFindChild(child.children, predicate);
                if (foundChild) {
                    return true;
                }
            });
            return foundChild;
        }
        iterateFilterChildren(children, predicate) {
            const foundChildren = children.filter((child) => predicate(child));
            const grandChildren = children.reduce((innerFound, child) => {
                if (child instanceof Window) {
                    return innerFound;
                }
                innerFound.push(...this.iterateFilterChildren(child.children, predicate));
                return innerFound;
            }, []);
            foundChildren.push(...grandChildren);
            return foundChildren;
        }
        notifyWindowAdded(windowId) {
            return new Promise((resolve) => {
                const alreadyPresent = this.windows.list().some((win) => win.id === windowId);
                if (alreadyPresent) {
                    return resolve();
                }
                const unsubscribe = this.windows.onWindowAdded((win) => {
                    if (win.id !== windowId) {
                        return;
                    }
                    if (unsubscribe) {
                        unsubscribe();
                    }
                    resolve();
                });
            });
        }
    }

    class MainController {
        constructor(bridge, base) {
            this.bridge = bridge;
            this.base = base;
        }
        checkIsWindowLoaded(windowId) {
            return this.base.checkIsWindowLoaded(windowId);
        }
        checkIsInSwimlane(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const controlResult = yield this.bridge.send(OPERATIONS.isWindowInWorkspace.name, { itemId: windowId });
                return controlResult.inWorkspace;
            });
        }
        createWorkspace(definition, saveConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                const createConfig = Object.assign({}, definition, { saveConfig });
                return yield this.base.createWorkspace(createConfig);
            });
        }
        restoreWorkspace(name, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const allLayouts = yield this.getLayoutSummaries();
                const layoutExists = allLayouts.some((summary) => summary.name === name);
                if (!layoutExists) {
                    throw new Error(`This layout: ${name} cannot be restored, because it doesn't exist.`);
                }
                if (options === null || options === void 0 ? void 0 : options.frameId) {
                    const allFrameSummaries = yield this.bridge.send(OPERATIONS.getAllFramesSummaries.name);
                    const foundMatchingFrame = allFrameSummaries.summaries.some((summary) => summary.id === options.frameId);
                    if (!foundMatchingFrame) {
                        throw new Error(`Cannot reuse the frame with id: ${options.frameId}, because there is no frame with that ID found`);
                    }
                }
                return yield this.base.restoreWorkspace(name, options);
            });
        }
        add(type, parentId, parentType, definition) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.base.add(type, parentId, parentType, definition);
            });
        }
        processLocalSubscription(config, levelId) {
            return window.glue42gd ?
                this.handleEnterpriseLocalSubscription(config, levelId) :
                this.handleCoreLocalSubscription(config, levelId);
        }
        processGlobalSubscription(callback, eventType, action) {
            return window.glue42gd ?
                this.handleEnterpriseGlobalSubscription(callback, eventType, action) :
                this.handleCoreGlobalSubscription(callback, eventType, action);
        }
        getFrame(selector) {
            return __awaiter(this, void 0, void 0, function* () {
                if (selector.windowId) {
                    return yield this.base.getFrame(selector.windowId);
                }
                if (selector.predicate) {
                    return (yield this.getFrames(selector.predicate))[0];
                }
                throw new Error(`The provided selector is not valid: ${JSON.stringify(selector)}`);
            });
        }
        getFrames(predicate) {
            return __awaiter(this, void 0, void 0, function* () {
                const allFrameSummaries = yield this.bridge.send(OPERATIONS.getAllFramesSummaries.name);
                return this.base.getFrames(allFrameSummaries.summaries, predicate);
            });
        }
        getWorkspace(predicate) {
            return __awaiter(this, void 0, void 0, function* () {
                let foundWorkspace;
                yield this.iterateWorkspaces((wsp, end) => {
                    if (predicate(wsp)) {
                        foundWorkspace = wsp;
                        end();
                    }
                });
                return foundWorkspace;
            });
        }
        getWorkspaces(predicate) {
            return __awaiter(this, void 0, void 0, function* () {
                const matchingWorkspaces = [];
                yield this.iterateWorkspaces((wsp) => {
                    if (!predicate || predicate(wsp)) {
                        matchingWorkspaces.push(wsp);
                    }
                });
                return matchingWorkspaces;
            });
        }
        getAllWorkspaceSummaries() {
            return __awaiter(this, void 0, void 0, function* () {
                const allSummariesResult = yield this.bridge.send(OPERATIONS.getAllWorkspacesSummaries.name, {});
                return this.base.getAllWorkspaceSummaries(allSummariesResult);
            });
        }
        getWindow(predicate) {
            return __awaiter(this, void 0, void 0, function* () {
                let resultWindow;
                yield this.iterateWorkspaces((wsp, end) => {
                    const foundWindow = wsp.getWindow(predicate);
                    if (foundWindow) {
                        resultWindow = foundWindow;
                        end();
                    }
                });
                return resultWindow;
            });
        }
        getParent(predicate) {
            return __awaiter(this, void 0, void 0, function* () {
                let resultParent;
                yield this.iterateWorkspaces((wsp, end) => {
                    const foundParent = wsp.getBox(predicate);
                    if (foundParent) {
                        resultParent = foundParent;
                        end();
                    }
                });
                return resultParent;
            });
        }
        getLayoutSummaries() {
            return __awaiter(this, void 0, void 0, function* () {
                const allLayouts = yield this.bridge.send(OPERATIONS.getAllLayoutsSummaries.name);
                return allLayouts.summaries;
            });
        }
        deleteLayout(name) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send(OPERATIONS.deleteLayout.name, { name });
            });
        }
        exportLayout(predicate) {
            return __awaiter(this, void 0, void 0, function* () {
                const allLayoutsResult = yield this.bridge.send(OPERATIONS.exportAllLayouts.name);
                return allLayoutsResult.layouts.reduce((matchingLayouts, layout) => {
                    if (!predicate || predicate(layout)) {
                        matchingLayouts.push(layout);
                    }
                    return matchingLayouts;
                }, []);
            });
        }
        saveLayout(config) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.bridge.send(OPERATIONS.saveLayout.name, config);
            });
        }
        importLayout(layouts, mode) {
            return __awaiter(this, void 0, void 0, function* () {
                yield Promise.all(layouts.map((layout) => this.bridge.send(OPERATIONS.importLayout.name, { layout, mode })));
            });
        }
        handleOnSaved(callback) {
            return this.base.handleOnSaved(callback);
        }
        handleOnRemoved(callback) {
            return this.base.handleOnRemoved(callback);
        }
        bundleTo(type, workspaceId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.base.bundleTo(type, workspaceId);
            });
        }
        getWorkspaceContext(workspaceId) {
            return this.base.getWorkspaceContext(workspaceId);
        }
        setWorkspaceContext(workspaceId, data) {
            return this.base.setWorkspaceContext(workspaceId, data);
        }
        updateWorkspaceContext(workspaceId, data) {
            return this.base.updateWorkspaceContext(workspaceId, data);
        }
        subscribeWorkspaceContextUpdated(workspaceId, callback) {
            return this.base.subscribeWorkspaceContextUpdated(workspaceId, callback);
        }
        restoreItem(itemId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.base.restoreItem(itemId);
            });
        }
        maximizeItem(itemId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.base.maximizeItem(itemId);
            });
        }
        focusItem(itemId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.base.focusItem(itemId);
            });
        }
        changeFrameState(frameId, state) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send(OPERATIONS.changeFrameState.name, { frameId, requestedState: state });
            });
        }
        getFrameState(frameId) {
            return __awaiter(this, void 0, void 0, function* () {
                const frameResult = yield this.bridge.send(OPERATIONS.getFrameState.name, { itemId: frameId });
                return frameResult.state;
            });
        }
        closeItem(itemId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.base.closeItem(itemId);
            });
        }
        resizeItem(itemId, config) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.base.resizeItem(itemId, config);
            });
        }
        moveFrame(itemId, config) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.base.moveFrame(itemId, config);
            });
        }
        getGDWindow(itemId) {
            return this.base.getGDWindow(itemId);
        }
        forceLoadWindow(itemId) {
            return __awaiter(this, void 0, void 0, function* () {
                const windowId = yield this.base.forceLoadWindow(itemId);
                yield this.base.notifyWindowAdded(windowId);
                return windowId;
            });
        }
        ejectWindow(itemId) {
            return __awaiter(this, void 0, void 0, function* () {
                const windowId = (yield this.base.ejectWindow(itemId)).windowId;
                yield this.base.notifyWindowAdded(windowId);
                return windowId;
            });
        }
        moveWindowTo(itemId, newParentId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.base.moveWindowTo(itemId, newParentId);
            });
        }
        getSnapshot(itemId, type) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.base.getSnapshot(itemId, type);
            });
        }
        setItemTitle(itemId, title) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.base.setItemTitle(itemId, title);
            });
        }
        refreshChildren(config) {
            return this.base.refreshChildren(config);
        }
        iterateFindChild(children, predicate) {
            return this.base.iterateFindChild(children, predicate);
        }
        iterateFilterChildren(children, predicate) {
            return this.base.iterateFilterChildren(children, predicate);
        }
        handleCoreLocalSubscription(config, levelId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.createCoreEventSubscription();
                config.scopeId = config.scopeId || levelId;
                if (config.eventType === "window" && config.action === "loaded") {
                    const originalCB = config.callback;
                    const wrappedCB = (callbackData) => __awaiter(this, void 0, void 0, function* () {
                        yield this.base.notifyWindowAdded(callbackData.windowSummary.config.windowId);
                        originalCB(callbackData);
                    });
                    config.callback = wrappedCB;
                }
                return this.bridge.handleCoreSubscription(config);
            });
        }
        handleEnterpriseLocalSubscription(config, levelId) {
            config.scopeId = config.scopeId || levelId;
            if (config.eventType === "window" && config.action === "loaded") {
                const originalCB = config.callback;
                const wrappedCB = (callbackData) => __awaiter(this, void 0, void 0, function* () {
                    yield this.base.notifyWindowAdded(callbackData.windowSummary.config.windowId);
                    originalCB(callbackData);
                });
                config.callback = wrappedCB;
            }
            return this.bridge.subscribe(config);
        }
        handleCoreGlobalSubscription(callback, eventType, action) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.createCoreEventSubscription();
                const config = {
                    eventType, callback, action,
                    scope: "global",
                };
                if (eventType === "window" && action === "loaded") {
                    const wrappedCB = (callbackData) => __awaiter(this, void 0, void 0, function* () {
                        yield this.base.notifyWindowAdded(callbackData.windowSummary.config.windowId);
                        callback(callbackData);
                    });
                    config.callback = wrappedCB;
                }
                return this.bridge.handleCoreSubscription(config);
            });
        }
        handleEnterpriseGlobalSubscription(callback, eventType, action) {
            const config = {
                eventType, callback, action,
                scope: "global",
            };
            if (eventType === "window" && action === "loaded") {
                const wrappedCB = (callbackData) => __awaiter(this, void 0, void 0, function* () {
                    yield this.base.notifyWindowAdded(callbackData.windowSummary.config.windowId);
                    callback(callbackData);
                });
                config.callback = wrappedCB;
            }
            return this.bridge.subscribe(config);
        }
        iterateWorkspaces(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                let ended = false;
                const end = () => { ended = true; };
                const workspaceSummaries = yield this.getAllWorkspaceSummaries();
                for (const summary of workspaceSummaries) {
                    if (ended) {
                        return;
                    }
                    const wsp = yield this.base.fetchWorkspace(summary.id);
                    callback(wsp, end);
                }
            });
        }
    }

    class IoC {
        constructor(agm, windows, layouts, contexts) {
            this.agm = agm;
            this.windows = windows;
            this.layouts = layouts;
            this.contexts = contexts;
        }
        get baseController() {
            if (!this._baseController) {
                this._baseController = new BaseController(this, this.windows, this.contexts, this.layouts);
            }
            return this._baseController;
        }
        get controller() {
            if (!this._controllerInstance) {
                this._controllerInstance = new MainController(this.bridge, this.baseController);
            }
            return this._controllerInstance;
        }
        get bridge() {
            if (!this._bridgeInstance) {
                this._bridgeInstance = new Bridge(this.transport, lib());
            }
            return this._bridgeInstance;
        }
        get transport() {
            if (!this._transportInstance) {
                this._transportInstance = new InteropTransport(this.agm);
            }
            return this._transportInstance;
        }
        get privateDataManager() {
            if (!this._privateDataManagerInstance) {
                this._privateDataManagerInstance = new PrivateDataManager();
            }
            return this._privateDataManagerInstance;
        }
        get parentBase() {
            if (!this._parentBaseInstance) {
                this._parentBaseInstance = new Base(this.privateDataManager);
            }
            return this._parentBaseInstance;
        }
        initiate(actualWindowId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.transport.initiate(actualWindowId);
            });
        }
        getModel(type, createConfig) {
            switch (type) {
                case "frame": {
                    const newFrame = new Frame(this.privateDataManager);
                    const { summary } = createConfig;
                    const frameData = { summary, controller: this.controller };
                    this.privateDataManager.setFrameData(newFrame, frameData);
                    return newFrame;
                }
                case "window": {
                    const { id, parent, frame, workspace, config } = createConfig;
                    const windowPrivateData = {
                        type: "window",
                        controller: this.controller,
                        config, id, parent, frame, workspace
                    };
                    const newWindow = new Window(this.privateDataManager);
                    this.privateDataManager.setWindowData(newWindow, windowPrivateData);
                    return newWindow;
                }
                case "row":
                case "column":
                case "group": {
                    const { id, children, parent, frame, workspace, config } = createConfig;
                    const newParent = type === "column" ? new Column(this.parentBase) :
                        type === "row" ? new Row(this.parentBase) : new Group(this.parentBase);
                    const builtChildren = this.buildChildren(children, frame, workspace, newParent);
                    const parentPrivateData = {
                        id, parent, frame, workspace, config, type,
                        controller: this.controller,
                        children: builtChildren,
                    };
                    this.privateDataManager.setParentData(newParent, parentPrivateData);
                    return newParent;
                }
                case "workspace": {
                    const { snapshot, frame } = createConfig;
                    const newWorkspace = new Workspace(this.privateDataManager);
                    const children = this.buildChildren(snapshot.children, frame, newWorkspace, newWorkspace);
                    const workspacePrivateData = {
                        id: snapshot.id,
                        type: "workspace",
                        config: snapshot.config,
                        base: this.parentBase,
                        controller: this.controller,
                        children, frame, ioc: this
                    };
                    this.privateDataManager.setWorkspaceData(newWorkspace, workspacePrivateData);
                    return newWorkspace;
                }
                default: throw new Error(`Unrecognized type: ${type}`);
            }
        }
        getBuilder(config) {
            config.definition = config.definition || {};
            if (!Array.isArray(config.definition.children)) {
                config.definition.children = [];
            }
            const baseBuilder = new BaseBuilder(this.getBuilder.bind(this));
            switch (config.type) {
                case "workspace": {
                    return new WorkspaceBuilder(config.definition, baseBuilder, this.controller);
                }
                case "row":
                case "column":
                case "group": {
                    config.definition.type = config.type;
                    return new ParentBuilder(config.definition, baseBuilder);
                }
                default: throw new Error(`Unexpected Builder creation error, provided config: ${JSON.stringify(config)}`);
            }
        }
        buildChildren(children, frame, workspace, parent) {
            return children.map((child) => {
                switch (child.type) {
                    case "window": return this.getModel("window", {
                        id: child.id,
                        config: child.config,
                        frame, workspace, parent
                    });
                    case "column": return this.getModel(child.type, {
                        id: child.id,
                        config: child.config,
                        children: child.children,
                        frame, workspace, parent
                    });
                    case "row": return this.getModel(child.type, {
                        id: child.id,
                        config: child.config,
                        children: child.children,
                        frame, workspace, parent
                    });
                    case "group": return this.getModel(child.type, {
                        id: child.id,
                        config: child.config,
                        children: child.children,
                        frame, workspace, parent
                    });
                    default: throw new Error(`Unsupported child type: ${child.type}`);
                }
            });
        }
    }

    const composeAPI = (glue, ioc) => {
        const controller = ioc.controller;
        const inWorkspace = () => {
            const myId = glue.windows.my().id;
            if (!myId) {
                throw new Error("Cannot get my frame, because my id is undefined.");
            }
            return controller.checkIsInSwimlane(myId);
        };
        const getBuilder = (config) => {
            const validatedConfig = builderConfigDecoder.runWithException(config);
            return ioc.getBuilder(validatedConfig);
        };
        const getMyFrame = () => __awaiter(void 0, void 0, void 0, function* () {
            const windowId = glue.windows.my().id;
            if (!windowId) {
                throw new Error("Cannot get my frame, because my id is undefined.");
            }
            const isInSwimlane = yield controller.checkIsInSwimlane(windowId);
            if (!isInSwimlane) {
                throw new Error("Cannot fetch your frame, because this window is not in a workspace");
            }
            return controller.getFrame({ windowId });
        });
        const getFrame = (predicate) => __awaiter(void 0, void 0, void 0, function* () {
            checkThrowCallback(predicate);
            return controller.getFrame({ predicate });
        });
        const getAllFrames = (predicate) => __awaiter(void 0, void 0, void 0, function* () {
            checkThrowCallback(predicate, true);
            return controller.getFrames(predicate);
        });
        const getAllWorkspacesSummaries = () => {
            return controller.getAllWorkspaceSummaries();
        };
        const getMyWorkspace = () => __awaiter(void 0, void 0, void 0, function* () {
            const myId = glue.windows.my().id;
            if (!myId) {
                throw new Error("Cannot get my workspace, because my id is undefined.");
            }
            const isInSwimlane = yield controller.checkIsInSwimlane(myId);
            if (!isInSwimlane) {
                throw new Error("Cannot fetch your workspace, because this window is not in a workspace");
            }
            return (yield controller.getWorkspaces((wsp) => !!wsp.getWindow((w) => w.id === myId)))[0];
        });
        const getWorkspace = (predicate) => __awaiter(void 0, void 0, void 0, function* () {
            checkThrowCallback(predicate);
            return (yield controller.getWorkspaces(predicate))[0];
        });
        const getAllWorkspaces = (predicate) => {
            checkThrowCallback(predicate, true);
            return controller.getWorkspaces(predicate);
        };
        const getWindow = (predicate) => __awaiter(void 0, void 0, void 0, function* () {
            checkThrowCallback(predicate);
            return controller.getWindow(predicate);
        });
        const getParent = (predicate) => __awaiter(void 0, void 0, void 0, function* () {
            checkThrowCallback(predicate);
            return controller.getParent(predicate);
        });
        const restoreWorkspace = (name, options) => __awaiter(void 0, void 0, void 0, function* () {
            nonEmptyStringDecoder.runWithException(name);
            const validatedOptions = restoreWorkspaceConfigDecoder.runWithException(options);
            return controller.restoreWorkspace(name, validatedOptions);
        });
        const createWorkspace = (definition, saveConfig) => __awaiter(void 0, void 0, void 0, function* () {
            const validatedDefinition = workspaceDefinitionDecoder.runWithException(definition);
            const validatedConfig = workspaceBuilderCreateConfigDecoder.runWithException(saveConfig);
            return controller.createWorkspace(validatedDefinition, validatedConfig);
        });
        const layouts = {
            getSummaries: () => {
                return controller.getLayoutSummaries();
            },
            delete: (name) => __awaiter(void 0, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(name);
                return controller.deleteLayout(name);
            }),
            export: (predicate) => __awaiter(void 0, void 0, void 0, function* () {
                checkThrowCallback(predicate, true);
                return controller.exportLayout(predicate);
            }),
            import: (layouts, mode = "replace") => __awaiter(void 0, void 0, void 0, function* () {
                if (!Array.isArray(layouts)) {
                    throw new Error(`The provided layouts argument is not an array: ${JSON.stringify(layouts)}`);
                }
                layouts.forEach((layout) => workspaceLayoutDecoder.runWithException(layout));
                return controller.importLayout(layouts, mode);
            }),
            save: (config) => __awaiter(void 0, void 0, void 0, function* () {
                const verifiedConfig = workspaceLayoutSaveConfigDecoder.runWithException(config);
                return controller.saveLayout(verifiedConfig);
            }),
            onSaved: (callback) => __awaiter(void 0, void 0, void 0, function* () {
                checkThrowCallback(callback);
                return controller.handleOnSaved(callback);
            }),
            onRemoved: (callback) => __awaiter(void 0, void 0, void 0, function* () {
                checkThrowCallback(callback);
                return controller.handleOnRemoved(callback);
            })
        };
        const onFrameOpened = (callback) => __awaiter(void 0, void 0, void 0, function* () {
            checkThrowCallback(callback);
            const wrappedCallback = (payload) => {
                const frameConfig = {
                    summary: payload.frameSummary
                };
                const frame = ioc.getModel("frame", frameConfig);
                callback(frame);
            };
            const unsubscribe = yield controller.processGlobalSubscription(wrappedCallback, "frame", "opened");
            return unsubscribe;
        });
        const onFrameClosed = (callback) => __awaiter(void 0, void 0, void 0, function* () {
            checkThrowCallback(callback);
            const wrappedCallback = (payload) => {
                callback({ frameId: payload.frameSummary.id });
            };
            const unsubscribe = yield controller.processGlobalSubscription(wrappedCallback, "frame", "closed");
            return unsubscribe;
        });
        const onWorkspaceOpened = (callback) => __awaiter(void 0, void 0, void 0, function* () {
            checkThrowCallback(callback);
            const wrappedCallback = (payload) => __awaiter(void 0, void 0, void 0, function* () {
                const frameConfig = {
                    summary: payload.frameSummary
                };
                const frame = ioc.getModel("frame", frameConfig);
                const snapshot = (yield controller.getSnapshot(payload.workspaceSummary.id, "workspace"));
                const workspaceConfig = { frame, snapshot };
                const workspace = ioc.getModel("workspace", workspaceConfig);
                callback(workspace);
            });
            const unsubscribe = yield controller.processGlobalSubscription(wrappedCallback, "workspace", "opened");
            return unsubscribe;
        });
        const onWorkspaceClosed = (callback) => __awaiter(void 0, void 0, void 0, function* () {
            checkThrowCallback(callback);
            const wrappedCallback = (payload) => {
                callback({ frameId: payload.frameSummary.id, workspaceId: payload.workspaceSummary.id });
            };
            const unsubscribe = yield controller.processGlobalSubscription(wrappedCallback, "workspace", "closed");
            return unsubscribe;
        });
        const onWindowAdded = (callback) => __awaiter(void 0, void 0, void 0, function* () {
            checkThrowCallback(callback);
            const wrappedCallback = (payload) => __awaiter(void 0, void 0, void 0, function* () {
                const snapshot = (yield controller.getSnapshot(payload.windowSummary.config.workspaceId, "workspace"));
                const frameConfig = {
                    summary: snapshot.frameSummary
                };
                const frame = ioc.getModel("frame", frameConfig);
                const workspaceConfig = { frame, snapshot };
                const workspace = ioc.getModel("workspace", workspaceConfig);
                const windowParent = workspace.getBox((parent) => parent.id === payload.windowSummary.parentId);
                const foundWindow = windowParent.children.find((child) => child.type === "window" && child.positionIndex === payload.windowSummary.config.positionIndex);
                callback(foundWindow);
            });
            const unsubscribe = yield controller.processGlobalSubscription(wrappedCallback, "window", "added");
            return unsubscribe;
        });
        const onWindowLoaded = (callback) => __awaiter(void 0, void 0, void 0, function* () {
            checkThrowCallback(callback);
            const wrappedCallback = (payload) => __awaiter(void 0, void 0, void 0, function* () {
                const snapshot = (yield controller.getSnapshot(payload.windowSummary.config.workspaceId, "workspace"));
                const frameConfig = {
                    summary: snapshot.frameSummary
                };
                const frame = ioc.getModel("frame", frameConfig);
                const workspaceConfig = { frame, snapshot };
                const workspace = ioc.getModel("workspace", workspaceConfig);
                const foundWindow = workspace.getWindow((win) => win.id && win.id === payload.windowSummary.config.windowId);
                callback(foundWindow);
            });
            const unsubscribe = yield controller.processGlobalSubscription(wrappedCallback, "window", "loaded");
            return unsubscribe;
        });
        const onWindowRemoved = (callback) => __awaiter(void 0, void 0, void 0, function* () {
            checkThrowCallback(callback);
            const wrappedCallback = (payload) => {
                const { windowId, workspaceId, frameId } = payload.windowSummary.config;
                callback({ windowId, workspaceId, frameId });
            };
            const unsubscribe = yield controller.processGlobalSubscription(wrappedCallback, "window", "removed");
            return unsubscribe;
        });
        return {
            inWorkspace,
            getBuilder,
            getMyFrame,
            getFrame,
            getAllFrames,
            getAllWorkspacesSummaries,
            getMyWorkspace,
            getWorkspace,
            getAllWorkspaces,
            getWindow,
            getBox: getParent,
            restoreWorkspace,
            createWorkspace,
            layouts,
            onFrameOpened,
            onFrameClosed,
            onWorkspaceOpened,
            onWorkspaceClosed,
            onWindowAdded,
            onWindowLoaded,
            onWindowRemoved,
        };
    };

    const factoryFunction = (glue) => __awaiter(void 0, void 0, void 0, function* () {
        const ioc = new IoC(glue.agm, glue.windows, glue.layouts, glue.contexts);
        const actualWindowId = glue.interop.instance.windowId;
        yield ioc.initiate(actualWindowId);
        glue.workspaces = composeAPI(glue, ioc);
    });
    if (typeof window !== "undefined") {
        window.GlueWorkspaces = factoryFunction;
    }

    return factoryFunction;

})));
//# sourceMappingURL=workspaces.umd.js.map
