import { useEffect, useState } from 'react';
import { MdCreate, MdDelete, MdLocationOn, MdEmojiEvents, MdCode } from 'react-icons/md';
import { getBgColorByRating, getColorByRating } from '../../utils/helper';

const FriendCard = ({ handle, name, onEdit, onDelete, onViewAnalysis }) => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [solvedCount, setSolvedCount] = useState(null);
  const [contestsCount, setContestsCount] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userInfoRes, ratingRes, submissionsRes] = await Promise.all([
          fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
          fetch(`https://codeforces.com/api/user.rating?handle=${handle}`),
          fetch(`https://codeforces.com/api/user.status?handle=${handle}`),
        ]);

        const userInfoData = await userInfoRes.json();
        const ratingData = await ratingRes.json();
        const submissionsData = await submissionsRes.json();

        if (userInfoData.status !== 'OK') throw new Error('User not found');

        setUserData(userInfoData.result[0]);

        if (ratingData.status === 'OK') {
          setContestsCount(ratingData.result.length);
        }

        if (submissionsData.status === 'OK') {
          const solved = new Set();
          submissionsData.result.forEach((submission) => {
            if (submission.verdict === 'OK') {
              const key = `${submission.problem.contestId}-${submission.problem.index}`;
              solved.add(key);
            }
          });
          setSolvedCount(solved.size);
        }
      } catch (err) {
        setError('Failed to load data for handle: ' + handle);
      }
    };

    fetchUserData();
  }, [handle]);

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg p-4 my-3 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Error for @{handle}: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-gray-50 rounded-lg p-5 my-3 animate-pulse shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-3 text-sm text-slate-500 text-center">
          Loading Codeforces data for <strong>@{handle}</strong>...
        </div>
      </div>
    );
  }

  const cardBgColor = getBgColorByRating(userData.rating);
  const ratingColor = getColorByRating(userData.rating);
  const maxRatingColor = getColorByRating(userData.maxRating);

  return (
    <div className={`rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${cardBgColor} border border-gray-100 flex flex-col h-full`}>
      {/* Header with gradient background based on rating */}
      <div className={`p-4 ${ratingColor.replace('text-', 'bg-').replace('-600', '-100')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${ratingColor.replace('text-', 'bg-')}`}>
              {name.charAt(0).toUpperCase()}
            </div> */}
            <div>
              <h3 className="text-lg font-bold">{name}</h3>
              <p className="text-xs font-mono">@{handle}</p>
            </div>
          </div>
          <div className={`text-xl font-bold ${ratingColor}`}>
            {userData.rating || 0}
          </div>
        </div>
      </div>

      {/* Body content */}
      <div className="p-4 space-y-3 flex-grow">
        {/* Ranks */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">Rank</p>
            <p className={`font-bold ${ratingColor}`}>
              {userData.rank || "Unrated"}
            </p>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">Max Rank</p>
            <p className={`font-bold ${maxRatingColor}`}>
              {userData.maxRank || "Unrated"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-lg p-2 shadow-sm text-center">
            <div className="flex flex-col items-center">
              <p className="text-xs text-gray-500 uppercase font-semibold">Contribution</p>
              <p className={`font-bold ${userData.contribution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {userData.contribution}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm text-center">
            <div className="flex flex-col items-center">
              <MdEmojiEvents className="text-amber-500" />
              <p className="text-xs text-gray-500 uppercase font-semibold">Contests</p>
              <p className="font-bold">{contestsCount ?? '...'}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm text-center">
            <div className="flex flex-col items-center">
              <MdCode className="text-blue-500" />
              <p className="text-xs text-gray-500 uppercase font-semibold">Solved</p>
              <p className="font-bold">{solvedCount ?? '...'}</p>
            </div>
          </div>
        </div>

        {/* Location & Organization */}
        <div className="space-y-1 text-sm">
          {(userData.country || userData.city) && (
            <div className="flex items-center text-gray-600">
              <MdLocationOn className="mr-1 text-gray-400" />
              <p className="truncate">
                {userData.city ? `${userData.city}, ` : ""}
                {userData.country}
              </p>
            </div>
          )}
          
          {userData.organization && (
            <p className="text-gray-600 truncate text-sm">
              <span className="font-medium">Org:</span> {userData.organization}
            </p>
          )}
          
          {userData.friendOfCount && (
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Friends:</span> {userData.friendOfCount}
            </p>
          )}
        </div>
      </div>

      {/* Footer with action buttons */}
      <div className="px-4 py-3 mt-auto border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button 
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center space-x-1 text-sm" 
            onClick={onViewAnalysis}
          >
            <span>View Analysis</span>
          </button>
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 rounded-full hover:bg-green-100 text-gray-600 hover:text-green-600 transition-colors" 
              onClick={onEdit}
            >
              <MdCreate className="text-xl" />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors" 
              onClick={onDelete}
            >
              <MdDelete className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;