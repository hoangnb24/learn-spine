import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/adapters/browser',reporter:'list',use:{baseURL:'http://127.0.0.1:4184',viewport:{width:1300,height:950}},webServer:{command:'npm run dev -- --port 4184 --strictPort',url:'http://127.0.0.1:4184',reuseExistingServer:false}});
