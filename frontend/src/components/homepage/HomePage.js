import "./HomePage.css";
import { Link } from "react-router-dom";
import logo from "../img/logo3.png";
import Rules from "../rules/Rules";


const HomePage = () => {
  return (
    <div className="page-wrapper">
      <section class="block block--dark">
        <div class="block__header container">
          <header>
            <h1 class="font-only-heading block__heading">
            Step Into the World of
            </h1>
            <img src={logo} class="logo" alt=""></img>
            <p class="hero__tagline">
            It’s Not What You Have, It’s What They Think You Have!
            </p>
            <div>
              <button
                className="btn btn-light hero-learn-btn-1"
                data-bs-toggle="modal"
                data-bs-target="#rulesModal"
              >
                Rules
              </button>
              <Link to="/scene">
                <button class="btn btn-success hero-learn-btn-2">
                  Play Now
                </button>
              </Link>
            </div>
          </header>
        </div>
      </section>
      <Rules />
      <small className="footer">&copy;2024 Developed by <a className="link-light link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover" href='https://www.linkedin.com/in/muhammad-qassim/'>Muhammad Qassim</a> & <a className="link-light link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover" href='http://apeffer.dev'>Alex Peffer</a></small>
    </div>
  );
};

export default HomePage;
