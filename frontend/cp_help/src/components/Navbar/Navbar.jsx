import React, { useState } from 'react';
import ProfileInfo from '../Cards/ProfileInfo';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';

const Navbar = ({userInfo,showSearchBar}) => {
  const [ searchQuery,setSearchQuery] = useState("");
  const navigate = useNavigate();

  const onLogout =()=>{
    localStorage.clear();
    navigate("/login");
  }
  const goToHome =()=>{
    navigate("/dashboard");
  }
  const goToProblems =()=>{
    navigate("/problems/" + userInfo.codeforcesHandle);
  }
  const goToCompare = () => {
    navigate("/Compare");
  };
  
  const showProfile =()=>{
    navigate("/profile/" + userInfo.codeforcesHandle);
  }
  const handleSearch=() =>{

  };

  const onClearSearch=()=>{
    setSearchQuery("");
  };
  return (
    <div className='bg-white flex items-center justify-between px-6 py-2 drop-shadow'>
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-medium text-black py-2">CodeSphere</h2>
        <div onClick={goToHome}>Home</div>
        <div onClick={goToProblems}>Problems</div>
        <div onClick={goToCompare}>Compare</div>
      </div>
      { showSearchBar &&(
      <SearchBar 
        value={searchQuery} 
        onChange={({target}) =>{setSearchQuery(target.value)}}
        handleSearch ={handleSearch}
        onClearSearch={onClearSearch}
        >
      </SearchBar>
      )}

      <ProfileInfo userInfo={userInfo} onLogout={onLogout} showProfile={showProfile}/>
    </div>
  )
}

export default Navbar