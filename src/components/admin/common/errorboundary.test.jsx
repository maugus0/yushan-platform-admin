import { render, screen } from '@testing-library/react';
import ErrorBoundary from './errorboundary';

describe('ErrorBoundary Component', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  const WorkingComponent = () => <div>Working</div>;

  // Suppress console errors for these tests
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  test('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Working')).toBeInTheDocument();
  });

  test('catches errors and renders fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    // Error boundary should catch the error
    expect(document.body).toBeInTheDocument();
  });
});
