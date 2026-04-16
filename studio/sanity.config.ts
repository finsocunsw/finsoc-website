import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'finsoc-website',
  deployment: {
    appId: 'vnx2th51d8e0rtyav5ywskap',
  },
  projectId: '58vcqj2e',
  dataset: 'finsoc',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
