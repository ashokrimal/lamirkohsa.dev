/**
 * Loads the TypeScript CMS schema from a plain Node script.
 *
 * The schema is the single source of structure for getters, seeds and the health
 * check. Node cannot import `.ts` directly on the Node version this project
 * deploys with, so the script transpiles the schema in memory with the
 * TypeScript package that is already a dev dependency. No file is written.
 */
import fs from 'node:fs'
import ts from 'typescript'

export async function loadCmsSchema() {
  const sourcePath = new URL('../src/lib/cms-schema.ts', import.meta.url)
  const source = fs.readFileSync(sourcePath, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: 'cms-schema.ts',
  })
  const encoded = Buffer.from(outputText, 'utf8').toString('base64')
  return import(`data:text/javascript;base64,${encoded}`)
}
