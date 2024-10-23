import React from 'react'
import { useState, useEffect } from 'react'
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import "./SignUp.css"

function SignUp({ changeScene }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signUpButtonPressed = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log(userCredential);
      alert("User Creation Successful");
      changeScene("mainmenu");
    } catch (error) {
      console.log('Error logging in:', error.code);
    }
  };

  const handleChangeToLogin = () => {
    changeScene("login");
  }

  useEffect(() => {
    // Add CSS CDN for Semantic UI (as an example)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/semantic-ui@2.5.0/dist/semantic.min.css';
    document.head.appendChild(link);

    // Clean up after component unmounts
    return () => {
        document.head.removeChild(link);
      };
  }, []);


  return (
    <div className='signup'>
        <div className="ui segment grey signup-form">
            <form className="ui form" onSubmit={signUpButtonPressed}>
            <div className="ui stacked segment">
                <div className="field">
                <div className="ui left icon input">
                    <i className="mail icon"></i>
                    <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="email"
                    />
                </div>
                </div>
                <div className="field">
                <div className="ui left icon input">
                    <i className="lock icon"></i>
                    <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                    />
                </div>
                </div>
                <button className="ui button green fluid" type="submit" id="signup-btn">CREATE ACCOUNT</button>
            </div>
            </form>
            <div className="ui message small">
            Already have an account? <button onClick={handleChangeToLogin}>Log In</button>
            </div>
      </div>
    </div>
  )
}

export default SignUp