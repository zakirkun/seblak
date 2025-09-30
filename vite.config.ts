import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'
  
  return {
    plugins: [
      react(),
      ...(isLib ? [dts({ include: ['src/lib'] })] : [])
    ],
    ...(isLib && {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/lib/index.ts'),
          name: 'Seblak',
          formats: ['es', 'umd'],
          fileName: (format) => `seblak.${format}.js`
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            }
          }
        }
      }
    })
  }
})
