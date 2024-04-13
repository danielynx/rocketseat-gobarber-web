import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import ForgotPassword from '../../pages/ForgotPassword';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

const mockedAddToast = jest.fn();

jest.mock('../../hooks/toast', () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast,
    }),
  };
});

jest.mock('react-router-dom', () => {
  return {
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    mockedAddToast.mockReset();
  });

  it('should be able to forgot password', async () => {
    apiMock.onPost('/passwords/forgot').reply(200, {});

    const { getByPlaceholderText, getByText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText('E-mail');
    const buttonElement = getByText('Confirm');

    fireEvent.change(emailField, {
      target: { value: 'johndoe@example.com' },
    });

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        }),
      );
    });
  });

  it('should not be able to forgot password without required data', async () => {
    const { getByText } = render(<ForgotPassword />);

    const buttonElement = getByText('Confirm');

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(getByText('E-mail required')).toBeTruthy();
      expect(mockedAddToast).not.toHaveBeenCalled();
    });
  });

  it('should not be able to forgot password with invalid data', async () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText('E-mail');
    const buttonElement = getByText('Confirm');

    fireEvent.change(emailField, { target: { value: 'invalid-email' } });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(getByText('Invalid e-mail')).toBeTruthy();
      expect(mockedAddToast).not.toHaveBeenCalled();
    });
  });

  it('should display an error if forgot password fails', async () => {
    apiMock.onPost('/passwords/forgot').reply(404);

    const { getByPlaceholderText, getByText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText('E-mail');
    const buttonElement = getByText('Confirm');

    fireEvent.change(emailField, { target: { value: 'johndoe@example.com' } });

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
        }),
      );
    });
  });
});
