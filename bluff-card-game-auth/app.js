import {
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
 } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

 import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
  
const auth = getAuth();
const email = document.getElementById("email");
const password = document.getElementById("password");
const signUpBtn  = document.getElementById("signup-btn");


const db = getFirestore();
const storage = getStorage();
let file = null;

const mainView = document.getElementById("main-view");

const emailVerificationView = document.getElementById("email-verification");
const resendEmailBtn = document.getElementById("resend-email-btn");

const logInForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");
const loginErrorMessage = document.getElementById("login-error-message");
const needAnAccountBtn = document.getElementById("need-an-account-btn");
const forgotPasswordBtn = document.getElementById("forgot-password-btn");
const loginWithGoogleBtn = document.getElementById("login-with-google-btn");

const imageFileInput = document.getElementById("image-file-input");
const name = document.getElementById("name");
const phone = document.getElementById("phone");
const UIErrorMessage = document.getElementById("error-message");
const signUpFormView = document.getElementById("signup-form");
const haveAnAccountBtn = document.getElementById("have-an-account-btn");

const userProfileView = document.getElementById("user-profile");
const UIuserEmail = document.getElementById("user-email");
const logOutBtn = document.getElementById("logout-btn");
const updateName = document.getElementById("update-name");
const updateEmail = document.getElementById("update-email");
const updatePhone = document.getElementById("update-phone");
const updateBtn = document.getElementById("update-btn");
const profilePictureImg = document.getElementById("profile-picture-img");
const updateImageFileInput = document.getElementById("update-image-file-input");

const resetPasswordForm = document.getElementById("reset-password-form");
const resetPasswordBtn = document.getElementById("reset-password-btn");
const resetPasswordEmail = document.getElementById("reset-password-email");
const resetPasswordMessage = document.getElementById("rp-message");

const resendButtonPressed = async () => {
  await sendEmailVerification(auth.currentUser);
};
resendEmailBtn.addEventListener("click", resendButtonPressed);


onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (!user.emailVerified) {
      emailVerificationView.style.display = "block";
      userProfileView.style.display = "none";
    } else {
      userProfileView.style.display = "block";
      UIuserEmail.innerHTML = user.email;
      emailVerificationView.style.display = "none";
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        updateName.value = docSnap.data().name;
        updatePhone.value = docSnap.data().phone;
        updateEmail.value = docSnap.data().email;
        console.log(docSnap.data());

        const fileRef = ref(
          storage,
          `user_images/${user.uid}/${user.uid}-profile-picture`
        );

        const url = await getDownloadURL(fileRef);
        console.log(url);
        profilePictureImg.src = url;
      } catch (error) {
        console.log(error.code);
      }
    }
    logInForm.style.display = "none";
    signUpFormView.style.display = "none";
  } else {
    logInForm.style.display = "block";
    userProfileView.style.display = "none";
  }
  mainView.classList.remove("loading");
});

const signUpButtonPressed = async (e) => {
  e.preventDefault();

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    await sendEmailVerification(userCredential.user);

    const docRef = doc(db, "users", userCredential.user.uid);

    await setDoc(docRef, {
      name: name.value,
      phone: phone.value,
      email: email.value,
    });

    const storageRef = ref(
      storage,
      `user_images/${userCredential.user.uid}/${userCredential.user.uid}-profile-picture`
    );
    await uploadBytes(storageRef, file);

    console.log(userCredential);
  } catch (error) {
    console.log(error.code);
    UIErrorMessage.innerHTML = formatErrorMessage(error.code, "signup");
    UIErrorMessage.classList.add("visible");
  }
};

const loginButtonPressed = async (e) => {
  e.preventDefault();

  try {
    await signInWithEmailAndPassword(
      auth,
      loginEmail.value,
      loginPassword.value
    );
  } catch (error) {
    console.log(error.code);
    console.log(formatErrorMessage(error.code, "login"));
    loginErrorMessage.innerHTML = formatErrorMessage(error.code, "login");
    loginErrorMessage.classList.add("visible");
  }
};

const logOutButtonPressed = async () => {
  try {
    await signOut(auth);
    email.value = "";
    password.value = "";
  } catch (error) {
    console.log(error);
  }
};



