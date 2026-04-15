import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'finsoc-website',

  projectId: '58vcqj2e',
  dataset: 'finsoc',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
