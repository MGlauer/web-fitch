import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import { env } from 'node:process';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '',
    define: {
        'APP_VERSION': JSON.stringify(env.npm_package_version),
    }
})
