import ejs from 'ejs'
import path from 'path'
export async function renderEJS(templateRelPath: string, data: any){
  const file = path.join(process.cwd(), templateRelPath)
  return new Promise<string>((resolve, reject)=>{ ejs.renderFile(file, data, {async:false}, (err, str)=>{ if(err) reject(err); else resolve(str) }) })
}
