"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mithril_1 = __importDefault(require("mithril"));
var string_hash_1 = __importDefault(require("string-hash"));
var diff3_1 = require("../util/diff3");
var stream_1 = require("../util/stream");
var assist_1 = require("./assist");
var assistor_types_1 = require("./assistor.types");
var verify = function (str, hash) {
    return str != null && string_hash_1.default(str) === hash;
};
exports.Editor = {
    oncreate: function (_a) {
        var dom = _a.dom, _b = _a.attrs, id = _b.id, socket = _b.socket, onStatusChange = _b.onStatusChange;
        var $editor = dom;
        //------ events --------
        var remoteNote$ = remoteNoteStream();
        var isRemoteNoteStale$ = remoteNote$.map(function () { return false; });
        var isNotCompositing$ = compositingStream($editor)
            .unique()
            .map(function (comp) { return !comp; });
        var input$ = stream_1.Stream.fromEvent($editor, 'input').map(function () { return null; });
        var keydown$ = stream_1.Stream.fromEvent($editor, 'keydown');
        var commonParent$ = stream_1.Stream($editor.value); // the 'o' in threeWayMerge(a,o,b)
        var shouldSave$ = input$.debounce(500).map(function () { return null; });
        var isSaving$ = stream_1.Stream(false);
        var isEditorDirty$ = stream_1.Stream.merge([
            input$.map(function () { return true; }),
            isSaving$.filter(function (s) { return !s; }).map(function () { return false; }),
        ]).startWith(false);
        //------ listeners --------
        keydown$
            .filter(function () { return isNotCompositing$(); })
            .subscribe(function (key) { return assist_1.assist($editor, key, function () { return input$(null); }); });
        remoteNote$.until(isNotCompositing$).subscribe(mergeToEditor, false);
        isRemoteNoteStale$
            .unique()
            .filter(Boolean)
            .subscribe(fetchNote);
        shouldSave$
            .until(isNotCompositing$)
            .subscribe(function () { return saveToRemote($editor.value); }, false);
        isSaving$.unique().subscribe(onStatusChange);
        isEditorDirty$.subscribe(setBeforeUnloadPrompt);
        //------- trigger fist fetch ---------
        isRemoteNoteStale$(true);
        return;
        function remoteNoteStream() {
            var remoteNote$ = stream_1.Stream($editor.value);
            socket.on('note_update', function (_a) {
                var hash = _a.h, patch = _a.p;
                var newNote = diff3_1.applyPatch(remoteNote$(), patch);
                if (verify(newNote, hash)) {
                    remoteNote$(newNote);
                }
                else {
                    isRemoteNoteStale$(true);
                }
            });
            socket.emit('subscribe', { id: id });
            return remoteNote$;
        }
        function fetchNote() {
            socket.emit('get', { id: id }, function (_a) {
                var note = (_a === void 0 ? {} : _a).note;
                if (note != null && isRemoteNoteStale$()) {
                    remoteNote$(note);
                    if ($editor.disabled) {
                        $editor.disabled = false;
                    }
                }
            });
        }
        function mergeToEditor() {
            var newRemoteNote = remoteNote$();
            if (newRemoteNote === $editor.value) {
                commonParent$(newRemoteNote);
            }
            else if (commonParent$() === $editor.value) {
                loadToEditor(newRemoteNote);
                commonParent$(newRemoteNote);
            }
            else {
                var merged = diff3_1.merge3(newRemoteNote, commonParent$(), $editor.value);
                if (merged == null) {
                    console.warn('failed to merge with remote version, discarding local version :(');
                    loadToEditor(newRemoteNote);
                    commonParent$(newRemoteNote);
                }
                else {
                    console.info('merged with remote version :)');
                    loadToEditor(merged);
                    commonParent$(newRemoteNote);
                    shouldSave$(null);
                }
            }
        }
        function loadToEditor(note) {
            if (note !== $editor.value) {
                var nextWithSelectionMark = getNextWithSelectionMark($editor.value, note);
                var _a = nextWithSelectionMark.split(new RegExp("(" + assistor_types_1.START + "|" + assistor_types_1.END + ")", 'mg')), before = _a[0], _start = _a[1], between = _a[2], _end = _a[3], after = _a[4];
                $editor.value = [before, between, after].join('');
                $editor.setSelectionRange(before.length, before.length + between.length);
            }
            function getNextWithSelectionMark(prev, next) {
                var selectionStart = $editor.selectionStart;
                var selectionEnd = $editor.selectionEnd;
                var prevWithSelectionMark = prev.substring(0, selectionStart) +
                    assistor_types_1.START +
                    prev.substring(selectionStart, selectionEnd) +
                    assistor_types_1.END +
                    prev.substring(selectionEnd);
                var nextWithSelectionMark = diff3_1.merge3(next, prev, prevWithSelectionMark);
                if (nextWithSelectionMark == null) {
                    return next + assistor_types_1.START + assistor_types_1.END;
                }
                else {
                    return nextWithSelectionMark;
                }
            }
        }
        function saveToRemote(note) {
            var remoteNote = remoteNote$();
            if (!isSaving$() && note !== remoteNote) {
                isSaving$(true);
                var msg = {
                    id: id,
                    p: diff3_1.createPatch(remoteNote, note),
                    h: string_hash_1.default(note),
                };
                socket.emit('save', msg, function (_a) {
                    var error = (_a === void 0 ? {} : _a).error;
                    isSaving$(false);
                    if (!error) {
                        commonParent$(note);
                        remoteNote$(note);
                    }
                    else {
                        if (error.errcode === 'HASH_MISMATCH') {
                            isRemoteNoteStale$(true);
                        }
                        else if (error.errcode === 'EXCEEDED_MAX_SIZE') {
                            window.alert('Note exceeded max size (100,000 characters), please do not abuse this free service.');
                        }
                    }
                });
            }
        }
        function compositingStream(elem) {
            var compositionStart$ = stream_1.Stream.fromEvent(elem, 'compositionstart');
            var compositionEnd$ = stream_1.Stream.fromEvent(elem, 'compositionend');
            var compositing$ = stream_1.Stream.merge([
                compositionStart$.map(function () { return true; }),
                compositionEnd$.map(function () { return false; }),
            ])
                .startWith(false)
                .unique();
            return compositing$;
        }
        function beforeunloadPrompt(e) {
            var confirmationMessage = 'Your change has not been saved, quit?';
            e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
            return confirmationMessage; // Gecko, WebKit, Chrome <34
        }
        function setBeforeUnloadPrompt(isDirty) {
            if (isDirty) {
                window.addEventListener('beforeunload', beforeunloadPrompt);
            }
            else {
                window.removeEventListener('beforeunload', beforeunloadPrompt);
            }
        }
    },
    onbeforeupdate: function () {
        // update textarea manually
        return false;
    },
    view: function () {
        return mithril_1.default('textarea#editor', { disabled: true, spellcheck: 'false' }, '(Loading...)');
    },
};
//# sourceMappingURL=editor.js.map