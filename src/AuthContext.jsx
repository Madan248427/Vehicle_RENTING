import React, { createContext, useContext } from "react";
import { useUser } from "@clerk/clerk-react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isSignedIn, user, isLoaded } = useUser();

  // Provide the user object only when loaded and signed in, else null
  const authUser = isLoaded && isSignedIn ? user : null;

  return <AuthContext.Provider value={authUser}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
