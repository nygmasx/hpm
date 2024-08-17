import React, {createContext, useState} from "react";

export const AuthContext = createContext();
const AuthProvider = ({children}) => {

    const [user, setUser] = useState(false)

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login: (email, password) => {
                    setUser("Andre")
                },
                logout: () => {
                    setUser(null)
                }
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;