"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StreamState;
(function (StreamState) {
    StreamState[StreamState["Initial"] = 0] = "Initial";
    StreamState[StreamState["Started"] = 1] = "Started";
    StreamState[StreamState["Ended"] = 2] = "Ended";
    StreamState[StreamState["Errored"] = 3] = "Errored";
})(StreamState || (StreamState = {}));
var StreamClass = /** @class */ (function () {
    function StreamClass() {
        this.listeners = [];
        this.dependents = [];
        this.state = StreamState.Initial;
        this.value = undefined;
        this.changed = false;
    }
    StreamClass.create = function (init) {
        var stream$ = function (val) {
            if (typeof val === 'undefined') {
                return stream$.value;
            }
            else {
                if (stream$.state === StreamState.Initial) {
                    stream$.state = StreamState.Started;
                }
                stream$.update(val);
                stream$.flush();
            }
        };
        if (typeof init === 'undefined') {
            stream$.state = StreamState.Started;
        }
        stream$.value = init;
        stream$.changed = false;
        stream$.listeners = [];
        stream$.dependents = [];
        Object.setPrototypeOf(stream$, StreamClass.prototype);
        return stream$;
    };
    StreamClass.combine = function (combiner, streams) {
        var cached = streams.map(function (stream$) { return stream$(); });
        var allHasValue = function (arr) {
            return arr.every(function (elem) { return typeof elem !== 'undefined'; });
        };
        var combined$ = exports.Stream(allHasValue(cached) ? combiner.apply(void 0, cached) : undefined);
        streams.forEach(function (stream, i) {
            stream.dependents.push({
                update: function (val) {
                    cached[i] = val;
                    if (allHasValue(cached)) {
                        combined$.update(combiner.apply(void 0, cached));
                    }
                },
                flush: function () {
                    combined$.flush();
                },
            });
        });
        return combined$;
    };
    StreamClass.merge = function (streams) {
        var merged$ = exports.Stream();
        streams.forEach(function (stream$) {
            stream$.subscribe(function (val) { return merged$(val); });
        });
        return merged$;
    };
    StreamClass.interval = function (interval) {
        var interval$ = exports.Stream();
        setInterval(function () { return interval$(null); }, interval);
        return interval$;
    };
    StreamClass.fromEvent = function (elem, type) {
        var event$ = exports.Stream();
        elem.addEventListener(type, event$);
        return event$;
    };
    StreamClass.prototype.update = function (val) {
        this.value = val;
        this.state = StreamState.Started;
        this.changed = true;
        this.dependents.forEach(function (dep) { return dep.update(val); });
    };
    StreamClass.prototype.flush = function () {
        var _this = this;
        if (this.changed) {
            this.changed = false;
            if (this.state === StreamState.Started) {
                this.listeners.forEach(function (l) { return l(_this.value); });
            }
            this.dependents.forEach(function (dep) { return dep.flush(); });
        }
    };
    StreamClass.prototype.asStream = function () {
        return this;
    };
    StreamClass.prototype.subscribe = function (listener, emitOnSubscribe) {
        if (emitOnSubscribe && this.state === StreamState.Started) {
            listener(this.value);
        }
        this.listeners.push(listener);
        return this;
    };
    StreamClass.prototype.log = function (name) {
        this.subscribe(function (val) {
            return console.log("[stream] " + name + ": " + JSON.stringify(val));
        });
        return this;
    };
    StreamClass.prototype.map = function (mapper) {
        return exports.Stream.combine(mapper, [this.asStream()]);
    };
    StreamClass.prototype.startWith = function (x) {
        var stream$ = exports.Stream(x);
        this.subscribe(function (val) { return stream$(val); });
        return stream$;
    };
    StreamClass.prototype.unique = function () {
        var lastValue = this.value;
        var unique$ = exports.Stream(lastValue);
        this.subscribe(function (val) {
            if (val !== lastValue) {
                unique$(val);
                lastValue = val;
            }
        });
        return unique$;
    };
    StreamClass.prototype.filter = function (predict) {
        var filtered$ = exports.Stream();
        this.subscribe(function (val) {
            if (predict(val)) {
                filtered$(val);
            }
        });
        return filtered$;
    };
    StreamClass.prototype.delay = function (delayInMs) {
        var delayed$ = exports.Stream();
        this.subscribe(function (value) {
            setTimeout(function () {
                delayed$(value);
            }, delayInMs);
        });
        return delayed$;
    };
    StreamClass.prototype.debounce = function (delay) {
        var debounced$ = exports.Stream();
        var timer;
        this.subscribe(function (val) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                debounced$(val);
            }, delay);
        });
        return debounced$;
    };
    StreamClass.prototype.until = function (condition$) {
        var _this = this;
        var pending = !condition$();
        var until$ = exports.Stream(pending ? undefined : this.value);
        condition$.subscribe(function (isOk) {
            if (isOk && pending) {
                pending = false;
                until$(_this.value);
            }
        });
        this.subscribe(function (val) {
            if (!condition$()) {
                pending = true;
            }
            else {
                until$(val);
            }
        });
        return until$;
    };
    return StreamClass;
}());
exports.Stream = Object.assign(StreamClass.create, StreamClass);
//# sourceMappingURL=stream.js.map