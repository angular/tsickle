// This test verifies that initial comments don't confuse offsets.

/**
 * @return { string}
 */
function foo(): string {
  return 'foo';
}
// More text here to exhibit the problem.
