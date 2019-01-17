import Router from 'koa-router'
import send from 'koa-send'
import path from 'path'
import { noteService } from '../service/note'

const router = new Router()
 
const publicPath = path.resolve(__dirname, '../../public')
//const publicPath = path.resolve(__dirname, '../../src')

// use '.all()' here because koa-router's '.use()' is kinda useless
// see: https://github.com/alexmingoia/koa-router/issues/257
router.all('/dist/:file*', async (ctx : any, next : any) => {
  try {
    const filePath = ctx.path.replace(/^\/dist/, '')
    await send(ctx, filePath, {
      root: publicPath,
    })
  } catch (err) {
    if (err.status !== 404) {
      throw err
    }
  }
})

router.get('/', async function(ctx : any, next: any) {
  await ctx.redirect(noteService.genRandomId())
})

router.get('/:id*', async function(ctx : any, next : any) {
  await send(ctx, 'index.html', {
    root: path.resolve(__dirname, '../../public'),
    //root: path.resolve(__dirname, '../../src/client'),
  })
})

export const routes = router.routes()
