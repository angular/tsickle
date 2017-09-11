/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {expect} from 'chai';
import * as ts from 'typescript';

import {createCustomTransformers, visitNodeWithSynthesizedComments} from '../src/transformer_util';
import * as tsickle from '../src/tsickle';
import {normalizeLineEndings} from '../src/util';

import * as testSupport from './test_support';

const MODULE_HEADER = `Object.defineProperty(exports, "__esModule", { value: true });`;

describe('transformer util', () => {
  function emitWithTransform(
      tsSources: {[fileName: string]: string},
      transform: ts.TransformerFactory<ts.SourceFile>): {[fileName: string]: string} {
    const {program, host} = testSupport.createProgramAndHost(objectToMap(tsSources));

    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length) {
      throw new Error(tsickle.formatDiagnostics(diagnostics));
    }
    const transformers = createCustomTransformers({before: [transform]});
    const jsSources: {[fileName: string]: string} = {};
    program.emit(undefined, (fileName: string, data: string) => {
      jsSources[fileName] = normalizeLineEndings(data);
    }, undefined, undefined, transformers);

    return jsSources;
  }

  describe('comments', () => {

    function transformComments(context: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile): ts.SourceFile => {
        return visitNode(sourceFile);

        function visitNode<T extends ts.Node>(node: T) {
          return visitNodeWithSynthesizedComments(context, sourceFile, node, visitNodeImpl);
        }

        function visitNodeImpl<T extends ts.Node>(node: T): T {
          visitComments(node, ts.getSyntheticLeadingComments(node));
          visitComments(node, ts.getSyntheticTrailingComments(node));
          return ts.visitEachChild(node, visitNode, context);
        }

        function visitComments(node: ts.Node, comments: ts.SynthesizedComment[]|undefined) {
          if (comments) {
            comments.forEach(c => c.text = `<${node.kind}>${c.text}`);
          }
        }
      };
    }

    it('should synthesize leading file comments', () => {
      const tsSources = {
        'a.ts': [
          `/*fc*/`,
          ``,
          `/*sc*/`,
          `const x = 1;`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./a.js']).to.eq([
        `/*<${ts.SyntaxKind.NotEmittedStatement}>fc*/`,
        `/*<${ts.SyntaxKind.VariableStatement}>sc*/`,
        `const x = 1;`,
        ``,
      ].join('\n'));
    });

    it('should synthesize trailing file comments', () => {
      const tsSources = {
        'a.ts': [
          `const x = 1; /*sc*/`,
          `/*fc*/`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./a.js']).to.eq([
        `const x = 1; /*<${ts.SyntaxKind.VariableStatement}>sc*/`,
        `/*<${ts.SyntaxKind.NotEmittedStatement}>fc*/ `,
        ``,
      ].join('\n'));
    });

    it('should synthesize leading block comments', () => {
      const tsSources = {
        'a.ts': [
          `{`,
          `  /*bc*/`,
          ``,
          `  /*sc*/`,
          `  const x = 1;`,
          `}`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./a.js']).to.eq([
        `{`,
        `    /*<${ts.SyntaxKind.NotEmittedStatement}>bc*/`,
        `    /*<${ts.SyntaxKind.VariableStatement}>sc*/`,
        `    const x = 1;`,
        `}`,
        ``,
      ].join('\n'));
    });

    it('should not treat leading statement comments as leading block comments', () => {
      const tsSources = {
        'a.ts': [
          `{`,
          `  /*a*/`,
          `  const a = 1`,
          `  /*b*/`,
          `  const b = 2;`,
          `}`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./a.js']).to.eq([
        `{`,
        `    /*<${ts.SyntaxKind.VariableStatement}>a*/`,
        `    const a = 1;`,
        `    /*<${ts.SyntaxKind.VariableStatement}>b*/`,
        `    const b = 2;`,
        `}`,
        ``,
      ].join('\n'));
    });


    it('should synthesize trailing block comments', () => {
      const tsSources = {
        'a.ts': [
          `{`,
          `  const x = 1;/*sc*/`,
          `  /*bc*/`,
          `}`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./a.js']).to.eq([
        `{`,
        `    const x = 1; /*<${ts.SyntaxKind.VariableStatement}>sc*/`,
        `    /*<${ts.SyntaxKind.NotEmittedStatement}>bc*/`,
        `}`,
        ``,
      ].join('\n'));
    });

    it('should synthesize different kinds of comments', () => {
      const tsSources = {
        'a.ts': [
          `/*mlc*/`,
          `//slc`,
          `///tc`,
          `const x = 1;`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      // Note: tripple line comments contain typescript specific information
      // and are removed.
      expect(jsSources['./a.js']).to.eq([
        `/*<${ts.SyntaxKind.VariableStatement}>mlc*/`,
        `//<${ts.SyntaxKind.VariableStatement}>slc`,
        `const x = 1;`,
        ``,
      ].join('\n'));
    });

    it('should synthesize leading comments', () => {
      const tsSources = {
        'a.ts': [
          `/*sc1*/`,
          `/*sc2*/`,
          `const x = 1;`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./a.js']).to.eq([
        `/*<${ts.SyntaxKind.VariableStatement}>sc1*/`,
        `/*<${ts.SyntaxKind.VariableStatement}>sc2*/`,
        `const x = 1;`,
        ``,
      ].join('\n'));
    });

    it('should synthesize trailing comments', () => {
      const tsSources = {
        'a.ts': [
          `const x = 1; /*sc*/`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./a.js']).to.eq([
        `const x = 1; /*<${ts.SyntaxKind.VariableStatement}>sc*/`,
        ``,
      ].join('\n'));
    });

    it('should separate leading and trailing comments', () => {
      const tsSources = {
        'a.ts': [
          `/*lc1*/ const x = 1; /*tc1*/`,
          `/*lc2*/ const y = 1; /*tc2*/`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./a.js']).to.eq([
        `/*<${ts.SyntaxKind.VariableStatement}>lc1*/ const x = 1; /*<${
            ts.SyntaxKind.VariableStatement}>tc1*/`,
        `/*<${ts.SyntaxKind.VariableStatement}>lc2*/ const y = 1; /*<${
            ts.SyntaxKind.VariableStatement}>tc2*/`,
        ``,
      ].join('\n'));
    });

    it('should synthesize comments on variables', () => {
      const tsSources = {'a.ts': `/*c*/ const /*x*/ x = 1, /*y*/ y = 1;`};
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./a.js'])
          .to.eq(
              `/*<${ts.SyntaxKind.VariableStatement}>c*/ const ` +
              `/*<${ts.SyntaxKind.VariableDeclaration}>x*/ x = 1, ` +
              `/*<${ts.SyntaxKind.VariableDeclaration}>y*/ y = 1;\n`);
    });

    it('should synthesize comments on exported variables', () => {
      const tsSources = {'a.ts': `/*c*/export const x = 1;`};
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./a.js']).to.eq([
        MODULE_HEADER,
        `/*<${ts.SyntaxKind.VariableStatement}>c*/ exports.x = 1;`,
        ``,
      ].join('\n'));
    });

    it('should synthesize comments on reexport stmts', () => {
      const tsSources = {'a.ts': 'export const x = 1', 'b.ts': `/*c*/export {x} from './a';`};
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./b.js']).to.eq([
        MODULE_HEADER,
        `/*<${ts.SyntaxKind.ExportDeclaration}>c*/ var a_1 = require("./a");`,
        `exports.x = a_1.x;`,
        ``,
      ].join('\n'));
    });

    it('should synthesize comments on import stmts', () => {
      const tsSources = {
        'a.ts': 'export const x = 1',
        'b.ts': `/*c*/import {x} from './a';console.log(x);`
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./b.js']).to.eq([
        MODULE_HEADER,
        `/*<${ts.SyntaxKind.ImportDeclaration}>c*/ const a_1 = require("./a");`,
        `console.log(a_1.x);`,
        ``,
      ].join('\n'));
    });

    it('should not synthesize comments of elided import stmts', () => {
      const tsSources = {
        'a.ts': 'export type t = number;',
        'b.ts': 'export const x = 1;',
        'c.ts': [
          `/*t*/import {t} from './a';`,
          `/*x*/import {x} from './b';`,
          `console.log(x);`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./c.js']).to.eq([
        MODULE_HEADER,
        `/*<${ts.SyntaxKind.ImportDeclaration}>x*/ const b_1 = require("./b");`,
        `console.log(b_1.x);`,
        ``,
      ].join('\n'));
    });

    it('should not synthesize comments of elided reexport stmts', () => {
      const tsSources = {
        'a.ts': 'export type t = number;',
        'b.ts': 'export const x = 1;',
        'c.ts': [
          `/*t*/export {t} from './a';`,
          `/*x*/export {x} from './b';`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./c.js']).to.eq([
        MODULE_HEADER,
        `/*<${ts.SyntaxKind.ExportDeclaration}>x*/ var b_1 = require("./b");`,
        `exports.x = b_1.x;`,
        ``,
      ].join('\n'));
    });

    it('should synthesize comments on properties with initializers', () => {
      const tsSources = {
        'a.ts': [
          `class C {`,
          `  /*c1*/static p1 = true;`,
          `  /*c2*/p2 = true;`,
          `}`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./a.js']).to.eq([
        `class C {`,
        `    constructor() {`,
        `        /*<${ts.SyntaxKind.PropertyDeclaration}>c2*/ this.p2 = true;`,
        `    }`,
        `}`,
        `/*<${ts.SyntaxKind.PropertyDeclaration}>c1*/ C.p1 = true;`,
        ``,
      ].join('\n'));
    });

    it('should synthesize comments on classes', () => {
      const tsSources = {
        'a.ts': [
          `/*c*/`,
          `class C {`,
          `  prop1 = 1;`,
          `}`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, transformComments);
      expect(jsSources['./a.js']).to.eq([
        `/*<${ts.SyntaxKind.ClassDeclaration}>c*/`,
        `class C {`,
        `    constructor() {`,
        `        this.prop1 = 1;`,
        `    }`,
        `}`,
        ``,
      ].join('\n'));
    });
  });

  describe('synthetic nodes with filled originalNode', () => {
    function synthesizeTransform(context: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile): ts.SourceFile => {
        return visitNode(sourceFile);

        function visitNode<T extends ts.Node>(node: T): T {
          if (node.kind === ts.SyntaxKind.Identifier) {
            const synthNode = ts.createIdentifier((node as ts.Node as ts.Identifier).text);
            ts.setOriginalNode(synthNode, node);
            ts.setTextRange(synthNode, node);
            node = synthNode as ts.Node as T;
          }
          return ts.visitEachChild(node, visitNode, context);
        }
      };
    }

    it('should not crash for synthetic property decorators', () => {
      const tsSources = {
        'a.ts': [
          `let decorator: any`,
          `class X {`,
          `  @decorator`,
          `  private x: number;`,
          `}`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, synthesizeTransform);
      expect(jsSources['./a.js']).to.eq([
        `let decorator;`,
        `class X {`,
        `}`,
        `__decorate([`,
        `    decorator,`,
        `    __metadata("design:type", Number)`,
        `], X.prototype, "x", void 0);`,
        ``,
      ].join('\n'));
    });

    it('should emit the top level variable for `module` statements', () => {
      const tsSources = {
        'a.ts': [
          `module Reflect {`,
          `  const x = 1;`,
          `}`,
        ].join('\n')
      };
      const jsSources = emitWithTransform(tsSources, synthesizeTransform);
      expect(jsSources['./a.js']).to.eq([
        `var Reflect;`,
        `(function (Reflect) {`,
        `    const x = 1;`,
        `})(Reflect || (Reflect = {}));`,
        ``,
      ].join('\n'));
    });

    it('should allow to change an export * into named exports', () => {
      function expandExportStar(context: ts.TransformationContext) {
        return (sourceFile: ts.SourceFile): ts.SourceFile => {
          return visitNode(sourceFile);

          function visitNode<T extends ts.Node>(node: T): T {
            if (node.kind === ts.SyntaxKind.ExportDeclaration) {
              const ed = node as ts.Node as ts.ExportDeclaration;
              const namedExports = ts.createNamedExports([ts.createExportSpecifier('x', 'x')]);
              return ts.updateExportDeclaration(
                         ed, undefined, undefined, namedExports, ed.moduleSpecifier) as ts.Node as
                  T;
            }
            return ts.visitEachChild(node, visitNode, context);
          }
        };
      }

      const tsSources = {'a.ts': `export const x = 1;`, 'b.ts': `export * from './a';`};
      const jsSources = emitWithTransform(tsSources, expandExportStar);
      expect(jsSources['./b.js']).to.eq([
        MODULE_HEADER,
        `var a_1 = require("./a");`,
        `exports.x = a_1.x;`,
        ``,
      ].join('\n'));
    });
  });
});

function objectToMap(data: {[key: string]: string}): Map<string, string> {
  const entries = Object.keys(data).map(key => [key, data[key]]) as Array<[string, string]>;
  return new Map(entries);
}
