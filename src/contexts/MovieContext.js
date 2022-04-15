import { collection, onSnapshot } from "firebase/firestore";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useReducer,
} from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase-config";
import useLocalStorage from "../hooks/useLocalStorage";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { firebaseAuth } from "../firebase/firebase-config";

const movieContext = createContext();

const MovieProvider = ({ children }) => {
  const navigate = useNavigate();
  const handleNavigate = (path, movieID) => {
    navigate(`/${path}${movieID ? "/" + movieID : ""}`);
  };
  const handleNavigateTV = (path, movieID, Episode) => {
    navigate(`/${path}/${movieID}/${Episode}`);
  };
  const Frame_Movie_Path = "https://www.2embed.ru/embed/tmdb/movie?id=";
  const Frame_Tivi_Path = "https://www.2embed.ru/embed/tmdb/tv?id=";

  const [loading, setLoading] = useState(true);

  const handleSetTitle = (title = "") => {
    document.title = `Đang Xem: ${title}`;
  };

  // store firebase

  //get firestore
  const colRef = collection(db, "Notification");
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    onSnapshot(colRef, (snapshot) => {
      let Notifications = [];
      snapshot.docs.forEach((doc) => {
        Notifications.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setNotifications(Notifications);
    });
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cart
  const reducerCarts = (stateCarts, action) => {
    switch (action.type) {
      case "ADD": {
        const newStateCarts = [...stateCarts];
        const filterCarts = newStateCarts.some(
          (item) => item.id === action.payload.id
        );
        if (!filterCarts) newStateCarts.push(action.payload);
        setValue(newStateCarts);
        return newStateCarts;
      }
      case "DELETE": {
        const newStateCarts = [...stateCarts];
        newStateCarts.filter((item) => item.id !== action.payload.id);
        setValue(newStateCarts);
        return newStateCarts;
      }
      default:
        throw new Error("Invalid Actions");
    }
  };
  const [storedValue, setValue] = useLocalStorage("movielist", []);
  const [stateCarts, dispatchCarts] = useReducer(reducerCarts, storedValue);

  // Firebase Auth
  const [userInfo, setUserInfo] = useState("");
  const [errorRegister, setErrorRegister] = useState(false);
  const [errorLogin, setErrorLogin] = useState(false);
  // Register
  const handleRegister = async ({ email, password, name }) => {
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      updateProfile(firebaseAuth.currentUser, {
        displayName: name,
      });
      setErrorRegister(false);
    } catch (error) {
      console.log(error);
      setErrorRegister(true);
    }
  };
  // Login
  const handleLogin = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      setErrorLogin(false);
    } catch (error) {
      setErrorLogin(true);
    }
  };
  //Logout
  const handleSignOut = () => {
    signOut(firebaseAuth);
  };
  onAuthStateChanged(firebaseAuth, (currentUser) => {
    setUserInfo(currentUser);
  });
  const value = {
    handleNavigate,
    handleNavigateTV,
    useLocalStorage,
    Frame_Movie_Path,
    Frame_Tivi_Path,
    loading,
    setLoading,
    handleSetTitle,
    notifications,
    stateCarts,
    dispatchCarts,
    userInfo,
    handleRegister,
    handleLogin,
    handleSignOut,
    errorRegister,
    errorLogin,
  };
  return (
    <movieContext.Provider value={value}>{children}</movieContext.Provider>
  );
};

const useMovies = () => {
  const context = useContext(movieContext);
  if (typeof context === "undefined") {
    throw new Error("You count must be used within a Movies Provider");
  }
  return context;
};

export { useMovies, MovieProvider };
