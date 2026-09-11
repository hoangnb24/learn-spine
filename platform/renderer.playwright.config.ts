import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/render/browser',reporter:'list',use:{baseURL:'http://127.0.0.1:4179',viewport:{width:1400,height:900}},webServer:{command:'npm run dev -- --port 4179 --strictPort',url:'http://127.0.0.1:4179',reuseExistingServer:false}});
