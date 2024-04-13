import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import Profile from '../../pages/Profile';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

const user = {
  id: 'id',
  name: 'John Doe',
  email: 'johndoe@example.com',
  avatar_url: 'image.jpg',
};

const mockedUpdateUser = jest.fn();
const mockedUser = jest.fn().mockResolvedValue(user);
const mockedHistoryPush = jest.fn();
const mockedAddToast = jest.fn();

jest.mock('../../hooks/auth', () => {
  return {
    useAuth: () => ({
      updateUser: mockedUpdateUser,
      user: mockedUser,
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

jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe('Profile Page', () => {
  beforeEach(() => {
    mockedUpdateUser.mockReset();
    mockedHistoryPush.mockReset();
    mockedAddToast.mockReset();
  });

  it('should be able to update profile', async () => {
    apiMock.onPut('profile').reply(200, user);

    const { getByPlaceholderText, getByText } = render(<Profile />);

    const nameField = getByPlaceholderText('Name');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('New password');
    const passwordConfirmationField = getByPlaceholderText(
      'Confirmation password',
    );
    const oldPasswordField = getByPlaceholderText('Current password');
    const buttonElement = getByText('Confirm');

    fireEvent.change(nameField, { target: { value: user.name } });
    fireEvent.change(emailField, { target: { value: user.email } });
    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(passwordConfirmationField, {
      target: { value: '123456' },
    });
    fireEvent.change(oldPasswordField, { target: { value: '123456' } });

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedUpdateUser).toHaveBeenCalledWith(user);
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        }),
      );
      expect(mockedHistoryPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should not be able to update profile without required data', async () => {
    const { getByText, getByPlaceholderText } = render(<Profile />);

    const nameField = getByPlaceholderText('Name');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('New password');
    const oldPasswordField = getByPlaceholderText('Current password');
    const buttonElement = getByText('Confirm');

    fireEvent.change(nameField, { target: { value: '' } });
    fireEvent.change(emailField, { target: { value: '' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(oldPasswordField, { target: { value: '' } });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(getByText('Name required')).toBeTruthy();
      expect(getByText('E-mail required')).toBeTruthy();
      expect(getByText('Current password required')).toBeTruthy();
      expect(mockedUpdateUser).not.toHaveBeenCalled();
      expect(mockedAddToast).not.toHaveBeenCalled();
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should not be able to update profile with invalid data', async () => {
    const { getByPlaceholderText, getByText } = render(<Profile />);

    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('New password');
    const passwordConfirmationField = getByPlaceholderText(
      'Confirmation password',
    );
    const buttonElement = getByText('Confirm');

    fireEvent.change(emailField, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(passwordConfirmationField, {
      target: { value: 'no-match-password' },
    });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(getByText('Invalid e-mail')).toBeTruthy();
      expect(getByText('Passwords must match')).toBeTruthy();
      expect(mockedUpdateUser).not.toHaveBeenCalled();
      expect(mockedAddToast).not.toHaveBeenCalled();
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should display an error if update profile fails', async () => {
    apiMock.onPut('profile').reply(404);

    const { getByPlaceholderText, getByText } = render(<Profile />);

    const nameField = getByPlaceholderText('Name');
    const emailField = getByPlaceholderText('E-mail');
    const buttonElement = getByText('Confirm');

    fireEvent.change(nameField, { target: { value: 'John Doe' } });
    fireEvent.change(emailField, { target: { value: 'johndoe@example.com' } });

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedUpdateUser).not.toHaveBeenCalled();
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
        }),
      );
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should be able to update the avatar', async () => {
    apiMock.onPatch('users/avatar').reply(200, user);

    const { getByTestId } = render(<Profile />);

    const avatarField = getByTestId('input-avatar');

    fireEvent.change(avatarField, {
      target: { files: { item: () => 'avatar.png' } },
    });

    await waitFor(() => {
      expect(mockedUpdateUser).toHaveBeenCalledWith(user);
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        }),
      );
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });
});
