"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const koa_send_1 = __importDefault(require("koa-send"));
const path_1 = __importDefault(require("path"));
const note_1 = require("../service/note");
const router = new koa_router_1.default();
const publicPath = path_1.default.resolve(__dirname, '../../public');
//const publicPath = path.resolve(__dirname, '../../src')
// use '.all()' here because koa-router's '.use()' is kinda useless
// see: https://github.com/alexmingoia/koa-router/issues/257
router.all('/dist/:file*', async (ctx, next) => {
    try {
        const filePath = ctx.path.replace(/^\/dist/, '');
        await koa_send_1.default(ctx, filePath, {
            root: publicPath,
        });
    }
    catch (err) {
        if (err.status !== 404) {
            throw err;
        }
    }
});
router.get('/', async function (ctx, next) {
    await ctx.redirect(note_1.noteService.genRandomId());
});
router.get('/:id*', async function (ctx, next) {
    await koa_send_1.default(ctx, 'index.html', {
        root: path_1.default.resolve(__dirname, '../../public'),
    });
});
exports.routes = router.routes();
//# sourceMappingURL=index.js.map