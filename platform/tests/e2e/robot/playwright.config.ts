import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'gate.spec.ts',timeout:180000,use:{baseURL:'http://127.0.0.1:4184',viewport:{width:1900,height:1300},deviceScaleFactor:1},reporter:'list',workers:1});
