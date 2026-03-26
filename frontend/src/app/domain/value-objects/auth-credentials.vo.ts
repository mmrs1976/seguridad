export interface AuthCredentials {
  readonly email: string;
  readonly password: string;
}

export interface RegisterCredentials {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export function createAuthCredentials(email: string, password: string): AuthCredentials {
  if (!email || !password) {
    throw new Error('Email y contraseña son requeridos');
  }
  return { email: email.trim().toLowerCase(), password };
}

export function createRegisterCredentials(
  name: string,
  email: string,
  password: string
): RegisterCredentials {
  if (!name || !email || !password) {
    throw new Error('Nombre, email y contraseña son requeridos');
  }
  return { name: name.trim(), email: email.trim().toLowerCase(), password };
}
