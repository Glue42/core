(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.web = factory());
}(this, (function () { 'use strict';

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

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    const defaultConfig = {
        logger: "trace",
        gateway: { webPlatform: {} },
        libraries: []
    };
    const parseConfig = (config) => {
        var _a;
        const combined = Object.assign({}, defaultConfig, config);
        if (combined.systemLogger) {
            combined.logger = (_a = combined.systemLogger.level) !== null && _a !== void 0 ? _a : "trace";
        }
        return combined;
    };

    const checkSingleton = () => {
        const glue42CoreNamespace = window.glue42core;
        if (!glue42CoreNamespace) {
            window.glue42core = { webStarted: true };
            return;
        }
        if (glue42CoreNamespace.webStarted) {
            throw new Error("The Glue42 Core Web has already been started for this application.");
        }
        glue42CoreNamespace.webStarted = true;
    };

    const enterprise = (config) => {
        var _a, _b;
        const enterpriseConfig = {
            windows: true,
            layouts: "full",
            appManager: "full",
            channels: true,
            libraries: config.libraries,
            logger: (_b = (_a = config === null || config === void 0 ? void 0 : config.systemLogger) === null || _a === void 0 ? void 0 : _a.level) !== null && _b !== void 0 ? _b : "warn"
        };
        return window.Glue(enterpriseConfig);
    };

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
    /** See `Decoder.lazy` */
    var lazy = Decoder.lazy;

    const nonEmptyStringDecoder = string().where((s) => s.length > 0, "Expected a non-empty string");
    const nonNegativeNumberDecoder = number().where((num) => num >= 0, "Expected a non-negative number");
    const libDomainDecoder = oneOf(constant("windows"), constant("appManager"), constant("layouts"), constant("intents"));
    const windowOperationTypesDecoder = oneOf(constant("openWindow"), constant("windowHello"), constant("windowAdded"), constant("windowRemoved"), constant("getBounds"), constant("getUrl"), constant("moveResize"), constant("focus"), constant("close"), constant("getTitle"), constant("setTitle"));
    const appManagerOperationTypesDecoder = oneOf(constant("appHello"), constant("applicationAdded"), constant("applicationRemoved"), constant("applicationChanged"), constant("instanceStarted"), constant("instanceStopped"), constant("applicationStart"), constant("instanceStop"));
    const layoutsOperationTypesDecoder = oneOf(constant("layoutAdded"), constant("layoutChanged"), constant("layoutRemoved"), constant("get"), constant("getAll"), constant("export"), constant("import"), constant("remove"));
    const windowRelativeDirectionDecoder = oneOf(constant("top"), constant("left"), constant("right"), constant("bottom"));
    const windowOpenSettingsDecoder = optional(object({
        top: optional(number()),
        left: optional(number()),
        width: optional(nonNegativeNumberDecoder),
        height: optional(nonNegativeNumberDecoder),
        context: optional(anyJson()),
        relativeTo: optional(nonEmptyStringDecoder),
        relativeDirection: optional(windowRelativeDirectionDecoder),
        windowId: optional(nonEmptyStringDecoder)
    }));
    const openWindowConfigDecoder = object({
        name: nonEmptyStringDecoder,
        url: nonEmptyStringDecoder,
        options: windowOpenSettingsDecoder
    });
    const windowHelloDecoder = object({
        windowId: optional(nonEmptyStringDecoder)
    });
    const coreWindowDataDecoder = object({
        windowId: nonEmptyStringDecoder,
        name: nonEmptyStringDecoder
    });
    const simpleWindowDecoder = object({
        windowId: nonEmptyStringDecoder
    });
    const helloSuccessDecoder = object({
        windows: array(coreWindowDataDecoder),
        isWorkspaceFrame: boolean()
    });
    const windowTitleConfigDecoder = object({
        windowId: nonEmptyStringDecoder,
        title: string()
    });
    const windowMoveResizeConfigDecoder = object({
        windowId: nonEmptyStringDecoder,
        top: optional(number()),
        left: optional(number()),
        width: optional(nonNegativeNumberDecoder),
        height: optional(nonNegativeNumberDecoder),
        relative: optional(boolean())
    });
    const windowBoundsResultDecoder = object({
        windowId: nonEmptyStringDecoder,
        bounds: object({
            top: number(),
            left: number(),
            width: nonNegativeNumberDecoder,
            height: nonNegativeNumberDecoder
        })
    });
    const windowUrlResultDecoder = object({
        windowId: nonEmptyStringDecoder,
        url: nonEmptyStringDecoder
    });
    const anyDecoder = anyJson();
    const boundsDecoder = object({
        top: optional(number()),
        left: optional(number()),
        width: optional(nonNegativeNumberDecoder),
        height: optional(nonNegativeNumberDecoder)
    });
    const instanceDataDecoder = object({
        id: nonEmptyStringDecoder,
        applicationName: nonEmptyStringDecoder
    });
    const applicationDetailsDecoder = object({
        url: nonEmptyStringDecoder,
        top: optional(number()),
        left: optional(number()),
        width: optional(nonNegativeNumberDecoder),
        height: optional(nonNegativeNumberDecoder)
    });
    const intentDefinitionDecoder = object({
        name: nonEmptyStringDecoder,
        displayName: optional(string()),
        contexts: optional(array(string())),
        customConfig: optional(object())
    });
    const applicationDefinitionDecoder = object({
        name: nonEmptyStringDecoder,
        title: optional(nonEmptyStringDecoder),
        version: optional(nonEmptyStringDecoder),
        customProperties: optional(anyJson()),
        icon: optional(nonEmptyStringDecoder),
        caption: optional(nonEmptyStringDecoder),
        details: applicationDetailsDecoder,
        intents: optional(array(intentDefinitionDecoder))
    });
    const appDefinitionOperationDecoder = object({
        definitions: array(applicationDefinitionDecoder),
        mode: oneOf(constant("replace"), constant("merge"))
    });
    const appRemoveConfigDecoder = object({
        name: nonEmptyStringDecoder
    });
    const appsExportOperationDecoder = object({
        definitions: array(applicationDefinitionDecoder)
    });
    const applicationDataDecoder = object({
        name: nonEmptyStringDecoder,
        instances: array(instanceDataDecoder),
        userProperties: optional(anyJson()),
        title: optional(nonEmptyStringDecoder),
        version: optional(nonEmptyStringDecoder),
        icon: optional(nonEmptyStringDecoder),
        caption: optional(nonEmptyStringDecoder)
    });
    const baseApplicationDataDecoder = object({
        name: nonEmptyStringDecoder,
        userProperties: anyJson(),
        title: optional(nonEmptyStringDecoder),
        version: optional(nonEmptyStringDecoder),
        icon: optional(nonEmptyStringDecoder),
        caption: optional(nonEmptyStringDecoder)
    });
    const appHelloSuccessDecoder = object({
        apps: array(applicationDataDecoder)
    });
    const basicInstanceDataDecoder = object({
        id: nonEmptyStringDecoder
    });
    const applicationStartConfigDecoder = object({
        name: nonEmptyStringDecoder,
        waitForAGMReady: boolean(),
        context: optional(anyJson()),
        top: optional(number()),
        left: optional(number()),
        width: optional(nonNegativeNumberDecoder),
        height: optional(nonNegativeNumberDecoder),
        relativeTo: optional(nonEmptyStringDecoder),
        relativeDirection: optional(oneOf(constant("top"), constant("left"), constant("right"), constant("bottom")))
    });
    const layoutTypeDecoder = oneOf(constant("Global"), constant("Activity"), constant("ApplicationDefault"), constant("Swimlane"), constant("Workspace"));
    const componentTypeDecoder = oneOf(constant("application"), constant("activity"));
    const windowLayoutComponentDecoder = object({
        type: constant("window"),
        componentType: componentTypeDecoder,
        state: object({
            name: anyJson(),
            context: anyJson(),
            url: nonEmptyStringDecoder,
            bounds: anyJson(),
            id: nonEmptyStringDecoder,
            parentId: optional(nonEmptyStringDecoder),
            main: boolean()
        })
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
    const workspaceLayoutComponentDecoder = object({
        type: constant("Workspace"),
        state: object({
            config: anyJson(),
            context: anyJson(),
            children: array(oneOf(rowLayoutItemDecoder, columnLayoutItemDecoder, groupLayoutItemDecoder, windowLayoutItemDecoder))
        })
    });
    const glueLayoutDecoder = object({
        name: nonEmptyStringDecoder,
        type: layoutTypeDecoder,
        components: array(oneOf(windowLayoutComponentDecoder, workspaceLayoutComponentDecoder)),
        context: optional(anyJson()),
        metadata: optional(anyJson())
    });
    const newLayoutOptionsDecoder = object({
        name: nonEmptyStringDecoder,
        context: optional(anyJson()),
        metadata: optional(anyJson())
    });
    const restoreOptionsDecoder = object({
        name: nonEmptyStringDecoder,
        context: optional(anyJson()),
        closeRunningInstance: optional(boolean())
    });
    const layoutSummaryDecoder = object({
        name: nonEmptyStringDecoder,
        type: layoutTypeDecoder,
        context: optional(anyJson()),
        metadata: optional(anyJson())
    });
    const simpleLayoutConfigDecoder = object({
        name: nonEmptyStringDecoder,
        type: layoutTypeDecoder
    });
    const getAllLayoutsConfigDecoder = object({
        type: layoutTypeDecoder
    });
    const allLayoutsFullConfigDecoder = object({
        layouts: array(glueLayoutDecoder)
    });
    const importModeDecoder = oneOf(constant("replace"), constant("merge"));
    const layoutsImportConfigDecoder = object({
        layouts: array(glueLayoutDecoder),
        mode: importModeDecoder
    });
    const allLayoutsSummariesResultDecoder = object({
        summaries: array(layoutSummaryDecoder)
    });
    const simpleLayoutResult = object({
        layout: glueLayoutDecoder
    });
    const optionalSimpleLayoutResult = object({
        layout: optional(glueLayoutDecoder)
    });
    const intentsOperationTypesDecoder = oneOf(constant("findIntent"), constant("getIntents"), constant("raiseIntent"));
    const intentHandlerDecoder = object({
        applicationName: nonEmptyStringDecoder,
        applicationTitle: string(),
        applicationDescription: optional(string()),
        applicationIcon: optional(string()),
        type: oneOf(constant("app"), constant("instance")),
        displayName: optional(string()),
        contextTypes: optional(array(nonEmptyStringDecoder)),
        instanceId: optional(string()),
        instanceTitle: optional(string())
    });
    const intentDecoder = object({
        name: nonEmptyStringDecoder,
        handlers: array(intentHandlerDecoder)
    });
    const intentTargetDecoder = oneOf(constant("startNew"), constant("reuse"), object({
        app: optional(nonEmptyStringDecoder),
        instance: optional(nonEmptyStringDecoder)
    }));
    const intentContextDecoder = object({
        type: optional(nonEmptyStringDecoder),
        data: optional(object())
    });
    const intentsDecoder = array(intentDecoder);
    const wrappedIntentsDecoder = object({
        intents: intentsDecoder
    });
    const intentFilterDecoder = object({
        name: optional(nonEmptyStringDecoder),
        contextType: optional(nonEmptyStringDecoder)
    });
    const findFilterDecoder = oneOf(nonEmptyStringDecoder, intentFilterDecoder);
    const wrappedIntentFilterDecoder = object({
        filter: optional(intentFilterDecoder)
    });
    const intentRequestDecoder = object({
        intent: nonEmptyStringDecoder,
        target: optional(intentTargetDecoder),
        context: optional(intentContextDecoder),
        options: optional(windowOpenSettingsDecoder)
    });
    const raiseRequestDecoder = oneOf(nonEmptyStringDecoder, intentRequestDecoder);
    const intentResultDecoder = object({
        request: intentRequestDecoder,
        handler: intentHandlerDecoder,
        result: anyJson()
    });
    const addIntentListenerRequestDecoder = object({
        intent: nonEmptyStringDecoder,
        contextTypes: optional(array(nonEmptyStringDecoder)),
        displayName: optional(string()),
        icon: optional(string()),
        description: optional(string())
    });
    const addIntentListenerIntentDecoder = oneOf(nonEmptyStringDecoder, addIntentListenerRequestDecoder);
    const channelNameDecoder = (channelNames) => {
        return nonEmptyStringDecoder.where(s => channelNames.includes(s), "Expected a valid channel name");
    };

    const operations = {
        openWindow: { name: "openWindow", dataDecoder: openWindowConfigDecoder, resultDecoder: coreWindowDataDecoder },
        windowHello: { name: "windowHello", dataDecoder: windowHelloDecoder, resultDecoder: helloSuccessDecoder },
        windowAdded: { name: "windowAdded", dataDecoder: coreWindowDataDecoder },
        windowRemoved: { name: "windowRemoved", dataDecoder: simpleWindowDecoder },
        getBounds: { name: "getBounds", dataDecoder: simpleWindowDecoder, resultDecoder: windowBoundsResultDecoder },
        getUrl: { name: "getUrl", dataDecoder: simpleWindowDecoder, resultDecoder: windowUrlResultDecoder },
        moveResize: { name: "moveResize", dataDecoder: windowMoveResizeConfigDecoder },
        focus: { name: "focus", dataDecoder: simpleWindowDecoder },
        close: { name: "close", dataDecoder: simpleWindowDecoder },
        getTitle: { name: "getTitle", dataDecoder: simpleWindowDecoder, resultDecoder: windowTitleConfigDecoder },
        setTitle: { name: "setTitle", dataDecoder: windowTitleConfigDecoder }
    };

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
        function add(key, callback, replayArgumentsArr) {
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey) {
                callbacksForKey = [];
                callbacks[key] = callbacksForKey;
            }
            callbacksForKey.push(callback);
            if (replayArgumentsArr) {
                setTimeout(function () {
                    replayArgumentsArr.forEach(function (replayArgument) {
                        var _a;
                        if ((_a = callbacks[key]) === null || _a === void 0 ? void 0 : _a.includes(callback)) {
                            try {
                                if (Array.isArray(replayArgument)) {
                                    callback.apply(undefined, replayArgument);
                                }
                                else {
                                    callback.apply(undefined, [replayArgument]);
                                }
                            }
                            catch (err) {
                                _handleError(err, key);
                            }
                        }
                    });
                }, 0);
            }
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

    class WebWindowModel {
        constructor(_id, _name, _bridge) {
            this._id = _id;
            this._name = _name;
            this._bridge = _bridge;
            this.registry = lib();
            this.myCtxKey = `___window___${this.id}`;
        }
        get id() {
            return this._id.slice();
        }
        get name() {
            return this._name.slice();
        }
        clean() {
            if (this.ctxUnsubscribe) {
                this.ctxUnsubscribe();
            }
        }
        toApi() {
            return __awaiter(this, void 0, void 0, function* () {
                this.ctxUnsubscribe = yield this._bridge.contextLib.subscribe(this.myCtxKey, (data) => this.registry.execute("context-updated", data));
                const api = {
                    id: this.id,
                    name: this.name,
                    getURL: this.getURL.bind(this),
                    moveResize: this.moveResize.bind(this),
                    resizeTo: this.resizeTo.bind(this),
                    moveTo: this.moveTo.bind(this),
                    focus: this.focus.bind(this),
                    close: this.close.bind(this),
                    getTitle: this.getTitle.bind(this),
                    setTitle: this.setTitle.bind(this),
                    getBounds: this.getBounds.bind(this),
                    getContext: this.getContext.bind(this),
                    updateContext: this.updateContext.bind(this),
                    setContext: this.setContext.bind(this),
                    onContextUpdated: this.onContextUpdated.bind(this)
                };
                this.me = Object.freeze(api);
                return this.me;
            });
        }
        getURL() {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield this._bridge.send("windows", operations.getUrl, { windowId: this.id });
                return result.url;
            });
        }
        moveResize(dimension) {
            return __awaiter(this, void 0, void 0, function* () {
                const targetBounds = boundsDecoder.runWithException(dimension);
                const commandArgs = Object.assign({}, targetBounds, { windowId: this.id, relative: false });
                yield this._bridge.send("windows", operations.moveResize, commandArgs);
                return this.me;
            });
        }
        resizeTo(width, height) {
            return __awaiter(this, void 0, void 0, function* () {
                if (typeof width === "undefined" && typeof height === "undefined") {
                    return this.me;
                }
                if (typeof width !== "undefined") {
                    nonNegativeNumberDecoder.runWithException(width);
                }
                if (typeof height !== "undefined") {
                    nonNegativeNumberDecoder.runWithException(height);
                }
                const commandArgs = Object.assign({}, { width, height }, { windowId: this.id, relative: true });
                yield this._bridge.send("windows", operations.moveResize, commandArgs);
                return this.me;
            });
        }
        moveTo(top, left) {
            return __awaiter(this, void 0, void 0, function* () {
                if (typeof top === "undefined" && typeof left === "undefined") {
                    return this.me;
                }
                if (typeof top !== "undefined") {
                    number().runWithException(top);
                }
                if (typeof left !== "undefined") {
                    number().runWithException(left);
                }
                const commandArgs = Object.assign({}, { top, left }, { windowId: this.id, relative: true });
                yield this._bridge.send("windows", operations.moveResize, commandArgs);
                return this.me;
            });
        }
        focus() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this._bridge.send("windows", operations.focus, { windowId: this.id });
                return this.me;
            });
        }
        close() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this._bridge.send("windows", operations.close, { windowId: this.id });
                return this.me;
            });
        }
        getTitle() {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield this._bridge.send("windows", operations.getTitle, { windowId: this.id });
                return result.title;
            });
        }
        setTitle(title) {
            return __awaiter(this, void 0, void 0, function* () {
                const ttl = nonEmptyStringDecoder.runWithException(title);
                yield this._bridge.send("windows", operations.setTitle, { windowId: this.id, title: ttl });
                return this.me;
            });
        }
        getBounds() {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield this._bridge.send("windows", operations.getBounds, { windowId: this.id });
                return result.bounds;
            });
        }
        getContext() {
            return __awaiter(this, void 0, void 0, function* () {
                const ctx = yield this._bridge.contextLib.get(this.myCtxKey);
                return ctx;
            });
        }
        updateContext(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const ctx = anyDecoder.runWithException(context);
                yield this._bridge.contextLib.update(this.myCtxKey, ctx);
                return this.me;
            });
        }
        setContext(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const ctx = anyDecoder.runWithException(context);
                yield this._bridge.contextLib.set(this.myCtxKey, ctx);
                return this.me;
            });
        }
        onContextUpdated(callback) {
            if (typeof callback !== "function") {
                throw new Error("Cannot subscribe to context changes, because the provided callback is not a function!");
            }
            const wrappedCallback = (data) => {
                callback(data, this.me);
            };
            return this.registry.add("context-updated", wrappedCallback);
        }
    }

    class WindowsController {
        constructor() {
            this.registry = lib();
            this.allWindowProjections = [];
        }
        start(coreGlue, ioc) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger = coreGlue.logger.subLogger("windows.controller.web");
                this.logger.trace("starting the web windows controller");
                this.publicWindowId = coreGlue.connection.transport.publicWindowId;
                this.actualWindowId = coreGlue.interop.instance.windowId;
                this.addWindowOperationExecutors();
                this.ioc = ioc;
                this.bridge = ioc.bridge;
                this.logger.trace(`set the public window id: ${this.publicWindowId} and actual window id: ${this.actualWindowId}, set the bridge operations and ioc, registering with the platform now`);
                this.platformRegistration = this.registerWithPlatform();
                yield this.platformRegistration;
                this.logger.trace("registration with the platform successful, attaching the windows property to glue and returning");
                const api = this.toApi();
                coreGlue.windows = api;
            });
        }
        handleBridgeMessage(args) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.platformRegistration;
                const operationName = windowOperationTypesDecoder.runWithException(args.operation);
                const operation = operations[operationName];
                if (!operation.execute) {
                    return;
                }
                let operationData = args.data;
                if (operation.dataDecoder) {
                    operationData = operation.dataDecoder.runWithException(args.data);
                }
                return yield operation.execute(operationData);
            });
        }
        open(name, url, options) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(name);
                nonEmptyStringDecoder.runWithException(url);
                const settings = windowOpenSettingsDecoder.runWithException(options);
                const windowSuccess = yield this.bridge.send("windows", operations.openWindow, { name, url, options: settings });
                const projection = yield this.ioc.buildWebWindow(windowSuccess.windowId, windowSuccess.name);
                return projection.api;
            });
        }
        list() {
            return this.allWindowProjections.map((projection) => projection.api);
        }
        findById(id) {
            var _a;
            nonEmptyStringDecoder.runWithException(id);
            return (_a = this.allWindowProjections.find((projection) => projection.id === id)) === null || _a === void 0 ? void 0 : _a.api;
        }
        toApi() {
            return {
                open: this.open.bind(this),
                my: this.my.bind(this),
                list: this.list.bind(this),
                findById: this.findById.bind(this),
                onWindowAdded: this.onWindowAdded.bind(this),
                onWindowRemoved: this.onWindowRemoved.bind(this)
            };
        }
        addWindowOperationExecutors() {
            operations.windowAdded.execute = this.handleWindowAdded.bind(this);
            operations.windowRemoved.execute = this.handleWindowRemoved.bind(this);
            operations.getBounds.execute = this.handleGetBounds.bind(this);
            operations.getTitle.execute = this.handleGetTitle.bind(this);
            operations.getUrl.execute = this.handleGetUrl.bind(this);
            operations.moveResize.execute = this.handleMoveResize.bind(this);
            operations.setTitle.execute = this.handleSetTitle.bind(this);
        }
        my() {
            return Object.assign({}, this.me);
        }
        onWindowAdded(callback) {
            if (typeof callback !== "function") {
                throw new Error("Cannot subscribe to window added, because the provided callback is not a function!");
            }
            return this.registry.add("window-added", callback);
        }
        onWindowRemoved(callback) {
            if (typeof callback !== "function") {
                throw new Error("Cannot subscribe to window removed, because the provided callback is not a function!");
            }
            return this.registry.add("window-removed", callback);
        }
        sayHello() {
            return __awaiter(this, void 0, void 0, function* () {
                const helloSuccess = yield this.bridge.send("windows", operations.windowHello, { windowId: this.actualWindowId });
                return helloSuccess;
            });
        }
        registerWithPlatform() {
            return __awaiter(this, void 0, void 0, function* () {
                const { windows, isWorkspaceFrame } = yield this.sayHello();
                this.logger.trace("the platform responded to the hello message");
                if (!isWorkspaceFrame) {
                    this.logger.trace("i am not treated as a workspace frame, setting my window");
                    const myWindow = windows.find((w) => w.windowId === this.publicWindowId);
                    if (!myWindow) {
                        throw new Error("Cannot initialize the window library, because I received no information about me from the platform");
                    }
                    this.me = (yield this.ioc.buildWebWindow(this.publicWindowId, myWindow.name)).api;
                }
                const currentWindows = yield Promise.all(windows.map((w) => this.ioc.buildWebWindow(w.windowId, w.name)));
                this.logger.trace("all windows projections are completed, building the list collection");
                this.allWindowProjections.push(...currentWindows);
            });
        }
        handleWindowAdded(data) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.allWindowProjections.some((projection) => projection.id === data.windowId)) {
                    return;
                }
                const webWindowProjection = yield this.ioc.buildWebWindow(data.windowId, data.name);
                this.allWindowProjections.push(webWindowProjection);
                this.registry.execute("window-added", webWindowProjection.api);
            });
        }
        handleWindowRemoved(data) {
            return __awaiter(this, void 0, void 0, function* () {
                const removed = this.allWindowProjections.find((w) => w.id === data.windowId);
                if (!removed) {
                    return;
                }
                this.allWindowProjections = this.allWindowProjections.filter((w) => w.id !== data.windowId);
                removed.model.clean();
                this.registry.execute("window-removed", removed.api);
            });
        }
        handleGetBounds() {
            return __awaiter(this, void 0, void 0, function* () {
                return {
                    windowId: this.me.id,
                    bounds: {
                        top: window.screenTop,
                        left: window.screenLeft,
                        width: window.innerWidth,
                        height: window.innerHeight
                    }
                };
            });
        }
        handleGetTitle() {
            return __awaiter(this, void 0, void 0, function* () {
                return {
                    windowId: this.me.id,
                    title: document.title
                };
            });
        }
        handleGetUrl() {
            return __awaiter(this, void 0, void 0, function* () {
                return {
                    windowId: this.me.id,
                    url: window.location.href
                };
            });
        }
        handleMoveResize(config) {
            return __awaiter(this, void 0, void 0, function* () {
                const targetTop = typeof config.top === "number" ? config.top :
                    config.relative ? 0 : window.screenTop;
                const targetLeft = typeof config.left === "number" ? config.left :
                    config.relative ? 0 : window.screenLeft;
                const targetHeight = typeof config.height === "number" ? config.height :
                    config.relative ? 0 : window.innerHeight;
                const targetWidth = typeof config.width === "number" ? config.width :
                    config.relative ? 0 : window.innerWidth;
                const moveMethod = config.relative ? window.moveBy : window.moveTo;
                const resizeMethod = config.relative ? window.resizeBy : window.resizeTo;
                moveMethod(targetLeft, targetTop);
                resizeMethod(targetWidth, targetHeight);
            });
        }
        handleSetTitle(config) {
            return __awaiter(this, void 0, void 0, function* () {
                document.title = config.title;
            });
        }
    }

    const PromiseWrap = (promise, timeoutMilliseconds, timeoutMessage) => {
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
    const PromisePlus = (executor, timeoutMilliseconds, timeoutMessage) => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                const message = timeoutMessage || `Promise timeout hit: ${timeoutMilliseconds}`;
                reject(message);
            }, timeoutMilliseconds);
            const providedPromise = new Promise(executor);
            providedPromise
                .then((result) => {
                clearTimeout(timeout);
                resolve(result);
            })
                .catch((error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    };

    const GlueWebPlatformControlName = "T42.Web.Platform.Control";
    const GlueWebPlatformStreamName = "T42.Web.Platform.Stream";
    const GlueClientControlName = "T42.Web.Client.Control";

    class GlueBridge {
        constructor(coreGlue) {
            this.coreGlue = coreGlue;
            this.platformMethodTimeoutMs = 10000;
        }
        get contextLib() {
            return this.coreGlue.contexts;
        }
        get interopInstance() {
            return this.coreGlue.interop.instance.instance;
        }
        start(controllers) {
            return __awaiter(this, void 0, void 0, function* () {
                this.controllers = controllers;
                yield Promise.all([
                    this.checkWaitMethod(GlueWebPlatformControlName),
                    this.checkWaitMethod(GlueWebPlatformStreamName)
                ]);
                const [sub] = yield Promise.all([
                    this.coreGlue.interop.subscribe(GlueWebPlatformStreamName),
                    this.coreGlue.interop.registerAsync(GlueClientControlName, (args, _, success, error) => this.passMessageController(args, success, error))
                ]);
                this.sub = sub;
                this.sub.onData((pkg) => this.passMessageController(pkg.data));
            });
        }
        getInteropInstance(windowId) {
            const result = this.coreGlue.interop.servers().find((s) => s.windowId && s.windowId === windowId);
            return {
                application: result === null || result === void 0 ? void 0 : result.application,
                applicationName: result === null || result === void 0 ? void 0 : result.applicationName,
                peerId: result === null || result === void 0 ? void 0 : result.peerId,
                instance: result === null || result === void 0 ? void 0 : result.instance,
                windowId: result === null || result === void 0 ? void 0 : result.windowId
            };
        }
        send(domain, operation, operationData) {
            return __awaiter(this, void 0, void 0, function* () {
                if (operation.dataDecoder) {
                    try {
                        operation.dataDecoder.runWithException(operationData);
                    }
                    catch (error) {
                        throw new Error(`Unexpected internal outgoing validation error: ${error.message}, for operation: ${operation.name} and input: ${JSON.stringify(error.input)}`);
                    }
                }
                let operationResult;
                try {
                    operationResult = yield this.transmitMessage(domain, operation, operationData);
                    if (operation.resultDecoder) {
                        operationResult = operation.resultDecoder.runWithException(operationResult);
                    }
                }
                catch (error) {
                    if (error.kind) {
                        throw new Error(`Unexpected internal incoming validation error: ${error.message}, for operation: ${operation.name} and input: ${JSON.stringify(error.input)}`);
                    }
                    throw new Error(error.message);
                }
                return operationResult;
            });
        }
        checkWaitMethod(name) {
            return PromisePlus((resolve) => {
                const hasMethod = this.coreGlue.interop.methods().some((method) => method.name === name);
                if (hasMethod) {
                    return resolve();
                }
                const unSub = this.coreGlue.interop.methodAdded((method) => {
                    if (method.name === name) {
                        unSub();
                        resolve();
                    }
                });
            }, this.platformMethodTimeoutMs, `Cannot initiate Glue Web, because a system method's discovery timed out: ${name}`);
        }
        passMessageController(args, success, error) {
            const decodeResult = libDomainDecoder.run(args.domain);
            if (!decodeResult.ok) {
                if (error) {
                    error(`Cannot execute this client control, because of domain validation error: ${JSON.stringify(decodeResult.error)}`);
                }
                return;
            }
            const domain = decodeResult.result;
            this.controllers[domain]
                .handleBridgeMessage(args)
                .then((resolutionData) => {
                if (success) {
                    success(resolutionData);
                }
            })
                .catch((err) => {
                if (error) {
                    error(err);
                }
                console.warn(err);
            });
        }
        transmitMessage(domain, operation, data) {
            return __awaiter(this, void 0, void 0, function* () {
                const messageData = { domain, data, operation: operation.name };
                let invocationResult;
                const baseErrorMessage = `Internal Platform Communication Error. Attempted operation: ${JSON.stringify(operation.name)} with data: ${JSON.stringify(data)}. `;
                try {
                    invocationResult = yield this.coreGlue.interop.invoke(GlueWebPlatformControlName, messageData);
                    if (!invocationResult) {
                        throw new Error("Received unsupported result from the platform - empty result");
                    }
                    if (!Array.isArray(invocationResult.all_return_values) || invocationResult.all_return_values.length === 0) {
                        throw new Error("Received unsupported result from the platform - empty values collection");
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
    }

    const operations$1 = {
        appHello: { name: "appHello", dataDecoder: windowHelloDecoder, resultDecoder: appHelloSuccessDecoder },
        applicationAdded: { name: "applicationAdded", dataDecoder: baseApplicationDataDecoder },
        applicationRemoved: { name: "applicationRemoved", dataDecoder: baseApplicationDataDecoder },
        applicationChanged: { name: "applicationChanged", dataDecoder: baseApplicationDataDecoder },
        instanceStarted: { name: "instanceStarted", dataDecoder: instanceDataDecoder },
        instanceStopped: { name: "instanceStopped", dataDecoder: instanceDataDecoder },
        applicationStart: { name: "applicationStart", dataDecoder: applicationStartConfigDecoder, resultDecoder: instanceDataDecoder },
        instanceStop: { name: "instanceStop", dataDecoder: basicInstanceDataDecoder },
        import: { name: "import" },
        remove: { name: "remove", dataDecoder: appRemoveConfigDecoder },
        export: { name: "export", resultDecoder: appsExportOperationDecoder }
    };

    class AppManagerController {
        constructor() {
            this.registry = lib();
            this.applications = [];
            this.instances = [];
        }
        start(coreGlue, ioc) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger = coreGlue.logger.subLogger("appManger.controller.web");
                this.logger.trace("starting the web appManager controller");
                this.publicWindowId = coreGlue.connection.transport.publicWindowId;
                this.actualWindowId = coreGlue.interop.instance.windowId;
                this.addOperationsExecutors();
                this.ioc = ioc;
                this.bridge = ioc.bridge;
                this.platformRegistration = this.registerWithPlatform();
                yield this.platformRegistration;
                this.logger.trace("registration with the platform successful, attaching the appManager property to glue and returning");
                const api = this.toApi();
                coreGlue.appManager = api;
            });
        }
        handleBridgeMessage(args) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.platformRegistration;
                const operationName = appManagerOperationTypesDecoder.runWithException(args.operation);
                const operation = operations$1[operationName];
                if (!operation.execute) {
                    return;
                }
                let operationData = args.data;
                if (operation.dataDecoder) {
                    operationData = operation.dataDecoder.runWithException(args.data);
                }
                return yield operation.execute(operationData);
            });
        }
        onInstanceStarted(callback) {
            return this.registry.add("instance-started", callback, this.instances);
        }
        onInstanceStopped(callback) {
            return this.registry.add("instance-stopped", callback);
        }
        startApplication(appName, context, options) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const startOptions = {
                    name: appName,
                    waitForAGMReady: (_a = options === null || options === void 0 ? void 0 : options.waitForAGMReady) !== null && _a !== void 0 ? _a : true,
                    context,
                    top: options === null || options === void 0 ? void 0 : options.top,
                    left: options === null || options === void 0 ? void 0 : options.left,
                    width: options === null || options === void 0 ? void 0 : options.width,
                    height: options === null || options === void 0 ? void 0 : options.height,
                    relativeTo: options === null || options === void 0 ? void 0 : options.relativeTo,
                    relativeDirection: options === null || options === void 0 ? void 0 : options.relativeDirection
                };
                const openResult = yield this.bridge.send("appManager", operations$1.applicationStart, startOptions);
                const app = this.applications.find((a) => a.name === openResult.applicationName);
                return this.ioc.buildInstance(openResult, app);
            });
        }
        toApi() {
            const api = {
                myInstance: this.me,
                import: this.import.bind(this),
                remove: this.remove.bind(this),
                export: this.export.bind(this),
                application: this.getApplication.bind(this),
                applications: this.getApplications.bind(this),
                instances: this.getInstances.bind(this),
                onAppAdded: this.onAppAdded.bind(this),
                onAppChanged: this.onAppChanged.bind(this),
                onAppRemoved: this.onAppRemoved.bind(this),
                onInstanceStarted: this.onInstanceStarted.bind(this),
                onInstanceStopped: this.onInstanceStopped.bind(this)
            };
            return Object.freeze(api);
        }
        addOperationsExecutors() {
            operations$1.applicationAdded.execute = this.handleApplicationAddedMessage.bind(this);
            operations$1.applicationRemoved.execute = this.handleApplicationRemovedMessage.bind(this);
            operations$1.applicationChanged.execute = this.handleApplicationChangedMessage.bind(this);
            operations$1.instanceStarted.execute = this.handleInstanceStartedMessage.bind(this);
            operations$1.instanceStopped.execute = this.handleInstanceStoppedMessage.bind(this);
        }
        onAppAdded(callback) {
            return this.registry.add("application-added", callback, this.applications);
        }
        onAppRemoved(callback) {
            return this.registry.add("application-removed", callback);
        }
        onAppChanged(callback) {
            return this.registry.add("application-changed", callback);
        }
        handleApplicationAddedMessage(appData) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.applications.some((app) => app.name === appData.name)) {
                    return;
                }
                const app = yield this.ioc.buildApplication(appData, []);
                const instances = this.instances.filter((instance) => instance.application.name === app.name);
                app.instances.push(...instances);
                this.applications.push(app);
                this.registry.execute("application-added", app);
            });
        }
        handleApplicationRemovedMessage(appData) {
            return __awaiter(this, void 0, void 0, function* () {
                const appIndex = this.applications.findIndex((app) => app.name === appData.name);
                if (appIndex < 0) {
                    return;
                }
                const app = this.applications[appIndex];
                this.applications.splice(appIndex, 1);
                this.registry.execute("application-removed", app);
            });
        }
        handleApplicationChangedMessage(appData) {
            return __awaiter(this, void 0, void 0, function* () {
                const app = this.applications.find((app) => app.name === appData.name);
                if (!app) {
                    return this.handleApplicationAddedMessage(appData);
                }
                app.title = appData.title;
                app.version = appData.version;
                app.icon = appData.icon;
                app.caption = appData.caption;
                app.userProperties = appData.userProperties;
                this.registry.execute("application-changed", app);
            });
        }
        handleInstanceStartedMessage(instanceData) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.instances.some((instance) => instance.id === instanceData.id)) {
                    return;
                }
                const application = this.applications.find((app) => app.name === instanceData.applicationName);
                if (!application) {
                    throw new Error(`Cannot add instance: ${instanceData.id}, because there is no application definition associated with it`);
                }
                const instance = this.ioc.buildInstance(instanceData, application);
                this.instances.push(instance);
                application.instances.push(instance);
                this.registry.execute("instance-started", instance);
            });
        }
        handleInstanceStoppedMessage(instanceData) {
            return __awaiter(this, void 0, void 0, function* () {
                const instance = this.instances.find((i) => i.id === instanceData.id);
                if (instance) {
                    const instIdx = this.instances.findIndex((inst) => inst.id === instanceData.id);
                    this.instances.splice(instIdx, 1);
                }
                const application = this.applications.find((app) => app.instances.some((inst) => inst.id === instanceData.id));
                if (application) {
                    const instIdxApps = application.instances.findIndex((inst) => inst.id === instanceData.id);
                    application.instances.splice(instIdxApps, 1);
                }
                if (!instance) {
                    return;
                }
                this.registry.execute("instance-stopped", instance);
            });
        }
        import(definitions, mode = "replace") {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send("appManager", operations$1.import, { definitions, mode });
            });
        }
        remove(name) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(name);
                yield this.bridge.send("appManager", operations$1.remove, { name });
            });
        }
        export() {
            return __awaiter(this, void 0, void 0, function* () {
                const response = yield this.bridge.send("appManager", operations$1.export, undefined);
                return response.definitions;
            });
        }
        getApplication(name) {
            const verifiedName = nonEmptyStringDecoder.runWithException(name);
            return this.applications.find((app) => app.name === verifiedName);
        }
        getApplications() {
            return this.applications.slice();
        }
        getInstances() {
            return this.instances.slice();
        }
        registerWithPlatform() {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield this.bridge.send("appManager", operations$1.appHello, { windowId: this.actualWindowId });
                this.logger.trace("the platform responded to the hello message with a full list of apps");
                this.applications = yield Promise.all(result.apps.map((app) => this.ioc.buildApplication(app, app.instances)));
                this.instances = this.applications.reduce((instancesSoFar, app) => {
                    instancesSoFar.push(...app.instances);
                    return instancesSoFar;
                }, []);
                this.me = this.findMyInstance();
                this.logger.trace(`all applications were parsed and saved. I am ${this.me ? "NOT a" : "a"} valid instance`);
            });
        }
        findMyInstance() {
            for (const app of this.applications) {
                const foundInstance = app.instances.find((instance) => instance.id === this.publicWindowId);
                if (foundInstance) {
                    return foundInstance;
                }
            }
        }
    }

    class InstanceModel {
        constructor(data, bridge, application) {
            this.data = data;
            this.bridge = bridge;
            this.application = application;
            this.myCtxKey = `___instance___${this.data.id}`;
        }
        toApi() {
            const agm = this.bridge.getInteropInstance(this.data.id);
            const api = {
                id: this.data.id,
                agm,
                application: this.application,
                stop: this.stop.bind(this),
                getContext: this.getContext.bind(this)
            };
            this.me = Object.freeze(api);
            return this.me;
        }
        getContext() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.bridge.contextLib.get(this.myCtxKey);
            });
        }
        stop() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.bridge.send("appManager", operations$1.instanceStop, { id: this.data.id });
            });
        }
    }

    class ApplicationModel {
        constructor(data, instances, controller) {
            this.data = data;
            this.instances = instances;
            this.controller = controller;
        }
        toApi() {
            const api = {
                name: this.data.name,
                title: this.data.title,
                version: this.data.version,
                icon: this.data.icon,
                caption: this.data.caption,
                userProperties: this.data.userProperties,
                instances: this.instances,
                start: this.start.bind(this),
                onInstanceStarted: this.onInstanceStarted.bind(this),
                onInstanceStopped: this.onInstanceStopped.bind(this)
            };
            this.me = api;
            return this.me;
        }
        onInstanceStarted(callback) {
            if (typeof callback !== "function") {
                throw new Error("OnInstanceStarted requires a single argument of type function");
            }
            this.controller.onInstanceStarted((instance) => {
                if (instance.application.name === this.data.name) {
                    callback(instance);
                }
            });
        }
        onInstanceStopped(callback) {
            if (typeof callback !== "function") {
                throw new Error("OnInstanceStarted requires a single argument of type function");
            }
            this.controller.onInstanceStopped((instance) => {
                if (instance.application.name === this.data.name) {
                    callback(instance);
                }
            });
        }
        start(context, options) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.controller.startApplication(this.data.name, context, options);
            });
        }
    }

    const operations$2 = {
        layoutAdded: { name: "layoutAdded", dataDecoder: glueLayoutDecoder },
        layoutChanged: { name: "layoutChanged", dataDecoder: glueLayoutDecoder },
        layoutRemoved: { name: "layoutRemoved", dataDecoder: glueLayoutDecoder },
        get: { name: "get", dataDecoder: simpleLayoutConfigDecoder, resultDecoder: optionalSimpleLayoutResult },
        getAll: { name: "getAll", dataDecoder: getAllLayoutsConfigDecoder, resultDecoder: allLayoutsSummariesResultDecoder },
        export: { name: "export", dataDecoder: getAllLayoutsConfigDecoder, resultDecoder: allLayoutsFullConfigDecoder },
        import: { name: "import", dataDecoder: layoutsImportConfigDecoder },
        remove: { name: "remove", dataDecoder: simpleLayoutConfigDecoder }
    };

    class LayoutsController {
        constructor() {
            this.registry = lib();
        }
        start(coreGlue, ioc) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger = coreGlue.logger.subLogger("layouts.controller.web");
                this.logger.trace("starting the web layouts controller");
                this.bridge = ioc.bridge;
                this.addOperationsExecutors();
                const api = this.toApi();
                this.logger.trace("no need for platform registration, attaching the layouts property to glue and returning");
                coreGlue.layouts = api;
            });
        }
        handleBridgeMessage(args) {
            return __awaiter(this, void 0, void 0, function* () {
                const operationName = layoutsOperationTypesDecoder.runWithException(args.operation);
                const operation = operations$2[operationName];
                if (!operation.execute) {
                    return;
                }
                let operationData = args.data;
                if (operation.dataDecoder) {
                    operationData = operation.dataDecoder.runWithException(args.data);
                }
                return yield operation.execute(operationData);
            });
        }
        toApi() {
            const api = {
                get: this.get.bind(this),
                getAll: this.getAll.bind(this),
                export: this.export.bind(this),
                import: this.import.bind(this),
                save: this.save.bind(this),
                restore: this.restore.bind(this),
                remove: this.remove.bind(this),
                onAdded: this.onAdded.bind(this),
                onChanged: this.onChanged.bind(this),
                onRemoved: this.onRemoved.bind(this)
            };
            return Object.freeze(api);
        }
        addOperationsExecutors() {
            operations$2.layoutAdded.execute = this.handleOnAdded.bind(this);
            operations$2.layoutChanged.execute = this.handleOnChanged.bind(this);
            operations$2.layoutRemoved.execute = this.handleOnRemoved.bind(this);
        }
        get(name, type) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(name);
                layoutTypeDecoder.runWithException(type);
                const result = yield this.bridge.send("layouts", operations$2.get, { name, type });
                return result.layout;
            });
        }
        getAll(type) {
            return __awaiter(this, void 0, void 0, function* () {
                layoutTypeDecoder.runWithException(type);
                const result = yield this.bridge.send("layouts", operations$2.getAll, { type });
                return result.summaries;
            });
        }
        export(type) {
            return __awaiter(this, void 0, void 0, function* () {
                if (type) {
                    layoutTypeDecoder.runWithException(type);
                }
                const result = yield this.bridge.send("layouts", operations$2.export, { type: "Workspace" });
                return result.layouts;
            });
        }
        import(layouts, mode = "replace") {
            return __awaiter(this, void 0, void 0, function* () {
                layouts.forEach((layout) => glueLayoutDecoder.runWithException(layout));
                importModeDecoder.runWithException(mode);
                yield this.bridge.send("layouts", operations$2.import, { layouts, mode });
            });
        }
        save(layout) {
            return __awaiter(this, void 0, void 0, function* () {
                newLayoutOptionsDecoder.runWithException(layout);
                throw new Error("Save is not supported in Core at the moment");
            });
        }
        restore(options) {
            return __awaiter(this, void 0, void 0, function* () {
                restoreOptionsDecoder.runWithException(options);
                throw new Error("Restore is not supported in Core at the moment");
            });
        }
        remove(type, name) {
            return __awaiter(this, void 0, void 0, function* () {
                layoutTypeDecoder.runWithException(type);
                nonEmptyStringDecoder.runWithException(name);
                yield this.bridge.send("layouts", operations$2.remove, { type, name });
            });
        }
        onAdded(callback) {
            return this.registry.add(operations$2.layoutAdded.name, callback);
        }
        onChanged(callback) {
            return this.registry.add(operations$2.layoutChanged.name, callback);
        }
        onRemoved(callback) {
            return this.registry.add(operations$2.layoutRemoved.name, callback);
        }
        handleOnAdded(layout) {
            return __awaiter(this, void 0, void 0, function* () {
                this.registry.execute(operations$2.layoutAdded.name, layout);
            });
        }
        handleOnChanged(layout) {
            return __awaiter(this, void 0, void 0, function* () {
                this.registry.execute(operations$2.layoutChanged.name, layout);
            });
        }
        handleOnRemoved(layout) {
            return __awaiter(this, void 0, void 0, function* () {
                this.registry.execute(operations$2.layoutRemoved.name, layout);
            });
        }
    }

    class NotificationsController {
        start(coreGlue) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger = coreGlue.logger.subLogger("notifications.controller.web");
                this.logger.trace("starting the web notifications controller");
                this.interop = coreGlue.interop;
                const api = this.toApi();
                coreGlue.notifications = api;
                this.logger.trace("notifications are ready");
            });
        }
        handleBridgeMessage() {
            return __awaiter(this, void 0, void 0, function* () {
            });
        }
        toApi() {
            const api = {
                raise: this.raise.bind(this)
            };
            return Object.freeze(api);
        }
        raise(options) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!("Notification" in window)) {
                    throw new Error("this browser does not support desktop notification");
                }
                let permissionPromise;
                if (Notification.permission === "granted") {
                    permissionPromise = Promise.resolve("granted");
                }
                else if (Notification.permission === "denied") {
                    permissionPromise = Promise.reject("no permissions from user");
                }
                else {
                    permissionPromise = Notification.requestPermission();
                }
                yield permissionPromise;
                const notification = this.raiseUsingWebApi(options);
                if (options.clickInterop) {
                    const interopOptions = options.clickInterop;
                    notification.onclick = () => {
                        var _a, _b;
                        this.interop.invoke(interopOptions.method, (_a = interopOptions === null || interopOptions === void 0 ? void 0 : interopOptions.arguments) !== null && _a !== void 0 ? _a : {}, (_b = interopOptions === null || interopOptions === void 0 ? void 0 : interopOptions.target) !== null && _b !== void 0 ? _b : "best");
                    };
                }
                return notification;
            });
        }
        raiseUsingWebApi(options) {
            return new Notification(options.title);
        }
    }

    const operations$3 = {
        getIntents: { name: "getIntents", resultDecoder: wrappedIntentsDecoder },
        findIntent: { name: "findIntent", dataDecoder: wrappedIntentFilterDecoder, resultDecoder: wrappedIntentsDecoder },
        raiseIntent: { name: "raiseIntent", dataDecoder: intentRequestDecoder, resultDecoder: intentResultDecoder }
    };

    class IntentsController {
        constructor() {
            this.GlueWebIntentsPrefix = "Tick42.FDC3.Intents.";
        }
        start(coreGlue, ioc) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger = coreGlue.logger.subLogger("intents.controller.web");
                this.logger.trace("starting the web intents controller");
                this.bridge = ioc.bridge;
                this.interop = coreGlue.interop;
                const api = this.toApi();
                this.logger.trace("no need for platform registration, attaching the intents property to glue and returning");
                coreGlue.intents = api;
            });
        }
        handleBridgeMessage(args) {
            return __awaiter(this, void 0, void 0, function* () {
                const operationName = intentsOperationTypesDecoder.runWithException(args.operation);
                const operation = operations$3[operationName];
                if (!operation.execute) {
                    return;
                }
                let operationData = args.data;
                if (operation.dataDecoder) {
                    operationData = operation.dataDecoder.runWithException(args.data);
                }
                return yield operation.execute(operationData);
            });
        }
        toApi() {
            const api = {
                raise: this.raise.bind(this),
                all: this.all.bind(this),
                addIntentListener: this.addIntentListener.bind(this),
                find: this.find.bind(this)
            };
            return Object.freeze(api);
        }
        raise(request) {
            return __awaiter(this, void 0, void 0, function* () {
                const requestObj = raiseRequestDecoder.runWithException(request);
                let data;
                if (typeof requestObj === "string") {
                    data = {
                        intent: requestObj
                    };
                }
                else {
                    data = requestObj;
                }
                const result = yield this.bridge.send("intents", operations$3.raiseIntent, data);
                return result;
            });
        }
        all() {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield this.bridge.send("intents", operations$3.getIntents, undefined);
                return result.intents;
            });
        }
        addIntentListener(intent, handler) {
            addIntentListenerIntentDecoder.runWithException(intent);
            if (typeof handler !== "function") {
                throw new Error("Cannot add intent listener, because the provided handler is not a function!");
            }
            let subscribed = true;
            const intentName = typeof intent === "string" ? intent : intent.intent;
            const methodName = `${this.GlueWebIntentsPrefix}${intentName}`;
            const result = {
                unsubscribe: () => {
                    subscribed = false;
                    try {
                        this.interop.unregister(methodName);
                    }
                    catch (error) {
                        this.logger.trace(`Unsubscribed intent listener, but ${methodName} unregistration failed!`);
                    }
                }
            };
            const methodDescription = typeof intent === "string" ? undefined : JSON.stringify(intent);
            this.interop.register({ name: methodName, description: methodDescription }, (args) => {
                if (subscribed) {
                    return handler(args);
                }
            });
            return result;
        }
        find(intentFilter) {
            return __awaiter(this, void 0, void 0, function* () {
                let data = undefined;
                if (typeof intentFilter !== "undefined") {
                    const intentFilterObj = findFilterDecoder.runWithException(intentFilter);
                    if (typeof intentFilterObj === "string") {
                        data = {
                            filter: {
                                name: intentFilterObj
                            }
                        };
                    }
                    else if (typeof intentFilterObj === "object") {
                        data = {
                            filter: intentFilterObj
                        };
                    }
                }
                const result = yield this.bridge.send("intents", operations$3.findIntent, data);
                return result.intents;
            });
        }
    }

    class ChannelsController {
        constructor() {
            this.registry = lib();
            this.GlueWebChannelsPrefix = "___channel___";
            this.SubsKey = "subs";
            this.ChangedKey = "changed";
        }
        start(coreGlue) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger = coreGlue.logger.subLogger("channels.controller.web");
                this.logger.trace("starting the web channels controller");
                this.contexts = coreGlue.contexts;
                this.logger.trace("no need for platform registration, attaching the channels property to glue and returning");
                const api = this.toApi();
                coreGlue.channels = api;
            });
        }
        handleBridgeMessage() {
            return __awaiter(this, void 0, void 0, function* () {
            });
        }
        toApi() {
            const api = {
                subscribe: this.subscribe.bind(this),
                subscribeFor: this.subscribeFor.bind(this),
                publish: this.publish.bind(this),
                all: this.all.bind(this),
                list: this.list.bind(this),
                get: this.get.bind(this),
                join: this.join.bind(this),
                leave: this.leave.bind(this),
                current: this.current.bind(this),
                my: this.my.bind(this),
                changed: this.changed.bind(this),
                onChanged: this.onChanged.bind(this),
                add: this.add.bind(this)
            };
            return Object.freeze(api);
        }
        createContextName(channelName) {
            return `${this.GlueWebChannelsPrefix}${channelName}`;
        }
        getAllChannelNames() {
            const contextNames = this.contexts.all();
            const channelContextNames = contextNames.filter((contextName) => contextName.startsWith(this.GlueWebChannelsPrefix));
            const channelNames = channelContextNames.map((channelContextName) => channelContextName.replace(this.GlueWebChannelsPrefix, ""));
            return channelNames;
        }
        unsubscribe() {
            if (this.unsubscribeFunc) {
                this.unsubscribeFunc();
                this.unsubscribeFunc = undefined;
            }
        }
        switchToChannel(name) {
            return __awaiter(this, void 0, void 0, function* () {
                this.unsubscribe();
                this.currentChannelName = name;
                if (typeof name !== "undefined") {
                    const contextName = this.createContextName(name);
                    this.unsubscribeFunc = yield this.contexts.subscribe(contextName, (context, _, __, ___, extraData) => {
                        this.registry.execute(this.SubsKey, context.data, context, extraData === null || extraData === void 0 ? void 0 : extraData.updaterId);
                    });
                }
                this.registry.execute(this.ChangedKey, name);
            });
        }
        updateData(name, data) {
            return __awaiter(this, void 0, void 0, function* () {
                const contextName = this.createContextName(name);
                if (this.contexts.setPathSupported) {
                    const pathValues = Object.keys(data).map((key) => {
                        return {
                            path: `data.${key}`,
                            value: data[key]
                        };
                    });
                    yield this.contexts.setPaths(contextName, pathValues);
                }
                else {
                    yield this.contexts.update(contextName, { data });
                }
            });
        }
        subscribe(callback) {
            if (typeof callback !== "function") {
                throw new Error("Cannot subscribe to channels, because the provided callback is not a function!");
            }
            return this.registry.add(this.SubsKey, callback);
        }
        subscribeFor(name, callback) {
            return __awaiter(this, void 0, void 0, function* () {
                const channelNames = this.getAllChannelNames();
                channelNameDecoder(channelNames).runWithException(name);
                if (typeof callback !== "function") {
                    throw new Error(`Cannot subscribe to channel ${name}, because the provided callback is not a function!`);
                }
                const contextName = this.createContextName(name);
                return this.contexts.subscribe(contextName, (context, _, __, ___, extraData) => {
                    callback(context.data, context, extraData === null || extraData === void 0 ? void 0 : extraData.updaterId);
                });
            });
        }
        publish(data, name) {
            if (typeof data !== "object") {
                throw new Error("Cannot publish to channel, because the provided data is not an object!");
            }
            if (typeof name !== "undefined") {
                const channelNames = this.getAllChannelNames();
                channelNameDecoder(channelNames).runWithException(name);
                return this.updateData(name, data);
            }
            if (typeof this.currentChannelName === "undefined") {
                throw new Error("Cannot publish to channel, because not joined to a channel!");
            }
            return this.updateData(this.currentChannelName, data);
        }
        all() {
            return __awaiter(this, void 0, void 0, function* () {
                const channelNames = this.getAllChannelNames();
                return channelNames;
            });
        }
        list() {
            return __awaiter(this, void 0, void 0, function* () {
                const channelNames = this.getAllChannelNames();
                const channelContexts = yield Promise.all(channelNames.map((channelName) => this.get(channelName)));
                return channelContexts;
            });
        }
        get(name) {
            const channelNames = this.getAllChannelNames();
            channelNameDecoder(channelNames).runWithException(name);
            const contextName = this.createContextName(name);
            return this.contexts.get(contextName);
        }
        join(name) {
            return __awaiter(this, void 0, void 0, function* () {
                const channelNames = this.getAllChannelNames();
                channelNameDecoder(channelNames).runWithException(name);
                yield this.switchToChannel(name);
            });
        }
        leave() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.switchToChannel();
            });
        }
        current() {
            return this.currentChannelName;
        }
        my() {
            return this.current();
        }
        changed(callback) {
            if (typeof callback !== "function") {
                throw new Error("Cannot subscribe to channel changed, because the provided callback is not a function!");
            }
            return this.registry.add(this.ChangedKey, callback);
        }
        onChanged(callback) {
            return this.changed(callback);
        }
        add(info) {
            throw new Error("Method `add()` isn't implemented.");
        }
    }

    class IoC {
        constructor(coreGlue) {
            this.coreGlue = coreGlue;
            this.controllers = {
                windows: this.windowsController,
                appManager: this.appManagerController,
                layouts: this.layoutsController,
                notifications: this.notificationsController,
                intents: this.intentsController,
                channels: this.channelsController
            };
        }
        get windowsController() {
            if (!this._windowsControllerInstance) {
                this._windowsControllerInstance = new WindowsController();
            }
            return this._windowsControllerInstance;
        }
        get appManagerController() {
            if (!this._appManagerControllerInstance) {
                this._appManagerControllerInstance = new AppManagerController();
            }
            return this._appManagerControllerInstance;
        }
        get layoutsController() {
            if (!this._layoutsControllerInstance) {
                this._layoutsControllerInstance = new LayoutsController();
            }
            return this._layoutsControllerInstance;
        }
        get notificationsController() {
            if (!this._notificationsControllerInstance) {
                this._notificationsControllerInstance = new NotificationsController();
            }
            return this._notificationsControllerInstance;
        }
        get intentsController() {
            if (!this._intentsControllerInstance) {
                this._intentsControllerInstance = new IntentsController();
            }
            return this._intentsControllerInstance;
        }
        get channelsController() {
            if (!this._channelsControllerInstance) {
                this._channelsControllerInstance = new ChannelsController();
            }
            return this._channelsControllerInstance;
        }
        get bridge() {
            if (!this._bridgeInstance) {
                this._bridgeInstance = new GlueBridge(this.coreGlue);
            }
            return this._bridgeInstance;
        }
        buildWebWindow(id, name) {
            return __awaiter(this, void 0, void 0, function* () {
                const model = new WebWindowModel(id, name, this.bridge);
                const api = yield model.toApi();
                return { id, model, api };
            });
        }
        buildApplication(app, applicationInstances) {
            return __awaiter(this, void 0, void 0, function* () {
                const application = (new ApplicationModel(app, [], this.appManagerController)).toApi();
                const instances = applicationInstances.map((instanceData) => this.buildInstance(instanceData, application));
                application.instances.push(...instances);
                return application;
            });
        }
        buildInstance(instanceData, app) {
            return (new InstanceModel(instanceData, this.bridge, app)).toApi();
        }
    }

    const createFactoryFunction = (coreFactoryFunction) => {
        return (userConfig) => __awaiter(void 0, void 0, void 0, function* () {
            const config = parseConfig(userConfig);
            if (window.glue42gd) {
                return enterprise(config);
            }
            checkSingleton();
            const glue = yield PromiseWrap(() => coreFactoryFunction(config), 30000, "Glue Web initialization timed out");
            const logger = glue.logger.subLogger("web.main.controller");
            const ioc = new IoC(glue);
            yield ioc.bridge.start(ioc.controllers);
            logger.trace("the bridge has been started, initializing all controllers");
            yield Promise.all(Object.values(ioc.controllers).map((controller) => controller.start(glue, ioc)));
            logger.trace("all controllers reported started, starting all additional libraries");
            yield Promise.all(config.libraries.map((lib) => lib(glue, config)));
            logger.trace("all libraries were started, glue is ready, returning it");
            return glue;
        });
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
        var _this = this;
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
            session.join({
                system: config.system,
                service: config.service,
                instance: config.instance
            });
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
        var createSystem = function (system) { return __awaiter$1(_this, void 0, void 0, function () {
            var metric, createMetricsMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (system.parent === undefined) {
                            return [2];
                        }
                        return [4, joinPromise];
                    case 1:
                        _a.sent();
                        metric = {
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
                        createMetricsMsg = {
                            type: "define",
                            metrics: [metric],
                        };
                        session.send(createMetricsMsg);
                        return [2];
                }
            });
        }); };
        var updateSystem = function (system, state) { return __awaiter$1(_this, void 0, void 0, function () {
            var shadowedUpdateMetric, stateObj, rootMetric;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, joinPromise];
                    case 1:
                        _a.sent();
                        shadowedUpdateMetric = {
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
                        stateObj = composeMsgForRootStateMetric(system);
                        rootMetric = {
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
                        return [2];
                }
            });
        }); };
        var createMetric = function (metric) { return __awaiter$1(_this, void 0, void 0, function () {
            var metricClone, m, createMetricsMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        metricClone = cloneMetric(metric);
                        return [4, joinPromise];
                    case 1:
                        _a.sent();
                        m = serializeMetric(metricClone);
                        createMetricsMsg = {
                            type: "define",
                            metrics: [m],
                        };
                        session.send(createMetricsMsg);
                        if (typeof metricClone.value !== "undefined") {
                            updateMetricCore(metricClone);
                        }
                        return [2];
                }
            });
        }); };
        var updateMetric = function (metric) { return __awaiter$1(_this, void 0, void 0, function () {
            var metricClone;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        metricClone = cloneMetric(metric);
                        return [4, joinPromise];
                    case 1:
                        _a.sent();
                        updateMetricCore(metricClone);
                        return [2];
                }
            });
        }); };
        var updateMetricCore = function (metric) {
            if (canUpdate()) {
                var value = getMetricValueByType(metric);
                var publishMetricsMsg = {
                    type: "publish",
                    values: [{
                            name: normalizeMetricName(metric.path.join("/") + "/" + metric.name),
                            value: value,
                            timestamp: Date.now(),
                        }],
                };
                return session.sendFireAndForget(publishMetricsMsg);
            }
            return Promise.resolve();
        };
        var cloneMetric = function (metric) {
            var metricClone = __assign$1({}, metric);
            if (typeof metric.value === "object" && metric.value !== null) {
                metricClone.value = __assign$1({}, metric.value);
            }
            return metricClone;
        };
        var canUpdate = function () {
            var _a;
            try {
                var func = (_a = config.canUpdateMetric) !== null && _a !== void 0 ? _a : (function () { return true; });
                return func();
            }
            catch (_b) {
                return true;
            }
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
            return this.transport.updateMetric(this);
        };
        return BaseMetric;
    }());

    var NumberMetric = (function (_super) {
        __extends(NumberMetric, _super);
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
        __extends(ObjectMetric, _super);
        function ObjectMetric(definition, system, transport, value) {
            return _super.call(this, definition, system, transport, value, MetricTypes.OBJECT) || this;
        }
        ObjectMetric.prototype.update = function (newValue) {
            this.mergeValues(newValue);
            return this.transport.updateMetric(this);
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
        __extends(StringMetric, _super);
        function StringMetric(definition, system, transport, value) {
            return _super.call(this, definition, system, transport, value, MetricTypes.STRING) || this;
        }
        return StringMetric;
    }(BaseMetric));

    var TimestampMetric = (function (_super) {
        __extends(TimestampMetric, _super);
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
                    existing
                        .update(value)
                        .catch(function () { });
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
            return Promise.resolve();
        };
        NullProtocol.prototype.updateSystem = function (metric, state) {
            return Promise.resolve();
        };
        NullProtocol.prototype.createMetric = function (metric) {
            return Promise.resolve();
        };
        NullProtocol.prototype.updateMetric = function (metric) {
            return Promise.resolve();
        };
        return NullProtocol;
    }());

    var PerfTracker = (function () {
        function PerfTracker(api, initialPublishTimeout, publishInterval) {
            this.api = api;
            this.lastCount = 0;
            this.initialPublishTimeout = 10 * 1000;
            this.publishInterval = 60 * 1000;
            this.initialPublishTimeout = initialPublishTimeout !== null && initialPublishTimeout !== void 0 ? initialPublishTimeout : this.initialPublishTimeout;
            this.publishInterval = publishInterval !== null && publishInterval !== void 0 ? publishInterval : this.publishInterval;
            this.scheduleCollection();
            this.system = this.api.subSystem("performance", "Performance data published by the web application");
        }
        PerfTracker.prototype.scheduleCollection = function () {
            var _this = this;
            setTimeout(function () {
                _this.collect();
                setInterval(function () {
                    _this.collect();
                }, _this.publishInterval);
            }, this.initialPublishTimeout);
        };
        PerfTracker.prototype.collect = function () {
            try {
                this.collectMemory();
                this.collectEntries();
            }
            catch (_a) {
            }
        };
        PerfTracker.prototype.collectMemory = function () {
            var memory = window.performance.memory;
            this.system.stringMetric("memory", JSON.stringify({
                totalJSHeapSize: memory.totalJSHeapSize,
                usedJSHeapSize: memory.usedJSHeapSize
            }));
        };
        PerfTracker.prototype.collectEntries = function () {
            var allEntries = window.performance.getEntries();
            if (allEntries.length <= this.lastCount) {
                return;
            }
            this.lastCount = allEntries.length;
            this.system.stringMetric("entries", JSON.stringify(allEntries));
        };
        return PerfTracker;
    }());

    var metrics = (function (options) {
        var protocol;
        if (!options.connection || typeof options.connection !== "object") {
            protocol = new NullProtocol();
        }
        else {
            protocol = gw3(options.connection, options);
        }
        var repo = new Repository(options, protocol);
        var rootSystem = repo.root;
        if (!options.disableAutoAppSystem) {
            rootSystem = rootSystem.subSystem("App");
        }
        var api = addFAVSupport(rootSystem);
        initPerf(api, options.pagePerformanceMetrics);
        return api;
    });
    var perf;
    function initPerf(api, config) {
        var _a, _b;
        if (typeof window === "undefined") {
            return;
        }
        var perfConfig = (_b = (_a = window === null || window === void 0 ? void 0 : window.glue42gd) === null || _a === void 0 ? void 0 : _a.metrics) === null || _b === void 0 ? void 0 : _b.pagePerformanceMetrics;
        if (perfConfig) {
            config = perfConfig;
        }
        if (config === null || config === void 0 ? void 0 : config.enabled) {
            perf = new PerfTracker(api, config.initialPublishTimeout, config.publishInterval);
        }
    }
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
        function add(key, callback, replayArgumentsArr) {
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey) {
                callbacksForKey = [];
                callbacks[key] = callbacksForKey;
            }
            callbacksForKey.push(callback);
            if (replayArgumentsArr) {
                setTimeout(function () {
                    replayArgumentsArr.forEach(function (replayArgument) {
                        var _a;
                        if ((_a = callbacks[key]) === null || _a === void 0 ? void 0 : _a.includes(callback)) {
                            try {
                                if (Array.isArray(replayArgument)) {
                                    callback.apply(undefined, replayArgument);
                                }
                                else {
                                    callback.apply(undefined, [replayArgument]);
                                }
                            }
                            catch (err) {
                                _handleError(err, key);
                            }
                        }
                    });
                }, 0);
            }
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
                if (allForKey.length === 0) {
                    delete callbacks[key];
                }
                else {
                    callbacks[key] = allForKey;
                }
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
    var lib$1 = createRegistry$1;

    var InProcTransport = (function () {
        function InProcTransport(settings, logger) {
            var _this = this;
            this.registry = lib$1();
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
            this.registry = lib$1();
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
            if (typeof window !== "undefined") {
                Utils._isNode = false;
                return false;
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

    var timers = {};
    function getAllTimers() {
        return timers;
    }
    function timer (timerName) {
        var existing = timers[timerName];
        if (existing) {
            return existing;
        }
        var marks = [];
        function now() {
            return new Date().getTime();
        }
        var startTime = now();
        mark("start", startTime);
        var endTime;
        var period;
        function stop() {
            endTime = now();
            mark("end", endTime);
            period = endTime - startTime;
            return period;
        }
        function mark(name, time) {
            var currentTime = time !== null && time !== void 0 ? time : now();
            var diff = 0;
            if (marks.length > 0) {
                diff = currentTime - marks[marks.length - 1].time;
            }
            marks.push({ name: name, time: currentTime, diff: diff });
        }
        var timerObj = {
            get startTime() {
                return startTime;
            },
            get endTime() {
                return endTime;
            },
            get period() {
                return period;
            },
            stop: stop,
            mark: mark,
            marks: marks
        };
        timers[timerName] = timerObj;
        return timerObj;
    }

    var WebSocketConstructor = Utils.isNode() ? require("ws") : window.WebSocket;
    var WS = (function () {
        function WS(settings, logger) {
            this.startupTimer = timer("connection");
            this._running = true;
            this._registry = lib$1();
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
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.startupTimer.mark("opening-socket");
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
                            this.startupTimer.mark("socket-initiated");
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
                _this.startupTimer.mark("ws-opened");
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

    var alphabet_1 = {
        characters: characters,
        seed: setSeed$1,
        lookup: lookup,
        shuffled: getShuffled
    };

    var crypto = typeof window === 'object' && (window.crypto || window.msCrypto); // IE 11 uses window.msCrypto

    function randomByte() {
        if (!crypto || !crypto.getRandomValues) {
            return Math.floor(Math.random() * 256) & 0x30;
        }
        var dest = new Uint8Array(1);
        crypto.getRandomValues(dest);
        return dest[0] & 0x30;
    }

    var randomByteBrowser = randomByte;

    function encode(lookup, number) {
        var loopCounter = 0;
        var done;

        var str = '';

        while (!done) {
            str = str + lookup( ( (number >> (4 * loopCounter)) & 0x0f ) | randomByteBrowser() );
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
        var characters = alphabet_1.shuffled();
        return {
            version: characters.indexOf(id.substr(0, 1)) & 0x0f,
            worker: characters.indexOf(id.substr(1, 1)) & 0x0f
        };
    }

    var decode_1 = decode;

    function isShortId(id) {
        if (!id || typeof id !== 'string' || id.length < 6 ) {
            return false;
        }

        var characters = alphabet_1.characters();
        var len = id.length;
        for(var i = 0; i < len;i++) {
            if (characters.indexOf(id[i]) === -1) {
                return false;
            }
        }
        return true;
    }

    var isValid = isShortId;

    var lib$1$1 = createCommonjsModule(function (module) {






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

        str = str + encode_1(alphabet_1.lookup, version);
        str = str + encode_1(alphabet_1.lookup, clusterWorkerId);
        if (counter > 0) {
            str = str + encode_1(alphabet_1.lookup, counter);
        }
        str = str + encode_1(alphabet_1.lookup, seconds);

        return str;
    }


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


    // Export all other functions as properties of the generate function
    module.exports = generate;
    module.exports.generate = generate;
    module.exports.seed = seed;
    module.exports.worker = worker;
    module.exports.characters = characters;
    module.exports.decode = decode_1;
    module.exports.isValid = isValid;
    });
    var lib_1 = lib$1$1.generate;
    var lib_2 = lib$1$1.seed;
    var lib_3 = lib$1$1.worker;
    var lib_4 = lib$1$1.characters;
    var lib_5 = lib$1$1.decode;
    var lib_6 = lib$1$1.isValid;

    var shortid = lib$1$1;

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
        var callbacks = lib$1();
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
            return shortid();
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
            return connection.send(msg);
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
            this.registry = lib$1();
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
                return __generator(this, function (_c) {
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
                            this.logger.debug("login successful with peerId " + welcomeMsg.peer_id);
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
                return __generator(this, function (_a) {
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
                    setTimeout(_this.handleDisconnected.bind(_this), _this.settings.reconnectInterval || 1000);
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

    var PromisePlus$1 = function (executor, timeoutMilliseconds, timeoutMessage) {
        return new Promise(function (resolve, reject) {
            var timeout = setTimeout(function () {
                var message = timeoutMessage || "Promise timeout hit: " + timeoutMilliseconds;
                reject(message);
            }, timeoutMilliseconds);
            var providedPromise = new Promise(executor);
            providedPromise
                .then(function (result) {
                clearTimeout(timeout);
                resolve(result);
            })
                .catch(function (error) {
                clearTimeout(timeout);
                reject(error);
            });
        });
    };

    var WebPlatformTransport = (function () {
        function WebPlatformTransport(settings, logger, identity) {
            this.settings = settings;
            this.logger = logger;
            this.identity = identity;
            this.parentReady = false;
            this.iAmConnected = false;
            this.rejected = false;
            this.children = [];
            this.parentPingTimeout = 3000;
            this.connectionRequestTimeout = 5000;
            this.defaultTargetString = "*";
            this.registry = lib$1();
            this.messages = {
                connectionAccepted: { name: "connectionAccepted", handle: this.handleConnectionAccepted.bind(this) },
                connectionRejected: { name: "connectionRejected", handle: this.handleConnectionRejected.bind(this) },
                connectionRequest: { name: "connectionRequest", handle: this.handleConnectionRequest.bind(this) },
                parentReady: { name: "parentReady", handle: this.handleParentReady.bind(this) },
                parentPing: { name: "parentPing", handle: this.handleParentPing.bind(this) },
                platformPing: { name: "platformPing", handle: this.handlePlatformPing.bind(this) },
                platformUnload: { name: "platformUnload", handle: this.handlePlatformUnload.bind(this) },
                platformReady: { name: "platformReady", handle: this.handlePlatformReady.bind(this) },
                clientUnload: { name: "clientUnload", handle: this.handleClientUnload.bind(this) }
            };
            this.setUpMessageListener();
            this.setUpUnload();
            if (!this.settings.port) {
                this.parent = window.opener || window.top;
                this.parentType = window.opener ? "opener" :
                    window.name.indexOf("#wsp") !== -1 ? "workspace" : "top";
            }
        }
        Object.defineProperty(WebPlatformTransport.prototype, "transportWindowId", {
            get: function () {
                return this.publicWindowId;
            },
            enumerable: true,
            configurable: true
        });
        WebPlatformTransport.prototype.sendObject = function (msg) {
            return __awaiter$1(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!this.port) {
                        throw new Error("Cannot send message, because the port was not opened yet");
                    }
                    this.port.postMessage(msg);
                    return [2];
                });
            });
        };
        Object.defineProperty(WebPlatformTransport.prototype, "isObjectBasedTransport", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        WebPlatformTransport.prototype.onMessage = function (callback) {
            return this.registry.add("onMessage", callback);
        };
        WebPlatformTransport.prototype.send = function () {
            return Promise.reject("not supported");
        };
        WebPlatformTransport.prototype.onConnectedChanged = function (callback) {
            return this.registry.add("onConnectedChanged", callback);
        };
        WebPlatformTransport.prototype.open = function () {
            return __awaiter$1(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.debug("opening a connection to the web platform gateway.");
                            return [4, this.connect()];
                        case 1:
                            _a.sent();
                            this.notifyStatusChanged(true);
                            return [2];
                    }
                });
            });
        };
        WebPlatformTransport.prototype.close = function () {
            return Promise.resolve();
        };
        WebPlatformTransport.prototype.name = function () {
            return "web-platform";
        };
        WebPlatformTransport.prototype.reconnect = function () {
            return Promise.resolve();
        };
        WebPlatformTransport.prototype.connect = function () {
            return __awaiter$1(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.parentReady) {
                                this.logger.debug("cancelling connection attempt, because this client's parent has already given a ready signal");
                                return [2];
                            }
                            if (this.settings.port) {
                                this.logger.debug("opening an internal web platform connection");
                                this.port = this.settings.port;
                                this.publicWindowId = this.settings.windowId;
                                if (this.identity) {
                                    this.identity.windowId = this.publicWindowId;
                                }
                                this.port.onmessage = function (event) { return _this.registry.execute("onMessage", event.data); };
                                this.logger.debug("internal web platform connection completed");
                                return [2];
                            }
                            if (!this.parentType || !this.parent) {
                                throw new Error("Cannot initiate a connection, because there is no opener, no top and no port.");
                            }
                            this.logger.debug("opening a " + (this.parentType === "opener" ? "child" : "grandchild") + " client web platform connection");
                            return [4, this.waitParent(this.parent, this.parentType)];
                        case 1:
                            _a.sent();
                            return [4, this.initiateRemoteConnection(this.parent, this.parentType)];
                        case 2:
                            _a.sent();
                            this.logger.debug("the " + (this.parentType === "opener" ? "child" : "grandchild") + " client is connected");
                            return [2];
                    }
                });
            });
        };
        WebPlatformTransport.prototype.initiateRemoteConnection = function (target, parentType) {
            var _this = this;
            return PromisePlus$1(function (resolve, reject) {
                _this.connectionResolve = resolve;
                _this.connectionReject = reject;
                _this.myClientId = shortid();
                var bridgeInstanceId = _this.parentType === "workspace" ? window.name.substring(0, window.name.indexOf("#wsp")) : window.name;
                var request = {
                    glue42core: {
                        type: _this.messages.connectionRequest.name,
                        clientId: _this.myClientId,
                        clientType: parentType === "top" || parentType === "workspace" ? "grandChild" : "child",
                        bridgeInstanceId: bridgeInstanceId
                    }
                };
                _this.logger.debug("sending connection request to " + parentType);
                target.postMessage(request, _this.defaultTargetString);
            }, this.connectionRequestTimeout, "The connection to the opener/top window timed out");
        };
        WebPlatformTransport.prototype.waitParent = function (target, parentType) {
            var _this = this;
            return PromisePlus$1(function (resolve) {
                _this.parentPingResolve = resolve;
                var message = {
                    glue42core: {
                        type: parentType === "opener" ? _this.messages.platformPing.name : _this.messages.parentPing.name
                    }
                };
                _this.logger.debug("checking for " + parentType + " window availability");
                target.postMessage(message, _this.defaultTargetString);
            }, this.parentPingTimeout, "Cannot initiate glue, because this window was not opened or created by a glue client");
        };
        WebPlatformTransport.prototype.setUpMessageListener = function () {
            var _this = this;
            if (this.settings.port) {
                this.logger.debug("skipping generic message listener, because this is an internal client");
                return;
            }
            window.addEventListener("message", function (event) {
                var _a;
                var data = (_a = event.data) === null || _a === void 0 ? void 0 : _a.glue42core;
                if (!data || _this.rejected) {
                    return;
                }
                if (!_this.checkMessageTypeValid(data.type)) {
                    _this.logger.error("cannot handle the incoming glue42 core message, because the type is invalid: " + data.type);
                    return;
                }
                var messageType = data.type;
                _this.logger.debug("received valid glue42core message of type: " + messageType);
                _this.messages[messageType].handle(event);
            });
        };
        WebPlatformTransport.prototype.setUpUnload = function () {
            var _this = this;
            if (this.settings.port) {
                this.logger.debug("skipping unload event listener, because this is an internal client");
                return;
            }
            window.addEventListener("beforeunload", function () {
                var _a, _b;
                var message = {
                    glue42core: {
                        type: _this.messages.clientUnload.name,
                        data: {
                            clientId: _this.myClientId,
                            ownWindowId: (_a = _this.identity) === null || _a === void 0 ? void 0 : _a.windowId
                        }
                    }
                };
                if (_this.parent) {
                    _this.parent.postMessage(message, _this.defaultTargetString);
                }
                (_b = _this.port) === null || _b === void 0 ? void 0 : _b.postMessage(message);
            });
        };
        WebPlatformTransport.prototype.handleParentReady = function () {
            this.logger.debug("handling the ready signal from the parent, by resoling the pending promise.");
            this.parentReady = true;
            if (this.parentPingResolve) {
                this.parentPingResolve();
                delete this.parentPingResolve;
                return;
            }
            this.logger.debug("silently handling the ready signal from the top parent, because there is no defined promise");
        };
        WebPlatformTransport.prototype.handlePlatformReady = function () {
            this.logger.debug("the web platform gave the ready signal");
            this.parentReady = true;
            if (this.parentPingResolve) {
                this.parentPingResolve();
                delete this.parentPingResolve;
                return;
            }
            this.logger.debug("silently handling the ready signal from the top parent, because there is no defined promise");
        };
        WebPlatformTransport.prototype.handleConnectionAccepted = function (event) {
            var _a;
            var data = (_a = event.data) === null || _a === void 0 ? void 0 : _a.glue42core;
            if (this.myClientId === data.clientId) {
                return this.handleAcceptanceOfMyRequest(data);
            }
            return this.handleAcceptanceOfGrandChildRequest(data, event);
        };
        WebPlatformTransport.prototype.handleAcceptanceOfMyRequest = function (data) {
            var _this = this;
            this.logger.debug("handling a connection accepted signal targeted at me.");
            if (!data.port) {
                this.logger.error("cannot set up my connection, because I was not provided with a port");
                return;
            }
            this.publicWindowId = this.parentType === "opener" ? window.name :
                this.parentType === "top" ? data.parentWindowId :
                    window.name.substring(0, window.name.indexOf("#wsp"));
            if (this.identity && this.parentType !== "top") {
                this.identity.windowId = this.publicWindowId;
            }
            if (this.identity && data.appName) {
                this.identity.application = data.appName;
                this.identity.applicationName = data.appName;
            }
            this.port = data.port;
            this.port.onmessage = function (e) { return _this.registry.execute("onMessage", e.data); };
            if (this.connectionResolve) {
                this.logger.debug("my connection is set up, calling the connection resolve.");
                this.connectionResolve();
                delete this.connectionResolve;
                return;
            }
            this.logger.error("unable to call the connection resolve, because no connection promise was found");
        };
        WebPlatformTransport.prototype.handleAcceptanceOfGrandChildRequest = function (data, event) {
            this.logger.debug("handling a connection accepted signal targeted at a grandchild: " + data.clientId);
            var child = this.children.find(function (c) { return c.grandChildId === data.clientId; });
            if (!child) {
                this.logger.error("cannot handle connection accepted for grandchild: " + data.clientId + ", because there is no grandchild with this id");
                return;
            }
            child.connected = true;
            this.logger.debug("the grandchild connection for " + data.clientId + " is set up, forwarding the success message and the gateway port");
            data.parentWindowId = this.publicWindowId;
            child.source.postMessage(event.data, child.origin, [data.port]);
            return;
        };
        WebPlatformTransport.prototype.handleConnectionRejected = function () {
            this.logger.debug("handling a connection rejection. Most likely the reason is that this window was not created by a glue API call");
            if (this.connectionReject) {
                this.connectionReject("The platform connection was rejected. Most likely because this window was not created by a glue API call");
                delete this.connectionReject;
            }
        };
        WebPlatformTransport.prototype.handleConnectionRequest = function (event) {
            var source = event.source;
            var data = event.data.glue42core;
            if (!data.clientType || data.clientType !== "grandChild") {
                return this.rejectConnectionRequest(source, event.origin, "rejecting a connection request, because the source was not opened by a glue API call");
            }
            if (!data.clientId) {
                return this.rejectConnectionRequest(source, event.origin, "rejecting a connection request, because the source did not provide a valid id");
            }
            if (this.parentType !== "opener" || !this.parent) {
                return this.rejectConnectionRequest(source, event.origin, "Cannot forward the connection request, because no direct connection to the platform was found");
            }
            this.logger.debug("handling a connection request for a grandchild: " + data.clientId);
            this.children.push({ grandChildId: data.clientId, source: source, connected: false, origin: event.origin });
            this.logger.debug("grandchild: " + data.clientId + " is prepared, forwarding connection request to the platform");
            this.parent.postMessage(event.data, this.defaultTargetString);
        };
        WebPlatformTransport.prototype.handleParentPing = function (event) {
            if (!this.parentReady) {
                this.logger.debug("my parent is not ready, I am ignoring the parent ping");
                return;
            }
            if (!this.iAmConnected) {
                this.logger.debug("i am not fully connected yet, I am ignoring the parent ping");
                return;
            }
            var message = {
                glue42core: {
                    type: this.messages.parentReady.name
                }
            };
            var source = event.source;
            this.logger.debug("responding to a parent ping with a ready message");
            source.postMessage(message, event.origin);
        };
        WebPlatformTransport.prototype.handlePlatformUnload = function (event) {
            this.logger.debug("detected a web platform unload");
            this.parentReady = false;
            if (this.children.length) {
                this.logger.debug("forwarding the platform unload to all known children and starting platform discovery polling");
                this.children.forEach(function (child) { return child.source.postMessage(event.data, child.origin); });
            }
            this.notifyStatusChanged(false, "Gateway unloaded");
        };
        WebPlatformTransport.prototype.handleClientUnload = function (event) {
            var data = event.data.glue42core;
            if (!data.clientId) {
                this.logger.warn("cannot process grand child unload, because the provided id was not valid");
                return;
            }
            var foundChild = this.children.find(function (child) { return child.grandChildId === data.clientId; });
            if (!foundChild) {
                this.logger.warn("cannot process grand child unload, because this client is unaware of this grandchild");
                return;
            }
            this.logger.debug("handling grandchild unload for id: " + data.clientId);
            this.children = this.children.filter(function (child) { return child.grandChildId !== data.clientId; });
        };
        WebPlatformTransport.prototype.handlePlatformPing = function () {
            this.logger.error("cannot handle platform ping, because this is not a platform calls handling component");
        };
        WebPlatformTransport.prototype.notifyStatusChanged = function (status, reason) {
            this.iAmConnected = status;
            this.registry.execute("onConnectedChanged", status, reason);
        };
        WebPlatformTransport.prototype.checkMessageTypeValid = function (typeToValidate) {
            return typeof typeToValidate === "string" && !!this.messages[typeToValidate];
        };
        WebPlatformTransport.prototype.rejectConnectionRequest = function (source, origin, reason) {
            this.rejected = true;
            this.logger.error(reason);
            var rejection = {
                glue42core: {
                    type: this.messages.connectionRejected.name
                }
            };
            source.postMessage(rejection, origin);
        };
        return WebPlatformTransport;
    }());

    var Connection = (function () {
        function Connection(settings, logger) {
            this.settings = settings;
            this.logger = logger;
            this.messageHandlers = {};
            this.ids = 1;
            this.registry = lib$1();
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
            else if (settings.webPlatform) {
                this.transport = new WebPlatformTransport(settings.webPlatform, logger.subLogger("web-platform"), settings.identity);
            }
            else if (settings.ws !== undefined) {
                this.transport = new WS(settings, logger.subLogger("ws"));
            }
            else {
                throw new Error("No connection information specified");
            }
            this.isTrace = logger.canPublish("trace");
            logger.debug("starting with " + this.transport.name() + " transport");
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
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.transport.open()];
                        case 1:
                            _a.sent();
                            timer("connection").mark("transport-opened");
                            identity = this.protocol.login(authRequest, reconnect);
                            timer("connection").mark("protocol-logged-in");
                            return [2, identity];
                    }
                });
            });
        };
        Connection.prototype.logout = function () {
            return __awaiter$1(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
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
                            try {
                                _this.logger.error("Message handler failed with " + error.stack, error);
                            }
                            catch (loggerError) {
                                console.log("Message handler failed", error);
                            }
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
                var interop = Logger.Interop;
                if (interop) {
                    try {
                        if (interop.methods({ name: Logger.InteropMethodName }).length > 0) {
                            interop.invoke(Logger.InteropMethodName, {
                                msg: "" + message,
                                logger: loggerName,
                                level: level
                            });
                        }
                    }
                    catch (_a) {
                    }
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

    var version = "5.2.8-beta.0";

    function prepareConfig (configuration, ext, glue42gd) {
        var _a, _b, _c, _d, _e;
        var nodeStartingContext;
        if (Utils.isNode()) {
            var startingContextString = process.env._GD_STARTING_CONTEXT_;
            if (startingContextString) {
                try {
                    nodeStartingContext = JSON.parse(startingContextString);
                }
                catch (_f) {
                }
            }
        }
        function getConnection() {
            var _a, _b, _c, _d, _e;
            var gwConfig = configuration.gateway;
            var protocolVersion = (_a = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.protocolVersion) !== null && _a !== void 0 ? _a : 3;
            var reconnectInterval = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.reconnectInterval;
            var reconnectAttempts = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.reconnectAttempts;
            var defaultWs = "ws://localhost:8385";
            var ws = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.ws;
            var sharedWorker = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.sharedWorker;
            var inproc = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.inproc;
            var webPlatform = (_b = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.webPlatform) !== null && _b !== void 0 ? _b : undefined;
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
                uniqueAppName = (_c = glue42gd.application) !== null && _c !== void 0 ? _c : "glue-app";
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
            var replaySpecs = (_e = (_d = configuration.gateway) === null || _d === void 0 ? void 0 : _d.replaySpecs) !== null && _e !== void 0 ? _e : [];
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
                    api: ext.version || version
                },
                reconnectInterval: reconnectInterval,
                ws: ws,
                sharedWorker: sharedWorker,
                webPlatform: webPlatform,
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
            var uid = shortid();
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
            var _a, _b, _c;
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
            if (((_a = configuration.gateway) === null || _a === void 0 ? void 0 : _a.webPlatform) || ((_b = configuration.gateway) === null || _b === void 0 ? void 0 : _b.inproc) || ((_c = configuration.gateway) === null || _c === void 0 ? void 0 : _c.sharedWorker)) {
                return {
                    username: "glue42", password: "glue42"
                };
            }
        }
        function getLogger() {
            var _a, _b;
            var config = configuration.logger;
            var defaultLevel = "warn";
            if (!config) {
                config = defaultLevel;
            }
            var gdConsoleLevel;
            if (glue42gd) {
                gdConsoleLevel = glue42gd.consoleLogLevel;
            }
            if (typeof config === "string") {
                return { console: gdConsoleLevel !== null && gdConsoleLevel !== void 0 ? gdConsoleLevel : config, publish: defaultLevel };
            }
            return {
                console: (_a = gdConsoleLevel !== null && gdConsoleLevel !== void 0 ? gdConsoleLevel : config.console) !== null && _a !== void 0 ? _a : defaultLevel,
                publish: (_b = config.publish) !== null && _b !== void 0 ? _b : defaultLevel
            };
        }
        var connection = getConnection();
        var application = getApplication();
        if (typeof window !== "undefined") {
            var windowAsAny = window;
            var containerApplication = windowAsAny.htmlContainer ?
                windowAsAny.htmlContainer.containerName + "." + windowAsAny.htmlContainer.application : (_a = windowAsAny === null || windowAsAny === void 0 ? void 0 : windowAsAny.glue42gd) === null || _a === void 0 ? void 0 : _a.application;
            if (containerApplication) {
                application = containerApplication;
            }
        }
        return {
            bus: (_b = configuration.bus) !== null && _b !== void 0 ? _b : false,
            application: application,
            auth: getAuth(),
            logger: getLogger(),
            connection: connection,
            metrics: (_c = configuration.metrics) !== null && _c !== void 0 ? _c : true,
            contexts: (_d = configuration.contexts) !== null && _d !== void 0 ? _d : true,
            version: ext.version || version,
            libs: (_e = ext.libs) !== null && _e !== void 0 ? _e : [],
            customLogger: configuration.customLogger
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

    function applyContextDelta(context, delta, logger) {
        try {
            if (logger === null || logger === void 0 ? void 0 : logger.canPublish("trace")) {
                logger === null || logger === void 0 ? void 0 : logger.trace("applying context delta " + JSON.stringify(delta) + " on context " + JSON.stringify(context));
            }
            if (!delta) {
                return context;
            }
            if (delta.reset) {
                context = __assign$1({}, delta.reset);
                return context;
            }
            context = deepClone(context, undefined);
            if (delta.commands) {
                for (var _i = 0, _a = delta.commands; _i < _a.length; _i++) {
                    var command = _a[_i];
                    if (command.type === "remove") {
                        deletePath(context, command.path);
                    }
                    else if (command.type === "set") {
                        setValueToPath(context, command.value, command.path);
                    }
                }
                return context;
            }
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
            return context;
        }
        catch (e) {
            logger === null || logger === void 0 ? void 0 : logger.error("error applying context delta " + JSON.stringify(delta) + " on context " + JSON.stringify(context), e);
            return context;
        }
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
    function setValueToPath(obj, value, path) {
        var pathArr = path.split(".");
        var i;
        for (i = 0; i < pathArr.length - 1; i++) {
            if (!obj[pathArr[i]]) {
                obj[pathArr[i]] = {};
            }
            if (typeof obj[pathArr[i]] !== "object") {
                obj[pathArr[i]] = {};
            }
            obj = obj[pathArr[i]];
        }
        obj[pathArr[i]] = value;
    }
    function deletePath(obj, path) {
        var pathArr = path.split(".");
        var i;
        for (i = 0; i < pathArr.length - 1; i++) {
            if (!obj[pathArr[i]]) {
                return;
            }
            obj = obj[pathArr[i]];
        }
        delete obj[pathArr[i]];
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
            this._protocolVersion = undefined;
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
        Object.defineProperty(GW3Bridge.prototype, "protocolVersion", {
            get: function () {
                var _a;
                if (!this._protocolVersion) {
                    var contextsDomainInfo = this._connection.availableDomains.find(function (d) { return d.uri === "context"; });
                    this._protocolVersion = (_a = contextsDomainInfo === null || contextsDomainInfo === void 0 ? void 0 : contextsDomainInfo.version) !== null && _a !== void 0 ? _a : 1;
                }
                return this._protocolVersion;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GW3Bridge.prototype, "setPathSupported", {
            get: function () {
                return this.protocolVersion >= 2;
            },
            enumerable: true,
            configurable: true
        });
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
                _this._contextIdToName[createContextMsg.context_id] = name;
                var contextData = _this._contextNameToData[name] || new GW3ContextData(createContextMsg.context_id, name, true, undefined);
                contextData.isAnnounced = true;
                contextData.name = name;
                contextData.contextId = createContextMsg.context_id;
                contextData.context = data;
                _this._contextNameToData[name] = contextData;
                return createContextMsg.context_id;
            });
        };
        GW3Bridge.prototype.all = function () {
            var _this = this;
            return Object.keys(this._contextNameToData)
                .filter(function (name) { return _this._contextNameToData[name].isAnnounced; });
        };
        GW3Bridge.prototype.update = function (name, delta) {
            var _a;
            return __awaiter$1(this, void 0, void 0, function () {
                var contextData, currentContext, calculatedDelta;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            contextData = this._contextNameToData[name];
                            if (!contextData || !contextData.isAnnounced) {
                                return [2, this.createContext(name, delta)];
                            }
                            currentContext = contextData.context;
                            if (!!contextData.hasCallbacks()) return [3, 2];
                            return [4, this.get(contextData.name)];
                        case 1:
                            currentContext = _b.sent();
                            _b.label = 2;
                        case 2:
                            calculatedDelta = this.protocolVersion === 2 ?
                                this.calculateContextDeltaV2(currentContext, delta) :
                                this.calculateContextDeltaV1(currentContext, delta);
                            if (!Object.keys(calculatedDelta.added).length
                                && !Object.keys(calculatedDelta.updated).length
                                && !calculatedDelta.removed.length
                                && !((_a = calculatedDelta.commands) === null || _a === void 0 ? void 0 : _a.length)) {
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
        GW3Bridge.prototype.setPath = function (name, path, value) {
            if (!this.setPathSupported) {
                return Promise.reject("glue.contexts.setPath operation is not supported, use Glue42 3.10 or later");
            }
            return this.setPaths(name, [{ path: path, value: value }]);
        };
        GW3Bridge.prototype.setPaths = function (name, pathValues) {
            var _this = this;
            if (!this.setPathSupported) {
                return Promise.reject("glue.contexts.setPaths operation is not supported, use Glue42 3.10 or later");
            }
            var contextData = this._contextNameToData[name];
            if (!contextData || !contextData.isAnnounced) {
                var obj = {};
                for (var _i = 0, pathValues_1 = pathValues; _i < pathValues_1.length; _i++) {
                    var pathValue = pathValues_1[_i];
                    setValueToPath(obj, pathValue.value, pathValue.path);
                }
                return this.createContext(name, obj);
            }
            var commands = [];
            for (var _a = 0, pathValues_2 = pathValues; _a < pathValues_2.length; _a++) {
                var pathValue = pathValues_2[_a];
                if (pathValue.value === null) {
                    commands.push({ type: "remove", path: pathValue.path });
                }
                else {
                    commands.push({ type: "set", path: pathValue.path, value: pathValue.value });
                }
            }
            return this._gw3Session
                .send({
                type: GW_MESSAGE_UPDATE_CONTEXT,
                domain: "global",
                context_id: contextData.contextId,
                delta: { commands: commands }
            }, {}, { skipPeerId: false })
                .then(function (gwResponse) {
                _this.handleUpdated(contextData, { added: {}, removed: [], updated: {}, commands: commands }, { updaterId: gwResponse.peer_id });
            });
        };
        GW3Bridge.prototype.get = function (name) {
            var _this = this;
            var _a;
            var contextData = this._contextNameToData[name];
            if (!contextData || !contextData.isAnnounced) {
                return Promise.resolve({});
            }
            if (contextData && !contextData.hasCallbacks()) {
                return new Promise(function (resolve, _) { return __awaiter$1(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        this.subscribe(name, function (data, _d, _r, un) {
                            _this.unsubscribe(un);
                            resolve(data);
                        });
                        return [2];
                    });
                }); });
            }
            var context = (_a = contextData === null || contextData === void 0 ? void 0 : contextData.context) !== null && _a !== void 0 ? _a : {};
            return Promise.resolve(context);
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
                    if (contextData.context && contextData.sentExplicitSubscription) {
                        var clone = deepClone(contextData.context);
                        callback(clone, clone, [], thisCallbackSubscriptionNumber);
                        return Promise.resolve(thisCallbackSubscriptionNumber);
                    }
                    return this.sendSubscribe(contextData)
                        .then(function () { return thisCallbackSubscriptionNumber; });
                }
                else {
                    var clone = deepClone(contextData.context);
                    callback(clone, clone, [], thisCallbackSubscriptionNumber);
                    return Promise.resolve(thisCallbackSubscriptionNumber);
                }
            }
            else {
                var clone = deepClone(contextData.context);
                callback(clone, clone, [], thisCallbackSubscriptionNumber);
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
        GW3Bridge.prototype.destroy = function (name) {
            var contextData = this._contextNameToData[name];
            if (!contextData) {
                return Promise.reject("context with " + name + " does not exist");
            }
            return this._gw3Session
                .send({
                type: GW_MESSAGE_DESTROY_CONTEXT,
                domain: "global",
                context_id: contextData.contextId,
            }).then(function (_) { return undefined; });
        };
        GW3Bridge.prototype.handleUpdated = function (contextData, delta, extraData) {
            var oldContext = contextData.context;
            contextData.context = applyContextDelta(contextData.context, delta, this._logger);
            if (this._contextNameToData[contextData.name] === contextData &&
                !deepEqual(oldContext, contextData.context)) {
                this.invokeUpdateCallbacks(contextData, delta, extraData);
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
                contextData.context = applyContextDelta(contextData.context, contextUpdatedMsg.delta, this._logger);
            }
            else {
                throw new Error("Unrecognized context update message " + updatedMessageType);
            }
            if (justSeen ||
                !deepEqual(contextData.context, oldContext) ||
                updatedMessageType === GW_MESSAGE_SUBSCRIBED_CONTEXT) {
                this.invokeUpdateCallbacks(contextData, contextUpdatedMsg.delta, { updaterId: contextUpdatedMsg.updater_id });
            }
        };
        GW3Bridge.prototype.invokeUpdateCallbacks = function (contextData, delta, extraData) {
            delta = delta || { added: {}, updated: {}, reset: {}, removed: [] };
            if (delta.commands) {
                delta.added = delta.updated = delta.reset = {};
                delta.removed = [];
                for (var _i = 0, _a = delta.commands; _i < _a.length; _i++) {
                    var command = _a[_i];
                    if (command.type === "remove") {
                        if (command.path.indexOf(".") === -1) {
                            delta.removed.push(command.path);
                        }
                        setValueToPath(delta.updated, null, command.path);
                    }
                    else if (command.type === "set") {
                        setValueToPath(delta.updated, command.value, command.path);
                    }
                }
            }
            for (var updateCallbackIndex in contextData.updateCallbacks) {
                if (contextData.updateCallbacks.hasOwnProperty(updateCallbackIndex)) {
                    try {
                        var updateCallback = contextData.updateCallbacks[updateCallbackIndex];
                        updateCallback(deepClone(contextData.context), Object.assign({}, delta.added || {}, delta.updated || {}, delta.reset || {}), delta.removed, parseInt(updateCallbackIndex, 10), extraData);
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
        GW3Bridge.prototype.calculateContextDeltaV1 = function (from, to) {
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
        GW3Bridge.prototype.calculateContextDeltaV2 = function (from, to) {
            var _a, _b;
            var delta = { added: {}, updated: {}, removed: [], reset: undefined, commands: [] };
            for (var _i = 0, _c = Object.keys(to); _i < _c.length; _i++) {
                var x = _c[_i];
                if (to[x] !== null) {
                    var fromX = from ? from[x] : null;
                    if (!deepEqual(fromX, to[x])) {
                        (_a = delta.commands) === null || _a === void 0 ? void 0 : _a.push({ type: "set", path: x, value: to[x] });
                    }
                }
                else {
                    (_b = delta.commands) === null || _b === void 0 ? void 0 : _b.push({ type: "remove", path: x });
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
        ContextsModule.prototype.update = function (name, data) {
            this.checkName(name);
            this.checkData(data);
            return this._bridge.update(name, data);
        };
        ContextsModule.prototype.set = function (name, data) {
            this.checkName(name);
            this.checkData(data);
            return this._bridge.set(name, data);
        };
        ContextsModule.prototype.setPath = function (name, path, data) {
            this.checkName(name);
            this.checkPath(path);
            var isTopLevelPath = path === "";
            if (isTopLevelPath) {
                this.checkData(data);
                return this.set(name, data);
            }
            return this._bridge.setPath(name, path, data);
        };
        ContextsModule.prototype.setPaths = function (name, paths) {
            this.checkName(name);
            if (!Array.isArray(paths)) {
                throw new Error("Please provide the paths as an array of PathValues!");
            }
            for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
                var _a = paths_1[_i], path = _a.path, value = _a.value;
                this.checkPath(path);
                var isTopLevelPath = path === "";
                if (isTopLevelPath) {
                    this.checkData(value);
                }
            }
            return this._bridge.setPaths(name, paths);
        };
        ContextsModule.prototype.subscribe = function (name, callback) {
            var _this = this;
            this.checkName(name);
            if (typeof callback !== "function") {
                throw new Error("Please provide the callback as a function!");
            }
            return this._bridge
                .subscribe(name, function (data, delta, removed, key, extraData) { return callback(data, delta, removed, function () { return _this._bridge.unsubscribe(key); }, extraData); })
                .then(function (key) {
                return function () {
                    _this._bridge.unsubscribe(key);
                };
            });
        };
        ContextsModule.prototype.get = function (name) {
            this.checkName(name);
            return this._bridge.get(name);
        };
        ContextsModule.prototype.ready = function () {
            return Promise.resolve(this);
        };
        ContextsModule.prototype.destroy = function (name) {
            this.checkName(name);
            return this._bridge.destroy(name);
        };
        Object.defineProperty(ContextsModule.prototype, "setPathSupported", {
            get: function () {
                return this._bridge.setPathSupported;
            },
            enumerable: true,
            configurable: true
        });
        ContextsModule.prototype.checkName = function (name) {
            if (typeof name !== "string" || name === "") {
                throw new Error("Please provide the name as a non-empty string!");
            }
        };
        ContextsModule.prototype.checkPath = function (path) {
            if (typeof path !== "string") {
                throw new Error("Please provide the path as a dot delimited string!");
            }
        };
        ContextsModule.prototype.checkData = function (data) {
            if (typeof data !== "object") {
                throw new Error("Please provide the data as an object!");
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

    function rejectAfter(ms, promise, error) {
        if (ms === void 0) { ms = 0; }
        var timeout;
        promise.finally(function () {
            if (timeout) {
                clearTimeout(timeout);
            }
        });
        return new Promise(function (resolve, reject) {
            timeout = setTimeout(function () { return reject(error); }, ms);
        });
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
            if (typeof methodFilter === "string") {
                methodFilter = { name: methodFilter };
            }
            else {
                methodFilter = __assign$1({}, methodFilter);
            }
            return this.getMethods(methodFilter);
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
                return __generator(this, function (_a) {
                    getInvokePromise = function () { return __awaiter$1(_this, void 0, void 0, function () {
                        var methodDefinition, serversMethodMap, err_1, method, errorObj, timeout, additionalOptionsCopy, invokePromises, invocationMessages, results, allRejected;
                        var _this = this;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
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
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 4]);
                                    return [4, this.tryToAwaitForMethods(methodDefinition, target, additionalOptions)];
                                case 2:
                                    serversMethodMap = _b.sent();
                                    return [3, 4];
                                case 3:
                                    err_1 = _b.sent();
                                    method = __assign$1(__assign$1({}, methodDefinition), { getServers: function () { return []; }, supportsStreaming: false, objectTypes: (_a = methodDefinition.objectTypes) !== null && _a !== void 0 ? _a : [] });
                                    errorObj = {
                                        method: method,
                                        called_with: argumentObj,
                                        message: "Can not find a method matching " + JSON.stringify(methodFilter) + " with server filter " + JSON.stringify(target),
                                        executed_by: undefined,
                                        returned: undefined,
                                        status: undefined,
                                    };
                                    return [2, Promise.reject(errorObj)];
                                case 4:
                                    timeout = additionalOptions.methodResponseTimeoutMs;
                                    additionalOptionsCopy = additionalOptions;
                                    invokePromises = serversMethodMap.map(function (serversMethodPair) {
                                        var invId = shortid();
                                        var method = serversMethodPair.methods[0];
                                        var server = serversMethodPair.server;
                                        var invokePromise = _this.protocol.client.invoke(invId, method, argumentObj, server, additionalOptionsCopy);
                                        return Promise.race([
                                            invokePromise,
                                            rejectAfter(timeout, invokePromise, {
                                                invocationId: invId,
                                                message: "Invocation timeout (" + timeout + " ms) reached for method name: " + (method === null || method === void 0 ? void 0 : method.name) + ", target instance: " + JSON.stringify(server.instance) + ", options: " + JSON.stringify(additionalOptionsCopy),
                                                status: InvokeStatus.Error,
                                            })
                                        ]);
                                    });
                                    return [4, Promise.all(invokePromises)];
                                case 5:
                                    invocationMessages = _b.sent();
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
                return __generator(this, function (_a) {
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
                return __generator(this, function (_a) {
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
                return __generator(this, function (_a) {
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
                return __generator(this, function (_a) {
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
                return __generator(this, function (_a) {
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
            this.wrapped.application = (_a = resolvedIdentity.application) !== null && _a !== void 0 ? _a : shortid();
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
            this.callbacks = lib$1();
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
            var that = this;
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
                getServers: function () {
                    return that.getServersByMethod(identifier);
                }
            };
            methodDefinition.object_types = methodDefinition.objectTypes;
            methodDefinition.display_name = methodDefinition.displayName;
            methodDefinition.version = methodDefinition.version;
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
        ClientRepository.prototype.getServersByMethod = function (identifier) {
            var _this = this;
            var allServers = [];
            Object.keys(this.servers).forEach(function (serverId) {
                var server = _this.servers[serverId];
                Object.keys(server.methods).forEach(function (methodId) {
                    var methodInfo = server.methods[methodId];
                    if (methodInfo.identifier === identifier) {
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
            this.callbacks = lib$1();
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
            this.callbacks = lib$1();
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
                return __generator(this, function (_a) {
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
            if ("_tag" in msg) {
                var invocationId = msg._tag.invocationId;
                var serverId = msg._tag.serverId;
                var server = this.repository.getServerById(serverId);
                var message = msg.reason;
                var context_1 = msg.context;
                return {
                    invocationId: invocationId,
                    result: context_1,
                    instance: server.instance,
                    status: InvokeStatus.Error,
                    message: message
                };
            }
            else {
                return {
                    invocationId: "",
                    message: msg.message,
                    status: InvokeStatus.Error,
                    error: msg
                };
            }
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
        var glueInitTimer = timer("glue");
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
                inner.marks = t.marks;
                if (_allowTrace) {
                    _logger.trace(name + " is ready - " + (t.endTime - t.startTime));
                }
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
            var initTimer = timer("connection");
            _connection = new Connection(internalConfig.connection, _logger.subLogger("connection"));
            var authPromise = Promise.resolve(internalConfig.auth);
            if (internalConfig.connection && !internalConfig.auth) {
                if (glue42gd) {
                    authPromise = glue42gd.getGWToken()
                        .then(function (token) {
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
                initTimer.mark("auth-promise-resolved");
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
            var initTimer = timer("logger");
            _logger = new Logger("" + ((_a = internalConfig.connection.identity) === null || _a === void 0 ? void 0 : _a.application), undefined, internalConfig.customLogger);
            _logger.consoleLevel(internalConfig.logger.console);
            _logger.publishLevel(internalConfig.logger.publish);
            if (_logger.canPublish("debug")) {
                _logger.debug("initializing glue...");
            }
            registerLib("logger", _logger, initTimer);
            return Promise.resolve(undefined);
        }
        function setupMetrics() {
            var _a, _b, _c, _d;
            var initTimer = timer("metrics");
            var config = internalConfig.metrics;
            var metricsPublishingEnabledFunc = glue42gd === null || glue42gd === void 0 ? void 0 : glue42gd.getMetricsPublishingEnabled;
            var identity = internalConfig.connection.identity;
            var canUpdateMetric = metricsPublishingEnabledFunc ? metricsPublishingEnabledFunc : function () { return true; };
            var disableAutoAppSystem = (_a = (typeof config !== "boolean" && config.disableAutoAppSystem)) !== null && _a !== void 0 ? _a : false;
            _metrics = metrics({
                connection: config ? _connection : undefined,
                logger: _logger.subLogger("metrics"),
                canUpdateMetric: canUpdateMetric,
                system: "Glue42",
                service: (_b = identity === null || identity === void 0 ? void 0 : identity.service) !== null && _b !== void 0 ? _b : "metrics-service",
                instance: (_d = (_c = identity === null || identity === void 0 ? void 0 : identity.instance) !== null && _c !== void 0 ? _c : identity === null || identity === void 0 ? void 0 : identity.windowId) !== null && _d !== void 0 ? _d : shortid(),
                disableAutoAppSystem: disableAutoAppSystem,
                pagePerformanceMetrics: typeof config !== "boolean" ? config === null || config === void 0 ? void 0 : config.pagePerformanceMetrics : undefined
            });
            registerLib("metrics", _metrics, initTimer);
            return Promise.resolve();
        }
        function setupInterop() {
            var initTimer = timer("interop");
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
                var initTimer = timer("contexts");
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
                return __generator(this, function (_a) {
                    if (!internalConfig.bus) {
                        return [2, Promise.resolve()];
                    }
                    initTimer = timer("bus");
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
            var initTimer = timer(name);
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
                coreVersion: version,
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
                    var all = getAllTimers();
                    return Object.keys(all).map(function (key) {
                        var t = all[key];
                        return {
                            name: key,
                            duration: t.endTime - t.startTime,
                            marks: t.marks
                        };
                    });
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
            if (glue.agm) {
                var deprecatedDecorator = function (fn, wrong, proper) {
                    return function () {
                        glue.logger.warn("glue.js - 'glue.agm." + wrong + "' method is deprecated, use 'glue.interop." + proper + "' instead.");
                        fn.apply(glue.agm, arguments);
                    };
                };
                var agmAny = glue.agm;
                agmAny.method_added = deprecatedDecorator(glue.agm.methodAdded, "method_added", "methodAdded");
                agmAny.method_removed = deprecatedDecorator(glue.agm.methodRemoved, "method_removed", "methodRemoved");
                agmAny.server_added = deprecatedDecorator(glue.agm.serverAdded, "server_added", "serverAdded");
                agmAny.server_method_aded = deprecatedDecorator(glue.agm.serverMethodAdded, "server_method_aded", "serverMethodAdded");
                agmAny.server_method_removed = deprecatedDecorator(glue.agm.serverMethodRemoved, "server_method_removed", "serverMethodRemoved");
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
    GlueCore.version = version;
    GlueCore.default = GlueCore;

    var version$1 = "2.0.0-beta.0";

    const glueWebFactory = createFactoryFunction(GlueCore);
    if (typeof window !== "undefined") {
        const windowAny = window;
        windowAny.GlueWeb = glueWebFactory;
        delete windowAny.GlueCore;
    }
    glueWebFactory.version = version$1;

    return glueWebFactory;

})));
//# sourceMappingURL=web.umd.js.map
