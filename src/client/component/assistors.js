"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assistor_types_1 = require("./assistor.types");
exports.assistors = [
    // ===
    //   - xxxIyyy
    // ===
    //   - xxx
    //   - Iyyy
    // ===
    {
        keys: { key: 'Enter' },
        name: 'add new line, preserving leading spaces and bullet',
        transform: function (state) {
            var reg = new RegExp("^( *)(" + assistor_types_1.BULLET + ")?(.*)" + assistor_types_1.CURSOR + "(.*)$", 'gm');
            var match = reg.exec(state);
            if (match) {
                var matched = match[0], leadingSpaces = match[1], bullet = match[2], beforeCursor = match[3], afterCursor = match[4];
                if (leadingSpaces === '' && bullet === undefined)
                    return undefined;
                return state.replace(matched, beforeCursor === ' ' && afterCursor === ''
                    ? "" + assistor_types_1.CURSOR
                    : bullet === undefined
                        ? "" + leadingSpaces + beforeCursor + "\n" + leadingSpaces + assistor_types_1.CURSOR + afterCursor
                        : "" + leadingSpaces + bullet + beforeCursor + "\n" + leadingSpaces + bullet + " " + assistor_types_1.CURSOR + afterCursor);
            }
        },
    },
    // ===
    //       I
    // ===
    // I
    // ===
    {
        keys: { key: 'Backspace' },
        name: 'de-indent',
        transform: function (state) {
            var reg = new RegExp("^( +)" + assistor_types_1.CURSOR + "(.*)$", 'gm');
            var match = reg.exec(state);
            if (match) {
                var matched = match[0], leadingSpaces = match[1], afterCursor = match[2];
                var deindented = leadingSpaces.replace(' ', '').replace(' ', '');
                return state.replace(matched, "" + deindented + assistor_types_1.CURSOR + afterCursor);
            }
        },
    },
    // ===
    //   I
    // ===
    //     I
    // ===
    {
        keys: { key: 'Tab' },
        name: 'indent',
        transform: function (state) {
            var reg = new RegExp("^( *)" + assistor_types_1.CURSOR + "(.*)$", 'gm');
            var match = reg.exec(state);
            if (match) {
                var matched = match[0], leadingSpaces = match[1], afterCursor = match[2];
                return state.replace(matched, leadingSpaces + "  " + assistor_types_1.CURSOR + afterCursor);
            }
        },
    },
    // ===
    //     I
    // ===
    //   I
    // ===
    {
        keys: { key: 'Tab', shift: true },
        name: 'deindent',
        transform: function (state) {
            var reg = new RegExp("^( +)" + assistor_types_1.CURSOR + "(.*)$", 'gm');
            var match = reg.exec(state);
            if (match) {
                var matched = match[0], leadingSpaces = match[1], afterCursor = match[2];
                var deindented = leadingSpaces.replace(' ', '').replace(' ', '');
                return state.replace(matched, "" + deindented + assistor_types_1.CURSOR + afterCursor);
            }
        },
    },
    // ===
    //   - xxxIyyy
    // ===
    //     - xxxIyyy
    // ===
    {
        keys: { key: 'Tab' },
        name: 'indent list item',
        transform: function (state) {
            var reg = new RegExp("^( *)(" + assistor_types_1.BULLET + ") (.*)" + assistor_types_1.CURSOR + "(.*)$", 'gm');
            var match = reg.exec(state);
            if (match) {
                var matched = match[0], leadingSpaces = match[1], bullet = match[2], beforeCursor = match[3], afterCursor = match[4];
                return state.replace(matched, leadingSpaces + "  " + bullet + " " + beforeCursor + assistor_types_1.CURSOR + afterCursor);
            }
        },
    },
    // ===
    //   - xxxIyyy
    // ===
    //     - xxxIyyy
    // ===
    {
        keys: { key: 'Tab', shift: true },
        name: 'deindent list item',
        transform: function (state) {
            var reg = new RegExp("^( +)(" + assistor_types_1.BULLET + ") (.*)" + assistor_types_1.CURSOR + "(.*)$", 'gm');
            var match = reg.exec(state);
            if (match) {
                var matched = match[0], leadingSpaces = match[1], bullet = match[2], beforeCursor = match[3], afterCursor = match[4];
                var deindented = leadingSpaces.replace(' ', '').replace(' ', '');
                return state.replace(matched, "" + deindented + bullet + " " + beforeCursor + assistor_types_1.CURSOR + afterCursor);
            }
        },
    },
    // ===
    //   xxxIyyy
    //   yyyyyyy
    //   yyyyyyy
    //   yyyIxxx
    // ===
    //     xxxIyyy
    //     yyyyyyy
    //     yyyyyyy
    //     yyyIxxx
    // ===
    {
        keys: { key: 'Tab' },
        name: 'indent multiple lines',
        transform: function (state) {
            var reg = new RegExp("^.*" + assistor_types_1.START + "(\n|.)+" + assistor_types_1.END + ".*$", 'gm');
            var match = reg.exec(state);
            if (match) {
                var matched = match[0];
                var lines = matched
                    .split('\n')
                    .map(function (line) { return '  ' + line; })
                    .join('\n');
                return state.replace(matched, lines);
            }
        },
    },
    // ===
    //     xxxIyyy
    //     yyyyyyy
    //     yyyyyyy
    //     yyyIxxx
    // ===
    //   xxxIyyy
    //   yyyyyyy
    //   yyyyyyy
    //   yyyIxxx
    // ===
    {
        keys: { key: 'Tab', shift: true },
        name: 'deindent multiple lines',
        transform: function (state) {
            var reg = new RegExp("^.*" + assistor_types_1.START + "(\n|.)+" + assistor_types_1.END + ".*$", 'gm');
            var match = reg.exec(state);
            if (match) {
                var matched = match[0];
                var deindent = function (str) {
                    return str.replace(/^ /, '').replace(/^ /, '');
                };
                var lines = matched
                    .split('\n')
                    .map(deindent)
                    .join('\n');
                return state.replace(matched, lines);
            }
        },
    },
    {
        keys: { key: 'Tab' },
        name: 'just add two spaces',
        transform: function (state) {
            var reg = new RegExp("" + assistor_types_1.CURSOR, 'gm');
            return state.replace(reg, "  " + assistor_types_1.CURSOR);
        },
    },
];
//# sourceMappingURL=assistors.js.map