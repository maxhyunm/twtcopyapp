import React, { useState, useEffect } from "react";
import AppRouter from "components/Router";
import { authService, dbService } from 'fBase';

function App() {
  const [init, setInit] = useState(false);
  const [userObj, setUserObj] = useState(null);

  useEffect(()=>{
    authService.onAuthStateChanged((user) => {
      if(user){
        dbService.collection("users").doc(user.uid).get()
          .then(doc => {
            if (!doc.exists) {
              let newDisplayName = user.displayName
              let newPhotoURL = user.photoURL
              if(!user.displayName) {
                newDisplayName = user.email.split('@')[0]
              }
              if(!user.photoURL) {
                newPhotoURL = "https://firebasestorage.googleapis.com/v0/b/nwitter-c94a2.appspot.com/o/icon.png?alt=media&token=2838bc8e-050f-4d1f-82b3-114e4e5a1a7f";
              }
              
              dbService.collection("users").doc(user.uid).set({
                displayName : newDisplayName,
                uid : user.uid,
                photoURL : newPhotoURL,
                email : user.email
              });
              authService.currentUser.updateProfile({
                displayName : newDisplayName,
                photoURL : newPhotoURL
              });
            }
          })

        setUserObj({
          displayName : user.displayName,
          uid : user.uid,
          photoURL : user.photoURL,
          updateProfile : (args) => user.updateProfile(args)
        });
      } else {
        setUserObj(null);
      };
      setInit(true);
    });
  }, []);

  const refreshUser = async () => {
    const user = authService.currentUser;
    await dbService.collection("users").doc(user.uid).set({
      displayName : user.displayName,
      uid : user.uid,
      photoURL : user.photoURL,
      email : user.email
    })
    setUserObj({
      displayName : user.displayName,
      uid : user.uid,
      photoURL : user.photoURL,
      updateProfile : (args) => user.updateProfile(args)
    });
  };

  // return에서 제외한 푸터     <footer>&copy; Nwitter {new Date().getFullYear()}</footer>
  
  return (
  <>
    {init ? <AppRouter refreshUser={refreshUser} isLoggedIn={Boolean(userObj)} userObj={userObj} /> : "Initializing..."}

  </>
)}

export default App;