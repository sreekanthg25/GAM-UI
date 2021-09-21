const USER_KEY = 'user';
const AUTH_KEY = 'token';

export type UserArgs<T> = {
  auth_token: string;
  user: T;
};

export const getToken = (): string | null => {
  return localStorage.getItem(AUTH_KEY);
};

export const setUserData = <T>({ auth_token, user }: UserArgs<T>): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_KEY, auth_token);
};

export const getUser = <T>(): T => {
  return JSON.parse(localStorage.getItem(USER_KEY) || '{}');
};

export const clearUserData = (): void => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(AUTH_KEY);
};
