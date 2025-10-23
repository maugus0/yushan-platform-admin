import * as Charts from './index';

describe('Charts Index', () => {
  test('exports all chart components', () => {
    expect(Charts.StatCard).toBeDefined();
    expect(Charts.TrendIndicator).toBeDefined();
    expect(Charts.ChartWrapper).toBeDefined();
    expect(Charts.LineChart).toBeDefined();
    expect(Charts.AreaChart).toBeDefined();
    expect(Charts.BarChart).toBeDefined();
    expect(Charts.PieChart).toBeDefined();
  });

  test('exports are functions or classes', () => {
    // Verify that each export is a valid React component (function or class)
    expect(typeof Charts.StatCard).toBe('function');
    expect(typeof Charts.TrendIndicator).toBe('function');
    expect(typeof Charts.ChartWrapper).toBe('function');
    expect(typeof Charts.LineChart).toBe('function');
    expect(typeof Charts.AreaChart).toBe('function');
    expect(typeof Charts.BarChart).toBe('function');
    expect(typeof Charts.PieChart).toBe('function');
  });
});
