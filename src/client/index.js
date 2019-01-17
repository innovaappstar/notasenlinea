"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mithril_1 = __importDefault(require("mithril"));
var socket_io_client_1 = __importDefault(require("socket.io-client"));
var editor_1 = require("./component/editor");
require("./style/main.css");
var socket = socket_io_client_1.default();
var getId = function () {
    return decodeURIComponent(location.pathname.slice(1));
};
var App = {
    id: '',
    networkStatus: '',
    saveStatusClass: '',
    saveStatusTimer: undefined,
    oninit: function () {
        this.id = getId();
        document.title = this.id + " \u00B7 notepad";
        this.startMonitorNetwork();
    },
    startMonitorNetwork: function () {
        var _this = this;
        var events = {
            connect: '',
            reconnect: '',
            reconnect_attempt: 'connection lost',
            connect_error: 'connection lost',
            connect_timeout: 'connection lost',
            reconnect_error: 'connection lost',
            reconnect_failed: 'connection lost',
        };
        Object.keys(events).forEach(function (evt) {
            return socket.on(evt, function () {
                _this.networkStatus = events[evt];
                mithril_1.default.redraw();
            });
        });
    },
    onSaveStatusChange: function (isSaving) {
        var _this = this;
        clearTimeout(this.saveStatusTimer);
        if (isSaving) {
            this.saveStatusClass = 'show';
            mithril_1.default.redraw();
        }
        else {
            this.saveStatusTimer = window.setTimeout(function () {
                _this.saveStatusClass = '';
                mithril_1.default.redraw();
            }, 300);
        }
    },
    view: function () {
        var href = location.origin + '/' + this.id;
        return mithril_1.default('main', mithril_1.default('header', [
            mithril_1.default('small#save-status', { class: this.saveStatusClass }, 'saving'),
            mithril_1.default('small#network-status', this.networkStatus),
        ]), mithril_1.default('section', [
            mithril_1.default('.layer', [
                mithril_1.default('.layer', [
                    mithril_1.default('.layer', [
                        mithril_1.default(editor_1.Editor, {
                            socket: socket,
                            id: this.id,
                            onStatusChange: this.onSaveStatusChange.bind(this),
                        }),
                    ]),
                ]),
            ]),
        ]), mithril_1.default('footer', mithril_1.default('small', mithril_1.default('a.this-page', { href: href }, decodeURIComponent(href)))));
    },
};
mithril_1.default.mount(document.body, App);
//# sourceMappingURL=index.js.map