// Run the real adapter media contract in the default CI suite, on its own local origin.
import {test} from '@playwright/test';
import {createServer,type ViteDevServer} from 'vite';
import '../adapters/browser/adapter.spec';
let server:ViteDevServer;
test.use({baseURL:'http://127.0.0.1:4184'});
test.beforeAll(async()=>{server=await createServer({server:{host:'127.0.0.1',port:4184,strictPort:true}});await server.listen();});
test.afterAll(async()=>{await server?.close();});
