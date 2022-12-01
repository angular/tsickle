/**
 * @fileoverview Test that type casts are emitted when a type is used which was
 * narrowed since declaration.
 * @suppress {uselessCode}
 */

interface Foo {}

// Narrowing Foo to HasX.
interface HasX extends Foo {
  x: number;
}

function hasX(p: Foo): p is HasX {
  return (p as HasX).x !== undefined;
}

function getX(p: Foo) {
  if (!hasX(p)) return 0;
  // Expect a cast.
  return p.x;
}

function getXUnsafe(p: Foo) {
  const casted = p as HasX;
  // Expect no casts.
  return casted.x;
}

// Narrowing Foo to HasY and Foo.y to number.
interface HasY extends Foo {
  y:number|string;
}

function hasY(p: Foo): p is HasY {
  return (p as HasY).y !== undefined;
}

function getY(p: Foo) {
  if (!hasY(p)) return 0;
  // Expect a cast.
  return p.y;
}

function getYAsNumber(p: Foo) {
  if (!hasY(p)) return 0;
  if (typeof p.y === 'string') return 0;
  // Expect 2 casts.
  return p.y;
}

function getYAsNumberCheckPropertyOnly(p: HasY) {
  if (typeof p.y === 'string') return 0;
  // Expect no casts.
  return p.y;
}

// Narrowing `Fish | Bird` to Fish or Bird.
interface Fish {
  swim(): void;
}

interface Bird {
  fly(): void;
}

function isFish(pet: Fish|Bird|undefined): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function doAnimalAction(pet: Fish|Bird) {
  if (isFish(pet)) {
    // Expect a cast.
    pet.swim();
  } else {
    // Expect a cast.
    pet.fly();
  }
}

function maybeDoAnimalAction(pet: Fish|Bird|undefined) {
  if (isFish(pet)) {
    // Expect a cast.
    pet.swim();
  } else {
    // Expect no casts.
    pet?.fly();
  }
}