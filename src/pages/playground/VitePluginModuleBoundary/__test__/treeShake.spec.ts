import { describe, expect, jest, test } from "@jest/globals";
import { removeUnUsedIfStatement, removeUnUsedReturn, removeUnusedImports } from "../treeShake";
const generate = require('@babel/generator').default;
const parser = require('@babel/parser');
const code = `
import { getMENU } from './normal';
import { getMENU as getSellerMENU } from './seller';
import { DispatchLogicType } from '@common/constants';

export default {
  [DispatchLogicType.Region]: {
    getMenu: () => {
      if (IS_BR || IS_SG) {
        console.log('is br or sg');
      } else if (IS_MY || IS_ID) {
        console.log('is my or id');
      }
      const fn = () => {
        return 'hello'
      };
      if (IS_BR) {
        return getSellerMENU();;
      } else {
        return getMENU();
      }
      return getSellerMENU();
    }
  }
};
`
const Envs = {
  IS_BR: false,
  IS_SG: false,
  IS_MY: true, // true
  IS_ID: false
}

let ast = parser.parse(code, {
  sourceType: 'module',
  plugins: []
});

describe("VitePluginModuleBoundary", () => {
  test("1.removeUnUsedIfStatement", () => {
    
    let output = generate(removeUnUsedIfStatement(ast, Envs), {}, code)
    expect(output.code).toMatchSnapshot();
    expect(output.code).toContain(`console.log('is my or id');`);
    expect(output.code).not.toContain(`if (IS_BR || IS_SG) {`);
    expect(output.code).not.toContain(`if (IS_BR) {`);
  })

  test("2.removeUnusedReturnStatement", () => {
    let output = generate(removeUnUsedReturn(ast), {}, code)
    expect(output.code).toMatchSnapshot();
    expect(output.code).toContain(`return getMENU();`);
    expect(output.code).not.toContain(`return getSellerMENU();`);
  })

  test("3.removeUnUsedImports", () => {
    
    let output = generate(removeUnusedImports(ast), {}, code)
    expect(output.code).toMatchSnapshot();
    expect(output.code).toContain(`import { getMENU } from './normal';`);
    expect(output.code).not.toContain(`import { getMENU as getSellerMENU } from './seller';`);
  })
});