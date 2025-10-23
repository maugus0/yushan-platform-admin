describe('App CSS', () => {
  test('CSS file can be imported', () => {
    require('./App.css');
    expect(true).toBe(true);
  });
});
