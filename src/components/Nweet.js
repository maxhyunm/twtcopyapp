import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { dbService, storageService } from "fBase";
import {v4 as uuidv4} from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

const Nweet = ({ nweetObj, isOwner }) => {
    const [editing, setEditing] = useState(false);
    const [newNweet, setNewNweet] = useState(nweetObj.text);
    const [newAttachment, setNewAttachment] = useState("");
    const [userName, setUserName] = useState(null);
    const [userPhoto, setUserPhoto] = useState(null);
    const date = nweetObj.createdAtDate.split(' ');

    useEffect(()=>{
        dbService.collection("users").doc(nweetObj.creatorId).get()
        .then(doc => {
                setUserName(doc.data().displayName);
                setUserPhoto(doc.data().photoURL);
        });
    }, [])

        
    const onDeleteClick = async () => {
        const ok = window.confirm("Are you sure you want to delete?");
        if (ok) {
            await dbService.doc(`nweets/${nweetObj.id}`).delete();
            await storageService.refFromURL(nweetObj.attachmentURL).delete();
        }
    }

    const toggleEditing = () => setEditing((prev) => !prev);

    const onSubmit = async (event) => {
        event.preventDefault();
        let newAttachmentURL = nweetObj.attachmentURL;
        if(newAttachment !== "") {
            const attachmentRef = storageService.ref().child(`${nweetObj.creatorId}/${uuidv4()}`);
            const response = await attachmentRef.putString(newAttachment, "data_url");
            newAttachmentURL = await response.ref.getDownloadURL();
        }
        await dbService.doc(`nweets/${nweetObj.id}`).update({
            text:newNweet,
            attachmentURL : newAttachmentURL
        });
        setEditing(false);
    }


    const onChange = (event) => {
        const {
            target:{value},
        } = event;
        setNewNweet(value);
    }

    const onDeletePhotoClick = async () => {
        const ok = window.confirm("Are you sure you want to delete?");
        if (ok) {
            await storageService.refFromURL(nweetObj.attachmentURL).delete();
            await dbService.doc(`nweets/${nweetObj.id}`).update({
                attachmentURL:""
            });
        }
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
            setNewAttachment(result);
        };
        reader.readAsDataURL(theFile);
    }

    const onClearAttachment = () => {
        setNewAttachment("");
    }
    
    return (
        <div>
            
            <img className="nweetProfilePic" src={userPhoto} />
            <div className="nweet">

            
            {editing ? (
                    <>
                        <form onSubmit={onSubmit} className="container nweetEdit">
                            <input 
                                onChange={onChange} 
                                type="text" 
                                placeholder="Edit it" 
                                value={newNweet} 
                                required
                                autoFocus
                                className="formInput" />
                            {nweetObj.attachmentURL ? (
                                <>
                                    <img src={nweetObj.attachmentURL} width="50px" height="50px" />
                                    <span className="formBtn cancelEditBtn" onClick={onDeletePhotoClick}>Delete Photo</span>
                                </>
                            ) : (
                                <div className="modify_attcs">
                                    <label htmlFor="modf" className="modify__label">
                                        <span style={{marginRight:10}}>Add photos</span>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </label>
                                    <input 
                                        id="modf"
                                        type="file"
                                        accept="image/*"
                                        onChange={onChangePhotoClick}
                                        style={{
                                        opacity: 0,
                                        }}
                                    />
                                    {newAttachment && (
                                        <div className="modify__attachment">
                                            <img
                                            src={newAttachment}
                                            style={{
                                                backgroundImage: newAttachment,
                                            }}
                                            />
                                            <div className="modify__clear" onClick={onClearAttachment}>
                                            <span style={{marginRight:10}}>Remove</span>
                                            <FontAwesomeIcon icon={faTimes} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                             <input type="submit" value="Update Nweet" className="formBtn" />
                        </form>
                        
                        <span onClick={toggleEditing} className="formBtn cancelBtn">
                            Cancel
                        </span>
                    </>
                ) : (
                        <>
                            <h6>{userName} | {date[3]} {date[1]} {date[2]} {date[4]}</h6>
                            <h4>{nweetObj.text}</h4>
                            {nweetObj.attachmentURL && (<img src={nweetObj.attachmentURL} onClick = {() => window.open(nweetObj.attachmentURL, 'new', 'top=100, left=100')} /> )}
                            {isOwner && (
                                <div className="nweet__actions">
                                    <span onClick={onDeleteClick}>
                                    <FontAwesomeIcon icon={faTrashAlt} color={"#98adfa"} />
                                    </span>
                                    <span onClick={toggleEditing}>
                                    <FontAwesomeIcon icon={faPencilAlt} color={"#98adfa"} />
                                    </span>
                                </div>
                            )}
                        </>
                    )}
        </div>
    </div>
    )
}

export default Nweet;