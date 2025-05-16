import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import FriendCard from '../../components/Cards/FriendCard'
import { MdAdd } from 'react-icons/md'
import AddEditFriend from './AddEditFriend'
import Modal from "react-modal";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const Home = () => {

  const[allFriends,setAllFriends] = useState([]);
  const [visibleCards, setVisibleCards] = useState(0);

  const[openAddEditModal, setOpenAddEditModal ] = useState({
    isShown:false,
    type:"add",
    data:null,
  });
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  const handleEdit = (friendDetails)=>{
    setOpenAddEditModal({isShown:true,data:friendDetails , type: "edit"});
  };
const handleDelete = async (friendDetails) => {
  const friendId = friendDetails._id;

  try {
    const response = await axiosInstance.delete("/delete-friend/" + friendId);
    if(response.data && !response.data.error )
    {
      getAllFriends();
    }
  } catch (error) {
      if(error.response && error.response.data && error.response.data.message)
      {
        console.log("an unexpected error");
      }
  }
};


  const getUserInfo = async()=>{
    try{
      const response = await axiosInstance.get("/get-user");
      if(response.data && response.data.user){
        setUserInfo(response.data.user);
      }
    }
    catch(error){
      if(error.response.status === 401)
      {
        localStorage.clear();
        navigate("/login");
      }
    }
  };
    const getAllFriends = async()=>{
    try{
      const response = await axiosInstance.get("/get-all-friends");
      if(response.data && response.data.friends)
      {
        setAllFriends(response.data.friends);
      }
    }
    catch(error){
      setError("An unexpected Error.")
    }
  };

    useEffect(()=>{
    getUserInfo();
    getAllFriends();

    return () =>{};
  }, []);

  useEffect(() => {
  if (allFriends.length > 0) {
    let index = 0;
    const interval = setInterval(() => {
      setVisibleCards((prev) => {
        if (prev < allFriends.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 2000); // 2 seconds per card
    return () => clearInterval(interval);
  }
}, [allFriends]);



  return (
    <>
    <div>
      <Navbar  userInfo={userInfo} showSearchBar={true}/>
      <div className='container mx-auto'>
      <div className='grid grid-cols-3 gap-4 mt-8'>
            {allFriends.slice(0, visibleCards).map((item, index) => (

              <FriendCard
                key={item._id}
                handle= {item.handle}
                date={item.createdOn}
                name= {item.name}
                onEdit= {()=> {handleEdit(item)}}
                onDelete ={()=>{handleDelete(item)}} 
                onViewAnalysis={() => {
                  navigate(`/viewanalysis/${item.handle}`);
                }}
                >
              </FriendCard>

            ))}

        </div>
      </div>
    </div>

    <button 
          className='w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-500 hover:bg-blue-600 fixed right-10 bottom-10' 
          onClick={() =>{
            setOpenAddEditModal({isShown:true, type:"add" , data:null});
          }}>
          <MdAdd className='text-[32px] text-white'/>
    </button>


    <Modal 
          isOpen = {openAddEditModal.isShown}
          onRequestClose ={()=>{}}
          style = {{
            overlay:{
              backgroundColor: "rgba(0,0,0,0.2)",
            },
          }}
          contentLabel=""
          className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll">
          <AddEditFriend
            type={openAddEditModal.type}
            friendData={openAddEditModal.data}
            onClose={()=> {
              setOpenAddEditModal({isShown:false,type:"add" ,data:null});
            }}
            getAllFriends = {getAllFriends}
          ></AddEditFriend>
        </Modal>
    </>
  )
}

export default Home