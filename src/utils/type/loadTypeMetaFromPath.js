import { get, has, readFile, set } from '@serverless/utils'
import { dirname, isAbsolute, resolve } from 'path'
import errorTypeFileNotFound from './errorTypeFileNotFound'
import findTypeFileAtPath from './findTypeFileAtPath'

/**
 * @param {string} typePath the file path to look for a serverless config file
 * @param {*} context
 * @returns {{
 *   root: string,
 *   props: string
 * }}
 */
const loadTypeMetaFromPath = async (typePath, context) => {
  let absoluteTypePath = typePath
  if (!isAbsolute(typePath)) {
    absoluteTypePath = resolve(context.cwd, typePath)
  }

  // check for type meta in cache
  const cache = get('types.meta', context.cache)
  let typeMeta = get([ absoluteTypePath ], cache)
  if (typeMeta) {
    return typeMeta
  }

  // no type meta found, load file
  const typeFilePath = await findTypeFileAtPath(absoluteTypePath)
  if (!typeFilePath) {
    throw errorTypeFileNotFound(dirname(typeFilePath))
  }
  typeMeta = {
    root: dirname(typeFilePath),
    props: await readFile(typeFilePath)
  }

  // store type meta data in cache
  context.cache = set('types.meta', set([ absoluteTypePath ], typeMeta, cache), context.cache)
  return typeMeta
}

export default loadTypeMetaFromPath