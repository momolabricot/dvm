import ejs from 'ejs'
import path from 'path'

export async function renderEJS(
  relPath: string,
  data: Record<string, unknown>
): Promise<string> {
  const fullPath = path.isAbsolute(relPath) ? relPath : path.join(process.cwd(), relPath)
  return await ejs.renderFile(fullPath, data, { rmWhitespace: true })
}
