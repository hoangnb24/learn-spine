import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/authoring/browser',timeout:60000,workers:1,use:{baseURL:'http://127.0.0.1:4199',viewport:{width:1500,height:1000}},webServer:{command:'npm run dev -- --port 4199 --strictPort',url:'http://127.0.0.1:4199',reuseExistingServer:!process.env.CI},reporter:'list'});
