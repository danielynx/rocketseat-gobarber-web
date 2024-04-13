import { renderHook, act } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';

import { AuthProvider, useAuth } from '../../hooks/auth';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

const storageTokenKey = '@GoBarber:token';
const storageUserKey = '@GoBarber:user';
const user = {
  id: 'user-123',
  name: 'John Doe',
  email: 'johndoe@example.com',
  avatar_url: 'image-test.jpg',
};
const token = 'token-123';

const recoveryInitialStorage = () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(key => {
    switch (key) {
      case storageTokenKey:
        return token;
      case storageUserKey:
        return JSON.stringify(user);
      default:
        return null;
    }
  });
};

describe('Auth hook', () => {
  it('should be able to sign in', async () => {
    apiMock.onPost('sessions').reply(200, { user, token });

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({
      email: user.email,
      password: '123456',
    });

    await waitForNextUpdate();

    expect(setItemSpy).toHaveBeenCalledWith(storageTokenKey, token);

    expect(setItemSpy).toHaveBeenCalledWith(
      storageUserKey,
      JSON.stringify(user),
    );

    expect(result.current.user.email).toEqual(user.email);

    expect(api.defaults.headers.authorization).toEqual(`Bearer ${token}`);
  });

  it('should restore saved data from storage when auth inits', async () => {
    recoveryInitialStorage();

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user.email).toEqual(user.email);

    expect(api.defaults.headers.authorization).toEqual(`Bearer ${token}`);
  });

  it('should be able to sign out', async () => {
    recoveryInitialStorage();

    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.signOut();
    });

    expect(removeItemSpy).toHaveBeenCalledWith(storageTokenKey);

    expect(removeItemSpy).toHaveBeenCalledWith(storageUserKey);

    expect(result.current.user).toBeUndefined();

    expect(api.defaults.headers.authorization).toBeUndefined();
  });

  it('should be able to update user data', async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.updateUser(user);
    });

    expect(setItemSpy).toHaveBeenCalledWith(storageTokenKey, token);

    expect(setItemSpy).toHaveBeenCalledWith(
      storageUserKey,
      JSON.stringify(user),
    );
  });
});
