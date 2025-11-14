// Configuración de ESLint para el proyecto (JS + React)
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignora la carpeta de build para que ESLint no la analice
  globalIgnores(['dist']),
  {
    // Archivos donde se aplicará ESLint
    files: ['**/*.{js,jsx}'],

    // Configs base recomendadas (JS + React Hooks + Vite/React Fast Refresh)
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    // Opciones de lenguaje y entorno
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser, // Variables globales del navegador (window, document, etc.)
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true }, // Soporte para JSX
        sourceType: 'module',        // Usa módulos ES
      },
    },

    // Reglas personalizadas
    rules: {
      // Marca como error variables no usadas,
      // pero ignora las que empiezan con mayúscula o guion bajo (ej: _DEBUG, MyComponent)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
