import React, { useState } from "react";
import { authService, storageService } from "fBase";
import { useHistory } from 'react-router-dom';
import {v4 as uuidv4} from "uuid";
// import Nweet from 'components/Nweet';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";


export default ({userObj, refreshUser}) => {
    const history = useHistory();
    const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
    const [newPhoto, setNewPhoto] = useState(null);
    const [editingName, setEditingName] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState(false);
    // const [nweets, setNweets] = useState([]);
    const toggleEditingName = () => setEditingName((prev) => !prev);
    const toggleEditingPhoto = () => setEditingPhoto((prev) => !prev);
    const onLogOutClick = () => {
        authService.signOut()
        // window.location.replace("/");
        history.push("/");
    };


    // useEffect(()=>{
    //     dbService.collection("nweets").where('creatorId', '==', userObj.uid).orderBy("createdAt", "desc").onSnapshot((snapshot)=>{
    //         const nweetArray = snapshot.docs.map(doc=>({id:doc.id, ...doc.data()}));
    //         setNweets(nweetArray);
    //     })
    // }, []);

    const onChange = (event) => {
        const {
            target : {value},
        } = event;
        setNewDisplayName(value);
    }

    const onSubmitName = async (event) => {
        event.preventDefault();
        if(userObj.displayName !== newDisplayName) {
            await userObj.updateProfile({ displayName:newDisplayName });
            refreshUser();
        };
        setEditingName(false);
    }

    const onSubmitPhoto = async (event) => {
        event.preventDefault();
        if(newPhoto) {
            await storageService.refFromURL(userObj.photoURL).delete()
            const photoRef = storageService.ref().child(`${userObj.uid}/profile/${uuidv4()}`);
            const response = await photoRef.putString(newPhoto, "data_url");
            const attachURL = await response.ref.getDownloadURL();
            await userObj.updateProfile({photoURL:attachURL});
            
            refreshUser();
        };
        setNewPhoto(null);
        setEditingPhoto(false);
    }

    const onChangePhotoClick = (event) => {
        const {
            target:{files},
        } = event;
        const theFile = files[0];
        const reader = new FileReader();
        reader.onloadend = (finishedEvent) => {
            const {
                currentTarget: {result},
            } = finishedEvent;
            setNewPhoto(result);
        };
        reader.readAsDataURL(theFile);
    }

    return (
        <div className="container">

        { editingName ? (
            <form onSubmit={onSubmitName} className="profileForm">
                <input 
                    onChange={onChange}
                    type="text"
                    autoFocus
                    placeholder="Display name"
                    value={newDisplayName}
                    className="formInput" 
                />
                <input 
                    type="submit"
                    value="Confirm"
                    className="formBtn"
                    style={{
                    marginTop: 10,
                    }}
                />
                
                <span className="formBtn cancelEditBtn" onClick={toggleEditingName}>Cancel Editing</span>
            </form>
        
         ) : (
            <div className="profileForm">
                <span className="formBtn editProfileBtn" onClick={toggleEditingName}>Change Name</span>
            </div>  
         )}

    { editingPhoto ? (
            <form onSubmit={onSubmitPhoto} className="profileForm  modify__propic">
                <label htmlFor="change-pic" className="propic__label">
                    <span style={{marginRight:10}}>Add Photo</span>
                    <FontAwesomeIcon icon={faPlus} />
                </label>
                <input 
                    className="formBtn editProfileBtn" 
                    type="file" 
                    id="change-pic"
                    accept="image/*"
                    onChange={onChangePhotoClick}
                    style={{
                        opacity: 0,
                      }}
                />
                {newPhoto && (
                    <div className="propic__img">
                        <img
                        src={newPhoto}
                        style={{
                            backgroundImage: newPhoto,
                        }}
                        width="80px" height="80px" style={{borderRadius:50}}
                        />
                    </div>
                )}
                <input 
                    type="submit"
                    value="Confirm"
                    className="formBtn"
                    style={{
                    marginTop: 10,
                    }}
                />
                
                <span className="formBtn cancelEditBtn" onClick={toggleEditingPhoto}>Cancel Editing</span>
            </form>
        
         ) : (
            <div className="profileForm">
                <span className="formBtn editProfileBtn" onClick={toggleEditingPhoto}>Change Photo</span>
            </div>  
         )}




            <div className="profileForm">
                <span className="formBtn cancelBtn logOut" onClick={onLogOutClick}>Log Out</span>
            </div>
            {/* <div>
                {nweets.map(nweet =>
                        <Nweet 
                            key={nweet.id} 
                            nweetObj={nweet} 
                            isOwner={nweet.creatorId===userObj.uid}
                        />
                    )}
            </div> */}
        </div>
    );
};
