"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assistors_1 = require("./assistors");
var assistor_types_1 = require("./assistor.types");
var isMac = /Mac/.test(navigator.platform);
var isSameKey = function (a, b) {
    return (a.key.toLowerCase() === b.key.toLowerCase() &&
        Boolean(a.shift) === Boolean(b.shift) &&
        Boolean(a.alt) === Boolean(b.alt) &&
        Boolean(a.ctrl) === Boolean(b.ctrl));
};
var fromKeyboardEvent = function (e) {
    return {
        key: e.key.toLowerCase(),
        shift: Boolean(e.shiftKey),
        alt: Boolean(e.altKey),
        ctrl: Boolean(isMac ? e.metaKey : e.ctrlKey),
    };
};
exports.transform = function (state, keys) {
    var transformed;
    for (var index = 0; index < assistors_1.assistors.length; index++) {
        var assistor = assistors_1.assistors[index];
        if (isSameKey(keys, assistor.keys)) {
            transformed = assistor.transform(state);
            if (transformed != null) {
                break;
            }
        }
    }
    return transformed;
};
function assist($textarea, e, onAssisted) {
    // @ts-ignore
    if (e.isComposing)
        return;
    var keyEvent = e;
    var value = $textarea.value;
    var selectionStart = $textarea.selectionStart;
    var selectionEnd = $textarea.selectionEnd;
    var state = [
        value.substring(0, selectionStart),
        assistor_types_1.START,
        value.substring(selectionStart, selectionEnd),
        assistor_types_1.END,
        value.substring(selectionEnd),
    ].join('');
    var keys = fromKeyboardEvent(e);
    var transformed = exports.transform(state, keys);
    if (transformed != null) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation && e.stopImmediatePropagation();
        if (typeof transformed === 'string') {
            var _a = transformed.split(new RegExp("(" + assistor_types_1.START + "|" + assistor_types_1.END + ")", 'mg')), before = _a[0], _start = _a[1], between = _a[2], _end = _a[3], after = _a[4];
            $textarea.value = [before, between, after].join('');
            $textarea.setSelectionRange(before.length, before.length + between.length);
            $textarea.blur();
            $textarea.focus();
        }
        onAssisted();
    }
}
exports.assist = assist;
//# sourceMappingURL=assist.js.map