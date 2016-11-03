let /** @type {function(new: Document): ?} */ x = Document;
class X {
/**
 * @param {number} a
 */
constructor(private a: number) {}
}

// tsickle -> Closure type declarations
 /** @type {number} */
X.prototype.a;

let /** @type {function(new: X, number): ?} */ y: {new (a: number): X} = X;
