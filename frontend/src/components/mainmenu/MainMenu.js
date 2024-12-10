import React, { useState } from "react";
import { startGame } from "../../api/apiService";
import { useNavigate } from "react-router-dom";
import { auth } from '../../firebase.js';
import { signOut } from '@firebase/auth';
import logo from "../img/logo3.png";

function MainMenu({changeScene, user}) {
    const [numPlayers, setNumPlayers] = useState(2);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleStartGame = async () => {

      //debugging
      console.log("Start button clicked!");

      try {
          const data = await startGame(numPlayers);

          //debugging
          console.log("Game State:", data); 

          navigate("/game-board", { state: { gameState: data } });
      } catch (error) {
          console.error("Error starting the game:", error);
      }
  }
    const handleLogout = async () => {
      try {
        await signOut(auth);
        alert(`${user.email} Signed Out Successfully`)
        changeScene('mainmenu');
      } catch (error) {
        console.error('Error signing out: ', error);
      }
    }

  const handleChangeToSignUp = () => {
    changeScene('signup');
  }

  const handleChangeToLogin = () => {
    changeScene('login');
  }
  
  const toggleModal = () => setShowModal(!showModal);

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{height: "90vh"}}>
        <img src={logo} class="logo" alt=""></img>
        <div className="d-flex gap-3">

        {user ? (
            <div>
                <p class="hero__tagline" style={{marginTop: "-3rem" , fontSize: "1.75rem"}}>
        Welcome, {user.email}!
            </p>
                <button className="btn btn-success hero-learn-btn-2" style={{ marginRight: '5px'}} onClick={toggleModal}>Play</button>
                <button className="btn btn-light hero-learn-btn-1" onClick={handleLogout}>Log Out</button>
            </div>
        ) : (
            <div>
                <p class="hero__tagline" style={{marginTop: "-3rem" , fontSize: "1.75rem"}}>
                Deceive. Strategize. Conquer!
            </p>
            <button className="btn btn-outline-light hero-learn-btn-1" onClick={handleChangeToSignUp}>Sign Up</button>
            <button className="btn btn-success hero-learn-btn-1" onClick={handleChangeToLogin}>Log In</button>
          </div>
        )}

        </div>

        {showModal && (
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header ">
                            <h5 className="modal-title ">Start a New Game</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={toggleModal}
                            ></button>
                        </div>
                        <div className="modal-body text-center p-5">
                            <p>Select Number Of Player</p>
                            <div className="d-flex justify-content-center gap-2">
                                {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                                    <button
                                        key={num}
                                        className={`btn btn-sm ${
                                            numPlayers === num ? "btn-success" : "btn-outline-dark"
                                        }`}
                                        onClick={() => setNumPlayers(num)}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={toggleModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={handleStartGame}
                            >
                                Start Game
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
);
}

export default MainMenu;