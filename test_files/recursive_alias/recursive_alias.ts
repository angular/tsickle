/**
 * @fileoverview This test checks that tsickle breaks out of recursive type
 * definitions where the type being declared is used as a type parameter.
 * @suppress {uselessCode}
 */

export {};

// Generic tree-like thing that uses a type parameter.
interface Tree<T> {
  child?: Tree<T>;
}

interface Node<T> {
  value: T;
}

// Declaring a type that uses itself is nonsense, this should produce a Tree<?>.
type NumberTree = Tree<NumberTree>;

type NumberNodeTree = Tree<Node<NumberNodeTree>>;

// Recursive definitions inline should be OK.
interface NodeTreeInline {
  child?: NodeTreeInline;
}

type NodeTreeAliasInline = {
  child?: NodeTreeAliasInline;
};

// This should translate normally and not trigger the {?} bailout.
type NodeTreeTree = Tree<Tree<number>>;

interface Pair<A, B> {
  a: A;
  b: B;
}

// Make sure that siblings can still be the same type and the second isn't
// erased.
type PairOfTrees = Pair<Tree<number>, Tree<number>>
