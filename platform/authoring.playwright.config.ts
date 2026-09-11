import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/authoring/browser',timeout:60000,workers:1,use:{viewport:{width:1500,height:1000}},reporter:'list'});
