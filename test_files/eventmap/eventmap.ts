/**
 * @fileoverview
 * @suppress {checkTypes}
 */

export {};

declare global {
  class WobbleEvent extends Event {}
  interface HTMLElementEventMap {
    wobble: WobbleEvent;
  }
}

document.body.addEventListener('wobble', (we: WobbleEvent) => {
  console.log('wobble!');
});
