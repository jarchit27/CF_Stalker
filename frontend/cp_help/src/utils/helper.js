export const validateEmail = (email) =>{
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
} ;
export const getInitials=(name)=>{
    if(!name) return "";

    const words = name.split(" ");
    let intials ="";

    for (let index = 0; index < Math.min(words.length, 2); index++) {
        intials+= words[index][0];    
    }

    return intials.toUpperCase();

};
// Color mapping for Codeforces ranks
// export const getRatingColor = (rating) => {
//     if (rating >= 3000) return 'text-red-900';       // Legendary Grandmaster
//     if (rating >= 2600) return 'text-red-600';       // International Grandmaster
//     if (rating >= 2400) return 'text-orange-600';    // Grandmaster
//     if (rating >= 2300) return 'text-orange-400';    // International Master
//     if (rating >= 2100) return 'text-violet-500';    // Master
//     if (rating >= 1900) return 'text-blue-600';      // Candidate Master
//     if (rating >= 1600) return 'text-cyan-600';      // Expert
//     if (rating >= 1400) return 'text-green-600';     // Specialist
//     if (rating >= 1200) return 'text-lime-600';      // Pupil
//     return 'text-gray-500';                          // Newbie
//   };
  
    // return 'text-[rgb(255,0,0)]';