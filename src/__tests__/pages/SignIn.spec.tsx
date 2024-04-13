import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

import SignIn from '../../pages/SignIn';

const mockedHistoryPush = jest.fn();
const mockedSignIn = jest.fn();
const mockedAddToast = jest.fn();

jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('../../hooks/auth', () => {
  return {
    useAuth: () => ({
      signIn: mockedSignIn,
    }),
  };
});

jest.mock('../../hooks/toast', () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast,
    }),
  };
});

describe('SignIn Page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockReset();
    mockedAddToast.mockReset();
  });

  it('should be able to sign in', async () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);

    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Password');
    const buttonElement = getByText('Sign In');

    fireEvent.change(emailField, { target: { value: 'johndoe@example.com' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedAddToast).not.toHaveBeenCalled();
      expect(mockedHistoryPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should not be able to sign in without credentials', async () => {
    const { getByText } = render(<SignIn />);

    const buttonElement = getByText('Sign In');

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(getByText('E-mail required')).toBeTruthy();
      expect(getByText('Password required')).toBeTruthy();
      expect(mockedAddToast).not.toHaveBeenCalled();
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should not be able to sign in with invalid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);

    const emailField = getByPlaceholderText('E-mail');
    const buttonElement = getByText('Sign In');

    fireEvent.change(emailField, { target: { value: 'invalid-email' } });

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(getByText('Invalid e-mail')).toBeTruthy();
      expect(mockedAddToast).not.toHaveBeenCalled();
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should display an error if sign in fails', async () => {
    mockedSignIn.mockImplementation(() => {
      throw new Error();
    });

    const { getByPlaceholderText, getByText } = render(<SignIn />);

    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Password');
    const buttonElement = getByText('Sign In');

    fireEvent.change(emailField, { target: { value: 'johndoe@example.com' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });

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
