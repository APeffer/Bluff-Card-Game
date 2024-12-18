import React, { useEffect, useState } from "react";
import "./NavBar.css";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase.js";
import { signOut } from '@firebase/auth';


const NavBar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert(`${user.email} Signed Out Successfully`)
      window.location.href = "/";
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  }
  return (
    <nav className="navbar bg-blur">
      <div className="container-fluid d-flex justify-content-between m-0 w-100">
        {user? (
          <Link className="navbar-brand m-0" to="/scene">
            <h1 className="secondary-heading">
              <strong className="bluff secondary-heading">Bluff</strong>
            </h1>
          </Link>
        ) : (
        <Link className="navbar-brand m-0" to="/">
          <h1 className="m-0">
            <strong className="bluff secondary-heading">Bluff</strong>
          </h1>
        </Link>
        )}    
        {user ? (
          <div className="dropdown">
            <button
              className="btn btn-success dropdown-toggle"
              type="button"
              id="userMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {user.email}
            </button>
            <ul className="dropdown-menu" aria-labelledby="userMenuButton">
              <li>
                <Link className="dropdown-item" to="/profile">
                  Profile
                </Link>
              </li>
              <div className="dropdown-divider"></div>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="logins">
            <Link to="/signup">
              <button className="btn btn-outline-light me-2 px-3">Register</button>
            </Link>
            <Link to="/login">
              <button className="btn btn-success px-5">Login</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
