import { useContext } from 'react';
import type { ReactElement } from 'react';
import { AuthContext } from '../contex';

export const PrivateRoute = ({ children }: { children: ReactElement }): ReactElement | null => {
  const { authTokens } = useContext(AuthContext);

  if (!authTokens) {
    window.location.replace('/turnos/login'); // ← ruta absoluta, siempre igual
    return null;
  }

  return children;
};