const needAnAccountButtonPressed = () => {
  logInForm.style.display = "none";
  signUpFormView.style.display = "block";
};

const haveAnAccountButtonPressed = () => {
  logInForm.style.display = "block";
  signUpFormView.style.display = "none";
};

const forgotPasswordButtonPressed = () => {
  resetPasswordForm.style.display = "block";
  logInForm.style.display = "none";
};

const resetPasswordButtonPressed = async (e) => {
  e.preventDefault();
  console.log(resetPasswordEmail.value);

  try {
    await sendPasswordResetEmail(auth, resetPasswordEmail.value);
    resetPasswordMessage.innerHTML = `We've sent a link to reset your password to ${resetPasswordEmail.value}.`;
    resetPasswordMessage.classList.add("success");
  } catch (error) {
    console.log(error.code);
    resetPasswordMessage.innerHTML = "Please provide a valid registered email";
    resetPasswordMessage.classList.add("error");
  }
  resetPasswordMessage.classList.remove("hidden");
};

const loginWithGoogleButtonPressed = async (e) => {
  e.preventDefault();
  const googleProvider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.log(error.code);
  }
};

const loginWithFacebookButtonPressed = async (e) => {
  e.preventDefault();
  const facebookProvider = new FacebookAuthProvider();
  try {
    const userCredential = await signInWithPopup(auth, facebookProvider);
    await sendEmailVerification(userCredential.user);
  } catch (error) {
    console.log(error.code);
  }
};

const updateUserProfileButtonPressed = async (e) => {
  e.preventDefault();

  try {
    const docRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(docRef, {
      name: updateName.value,
      phone: updatePhone.value,
      email: updateEmail.value,
    });

    const storageRef = ref(
      storage,
      `user_images/${auth.currentUser.uid}/${auth.currentUser.uid}-profile-picture`
    );
    await uploadBytes(storageRef, file);
    
  } catch (error) {
    console.log(error.code);
  }
};

const imageFileChosen = (e) => {
  file = e.target.files[0];
  console.log(file);
};

const updatedImageFileChosen = (e) => {
  console.log(e.target.files[0]);
  file = e.target.files[0];
  var reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = (e) => {
    console.log(e.target.result);
    profilePictureImg.src = e.target.result;
  };
};


imageFileInput.addEventListener("change", imageFileChosen);
signUpBtn.addEventListener("click", signUpButtonPressed);
haveAnAccountBtn.addEventListener("click", haveAnAccountButtonPressed);

logOutBtn.addEventListener("click", logOutButtonPressed);
updateBtn.addEventListener("click", updateUserProfileButtonPressed);
updateImageFileInput.addEventListener("change", updatedImageFileChosen);

loginBtn.addEventListener("click", loginButtonPressed);
needAnAccountBtn.addEventListener("click", needAnAccountButtonPressed);
forgotPasswordBtn.addEventListener("click", forgotPasswordButtonPressed);
resetPasswordBtn.addEventListener("click", resetPasswordButtonPressed);
loginWithGoogleBtn.addEventListener("click", loginWithGoogleButtonPressed);
loginWithFacebookBtn.addEventListener("click", loginWithFacebookButtonPressed);


const formatErrorMessage = (errorCode, action) => {
  let message = "";
  if (action === "signup") {
    if (
      errorCode === "auth/invalid-email" ||
      errorCode === "auth/missing-email"
    ) {
      message = "Please enter a valid email";
    } else if (
      errorCode === "auth/missing-password" ||
      errorCode === "auth/weak-password"
    ) {
      message = "Password must be at least 6 characters long";
    } else if (errorCode === "auth/email-already-in-use") {
      message = "Email is already taken";
    }
  } else if (action === "login") {
    if (
      errorCode === "auth/invalid-email" ||
      errorCode === "auth/missing-password" ||
      errorCode === "auth/wrong-password"
    ) {
      message = "Email or Password is incorrect";
    } else if (errorCode === "auth/user-not-found") {
      message = "Our system was unable to verify your email or password";
    }
  }

  return message;
};
