import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import license from 'rollup-plugin-license'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      ...license({
        thirdParty: {
          output: {
            file: path.join('dist', 'THIRD-PARTY-LICENSES.txt'),
            template(dependencies) {
              return dependencies
                .map(dep =>
                  [
                    `${dep.name}@${dep.version}`,
                    dep.license,
                    dep.licenseText ?? '(see package for full license text)',
                  ].join('\n')
                )
                .join('\n\n---\n\n');
            },
          },
        },
      }),
      apply: 'build',
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          i18n: ['i18next', 'react-i18next'],
          maps: ['react-simple-maps', 'maplibre-gl'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
