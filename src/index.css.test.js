describe('Index CSS', () => {
  test('CSS file can be imported', () => {
    require('./index.css');
    expect(true).toBe(true);
  });
});
