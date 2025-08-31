import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
    coverage: {
      provider: 'v8', // ou 'istanbul', dependendo do que você está usando
      exclude: [
        'generated/**', // Exclui o diretório gerado pelo Prisma
        'node_modules/**', // Exclui node_modules
        '**/*.map', // Exclui arquivos de source map
      ],
    },
  },
})