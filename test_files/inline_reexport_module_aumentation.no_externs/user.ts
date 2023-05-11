/**
 * @fileoverview Test error message when a user tries to extend a proto by
 * augmenting the module.
 */

import {FooMsg} from './named.proto';

export {FooMsg} from './named.proto';

declare module './named.proto' {
  interface FooMsg {
    custom(): string;
  }
}

FooMsg.prototype.custom = (): string => {
  return 'Hello world';
};
