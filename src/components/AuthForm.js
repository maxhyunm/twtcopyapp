import React, { useState } from 'react';
import { authService } from "fBase";

const inputStyles = {};

const AuthForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newAccount, setNewAccount] = useState(true);
    const [error, setError] = useState("");

    const onChange = (event) => {
        const {target : {name, value}} = event;
        if(name === "email"){
            setEmail(value);
        } else if (name === "password"){
            setPassword(value);
        };
    };
    const onSubmit = async(event) => {
        event.preventDefault();
        try {
            if(newAccount) {
                const data =  await authService.createUserWithEmailAndPassword(
                    email, password
                )
            } else {
                const data =  await authService.signInWithEmailAndPassword(
                    email, password
                ) 
            }
        } catch(error){
            setError(error.message);
        }
    };
    const toggleAccount = () => setNewAccount((prev) => !prev);

    return (
        <>
            <form onSubmit={onSubmit} className="container">
                    <input 
                        name="email" 
                        type="email" 
                        placeholder="Email" 
                        required
                        value={email}
                        onChange={onChange}
                        className="authInput" />
                    <input 
                        name="password" 
                        type="password" 
                        placeholder="Password" 
                        required
                        value={password}
                        onChange={onChange}
                        className="authInput" />
                    <input 
                        type="submit" 
                        value={newAccount ? "Sign up" : "Sign in"}
                        className="authInput authSubmit" />
                    {error && <span className="authError">{error}</span>}
                </form>
                <span onClick={toggleAccount} className="authSwitch">
                    {newAccount ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}</span>
            </>
    )
}

export default AuthForm;