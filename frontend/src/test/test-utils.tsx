import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import Providers from '@/components/providers';

// Custom render that includes all global providers
const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: Providers, ...options });

// Re-export everything from RTL
export * from '@testing-library/react';
export { customRender as render };
