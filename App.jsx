import AuthProvider from "./context/AuthProvider";
import React from "react";
import Root from "./Root";

export default function App() {

    return (
        <AuthProvider>
            <Root/>
        </AuthProvider>
    );
}