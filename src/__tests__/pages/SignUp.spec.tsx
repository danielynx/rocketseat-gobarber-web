import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import SignUp from '../../pages/SignUp';
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
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe('SignUp Page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockReset();
    mockedAddToast.mockReset();
  });

  it('should be able to sign up', async () => {
    apiMock.onPost('users').reply(200, {});

    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const nameField = getByPlaceholderText('Name');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Password');
    const buttonElement = getByText('Create');

    fireEvent.change(nameField, { target: { value: 'John Doe' } });
    fireEvent.change(emailField, { target: { value: 'johndoe@example.com' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });

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

  it('should not be able to sign up without required data', async () => {
    const { getByText } = render(<SignUp />);

    const buttonElement = getByText('Create');

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(getByText('Name required')).toBeTruthy();
      expect(getByText('E-mail required')).toBeTruthy();
      expect(getByText('At least 6 character are required')).toBeTruthy();
      expect(mockedAddToast).not.toHaveBeenCalled();
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should not be able to sign up with invalid data', async () => {
    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Password');
    const buttonElement = getByText('Create');

    fireEvent.change(emailField, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordField, { target: { value: '123' } });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(getByText('Invalid e-mail')).toBeTruthy();
      expect(getByText('At least 6 character are required')).toBeTruthy();
      expect(mockedAddToast).not.toHaveBeenCalled();
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should display an error if sign up fails', async () => {
    apiMock.onPost('users').reply(404);

    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const nameField = getByPlaceholderText('Name');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Password');
    const buttonElement = getByText('Create');

    fireEvent.change(nameField, { target: { value: 'John Doe' } });
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
