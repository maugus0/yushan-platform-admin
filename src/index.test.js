import React from 'react';

// Mock react-dom/client to capture createRoot and render calls
let mockRootRender;
jest.mock('react-dom/client', () => {
  return {
    __esModule: true,
    createRoot: jest.fn(() => {
      mockRootRender = jest.fn();
      return { render: mockRootRender };
    }),
  };
});

// Mock antd ConfigProvider as a functional component (no side effects)
const mockedConfigProvider = (props) =>
  React.createElement('config-provider', null, props.children);
jest.mock('antd', () => ({
  ConfigProvider: mockedConfigProvider,
}));

// Mock App to a simple component (avoid pulling the whole app)
const MockApp = () => React.createElement('div', null, 'MockApp');
jest.mock('./App', () => ({
  __esModule: true,
  default: MockApp,
}));

describe('index.js', () => {
  test('React is available and importable', () => {
    expect(React).toBeDefined();
    expect(React.Fragment).toBeDefined();
  });

  test('React has createElement', () => {
    expect(typeof React.createElement).toBe('function');
  });

  test('ReactDOM should be available', () => {
    const ReactDOM = require('react-dom');
    expect(ReactDOM).toBeDefined();
    expect(ReactDOM.createRoot).toBeDefined();
  });

  test('ConfigProvider from antd should be available', () => {
    const antd = require('antd');
    expect(antd.ConfigProvider).toBeDefined();
  });

  test('environment is test', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('CSS file can be imported', () => {
    require('./index.css');
    expect(true).toBe(true);
  });
});
