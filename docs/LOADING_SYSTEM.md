# App-Wide Loading System

This document explains how to use the modern, app-wide loading system that handles multiple concurrent API calls with a beautiful spinner interface.

## Features

- 🌟 **Modern Design**: Beautiful ripple spinner with gradient colors
- 🔄 **Concurrent Support**: Handles multiple API calls simultaneously
- 📊 **Request Counter**: Shows number of active requests
- 🎨 **Multiple Variants**: Different spinner styles available
- 🎯 **Automatic Management**: No manual loading state management needed
- 📱 **Responsive**: Works on all screen sizes

## Components

### 1. LoadingContext (`contexts/loadingContext.tsx`)

Manages the global loading state and provides utilities for API calls.

### 2. GlobalSpinner (`components/ui/globalSpinner.tsx`)

The main spinner component that appears when any API call is in progress.

### 3. Spinner (`components/ui/spinner.tsx`)

Reusable spinner component with multiple variants.

### 4. API Utilities (`lib/apiWithLoading.ts`)

Utilities to wrap API calls with automatic loading state management.

## Usage

### Basic Usage in Components

```tsx
import { useApiWithLoading } from "../../lib/apiWithLoading";

const MyComponent = () => {
  const { apiCall } = useApiWithLoading();

  const handleSubmit = async () => {
    try {
      // This will automatically show the global spinner
      const result = await apiCall(axiosInstance.post("/api/endpoint", data), {
        showLoading: true,
        loadingText: "Saving data...",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
};
```

### Manual Loading Control

```tsx
import { useLoading } from "../../contexts/loadingContext";

const MyComponent = () => {
  const { startLoading, stopLoading, withLoading } = useLoading();

  const handleManualLoading = async () => {
    // Manual control
    startLoading();
    try {
      await someAsyncOperation();
    } finally {
      stopLoading();
    }
  };

  const handleWithWrapper = async () => {
    // Using the wrapper
    await withLoading(someAsyncOperation());
  };

  return (
    <div>
      <button onClick={handleManualLoading}>Manual Loading</button>
      <button onClick={handleWithWrapper}>Wrapped Loading</button>
    </div>
  );
};
```

### Using Different Spinner Variants

```tsx
import Spinner from "../../components/ui/spinner";

const MyComponent = () => {
  return (
    <div>
      {/* Default spinner */}
      <Spinner />

      {/* Different variants */}
      <Spinner variant="pulse" size="lg" />
      <Spinner variant="dots" size="md" />
      <Spinner variant="bars" size="xl" />
      <Spinner variant="ripple" size="lg" />

      {/* With overlay */}
      <Spinner overlay text="Loading data..." />
    </div>
  );
};
```

### API Actions with Loading

```tsx
import { useApiWithLoading } from "../../lib/apiWithLoading";

export const useMyActions = () => {
  const { apiCall } = useApiWithLoading();

  const fetchData = async () => {
    return apiCall(axiosInstance.get("/api/data"), {
      showLoading: true,
      loadingText: "Loading data...",
    });
  };

  const saveData = async (data: any) => {
    return apiCall(axiosInstance.post("/api/data", data), {
      showLoading: true,
      loadingText: "Saving...",
    });
  };

  return { fetchData, saveData };
};
```

## Spinner Variants

### 1. Default

Classic spinning circle with gradient border.

### 2. Pulse

Pulsing circle with gradient background.

### 3. Dots

Three bouncing dots with staggered animation.

### 4. Bars

Four animated bars with wave effect.

### 5. Ripple

Concentric circles with ripple effect (used in GlobalSpinner).

## Sizes

- `sm`: 16px (w-4 h-4)
- `md`: 24px (w-6 h-6) - Default
- `lg`: 32px (w-8 h-8)
- `xl`: 48px (w-12 h-12)

## Global Spinner Features

- **Backdrop Blur**: Modern glassmorphism effect
- **Request Counter**: Shows number of active requests
- **Progress Bar**: Animated progress indicator
- **Responsive Design**: Works on all devices
- **High Z-Index**: Always appears on top

## Configuration

The loading system is automatically configured in the root layout:

```tsx
// app/layout.tsx
<AuthProvider>
  <LoadingProvider>
    {children}
    <GlobalSpinner />
  </LoadingProvider>
</AuthProvider>
```

## Best Practices

1. **Use `apiCall` wrapper**: Always wrap API calls with the `apiCall` function for automatic loading management.

2. **Provide loading text**: Give users context about what's happening.

3. **Handle errors**: Always wrap API calls in try-catch blocks.

4. **Avoid manual loading**: Use the automatic system instead of manual loading state management.

5. **Test concurrent calls**: The system handles multiple simultaneous API calls gracefully.

## Example Implementation

See `app/employees/actions/employeeActionsWithLoading.ts` for a complete example of how to implement the loading system with API actions.
