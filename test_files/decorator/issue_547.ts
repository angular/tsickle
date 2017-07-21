/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var describe: Function;
var it: Function;
/** @Annotation */
var Component: Function;

export function main() {
  describe(() => {
    class SomeService {}
    it(() => {
      @Component({template: '<div someDir>{{1 | somePipe}}</div>'})
      class TestComp3 {
        constructor(service: SomeService) {}
      }
    });

  });
}
