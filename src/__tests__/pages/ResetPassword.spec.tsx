import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import ResetPassword from '../../pages/ResetPassword';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

const mockedHistoryPush = jest.fn();
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
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    useLocation: () => ({
      search: '?token=token-123',
    }),
  };
});

describe('ResetPassword Page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockReset();
    mockedAddToast.mockReset();
  });

  it('should be able to reset password', async () => {
    apiMock.onPost('/passwords/reset').reply(200, {});

    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('New password');
    const passwordConfirmationField = getByPlaceholderText(
      'Password confirmation',
    );
    const buttonElement = getByText('Change password');

    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(passwordConfirmationField, {
      target: { value: '123456' },
    });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        }),
      );
      expect(mockedHistoryPush).toHaveBeenCalledWith('/');
    });
  });

  it('should not be able to reset password without required data', async () => {
    const { getByText } = render(<ResetPassword />);

    const buttonElement = getByText('Change password');

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(getByText('Password required')).toBeTruthy();
      expect(mockedAddToast).not.toHaveBeenCalled();
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should not be able to reset password with invalid data', async () => {
    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('New password');
    const passwordConfirmationField = getByPlaceholderText(
      'Password confirmation',
    );
    const buttonElement = getByText('Change password');

    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(passwordConfirmationField, {
      target: { value: 'not-password' },
    });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(getByText('Passwords must match')).toBeTruthy();
      expect(mockedAddToast).not.toHaveBeenCalled();
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should display an error if reset password fails', async () => {
    apiMock.onPost('/passwords/reset').reply(404);

    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('New password');
    const passwordConfirmationField = getByPlaceholderText(
      'Password confirmation',
    );
    const buttonElement = getByText('Change password');

    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(passwordConfirmationField, {
      target: { value: '123456' },
    });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
        }),
      );
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });
});
