import React, { useState } from 'react'
import { MdClose } from 'react-icons/md';
import axiosInstance from '../../utils/axiosInstance';

const AddEditFriend = ({friendData, type,getAllFriends, onClose}) => {
  const [handle,setHandle] = useState(friendData?.handle || "");
  const[name, setName] = useState(friendData?.name || "");
  const[error, setError]=useState(null);

  const addNewFriend = async() =>{
    try{
      const response = await axiosInstance.post("/add-friend",{
        handle, name,
      });
      if(response.data && response.data.friend){
        getAllFriends();
        onClose();
      }
    }
    catch(error){
      if(error.response && error.response.data && error.response.data.message)
      {
        setError(error.response.data.message);
      }
    }
  };
  // add note

  const editFriend = async() =>{

    const friendId = friendData._id;
    try{
      const response = await axiosInstance.put("/edit-friend/" + friendId ,{
        handle,name,
      });
      if(response.data && response.data.friend){
        getAllFriends();
        onClose();
      }
    }
    catch(error){
      if(error.response && error.response.data && error.response.data.message)
      {
        setError(error.response.data.message);
      }
    }
  };
  const handleAddFriends=() =>{
    if(!handle)
    {
      setError("Please enter the handle");
      return;
    }
    if(!name)
    {
      setError("Please enter the name");
      return;
    }
    setError("");
    if(type === "edit")
    {
      editFriend();
    }
    else
    {
      addNewFriend();
    }
  };

  return (
    <div className='relative'>

      <button className='w-10 h-10 rounded full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-50'
              onClick={onClose}
      >
        <MdClose className='text-xl text-slate-400'></MdClose>
      </button>

      <div className='flex flex-col gap-2'>
        <label className='input-label'>Handle</label>
        <input 
            type='text' 
            className='text-2xl text-slate-950 outline-none'
            placeholder='Handle'
            value={handle}
            onChange={({target})=>setHandle(target.value)}
        ></input>
      </div>

      <div className='flex flex-col gap-2 mt-4'>
        <label className='input-label'>Name</label>
        <textarea 
            type='text' 
            className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
            placeholder='Name'
            rows={10}
            value={name}
            onChange={({target})=>setName(target.value)}
        ></textarea>
      </div>

      {error && <p className='text-red-500 text-xs pt-4'>{error}</p>}
      <button className='btn-primary font-medium mt-5 p-3' onClick={()=>{handleAddFriends()}}>
        {type === "edit" ? "UPDATE" : "ADD"}
      </button>

    </div>
  )
}

export default AddEditFriend