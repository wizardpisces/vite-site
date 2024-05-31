import { Plugin } from "vite"
import { treeShake } from "./treeShake"

export const VitePluginModuleBoundary = (options:Record<string, boolean>):Plugin => {
  let config
  return {
    name: 'vite-plugin-module-boundary',
    configResolved(resolvedConfig) {
      // store the resolved config
      config = resolvedConfig
    },
    enforce: 'post', // 在其他 transform （可能是 tsx -> ts -> babel） 跑完之后才执行这个
    apply: 'serve', // 仅在开发环境下应用
    transform(code, id) {
      // if (config.command === 'serve') {// dev: plugin invoked by dev server
      if (/\/dispatchLogic\.(ts|tsx)$/.test(id)) {
        const [transformedCode,map] = treeShake(code, options)
        return {
          code: transformedCode,
          map
        }
      }
      return code;
    }
  }
}