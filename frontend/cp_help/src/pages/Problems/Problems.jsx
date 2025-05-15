// import { useEffect, useState } from 'react'
// import Navbar from '../../components/Navbar/Navbar'
// import {useNavigate } from 'react-router-dom';
// import axiosInstance from '../../utils/axiosInstance';

// const Problems = () => {

//   const [userInfo, setUserInfo] = useState("");
//   const navigate = useNavigate();

//   const getUserInfo = async()=>{
//     try{
//       const response = await axiosInstance.get("/get-user");
//       if(response.data && response.data.user){
//         setUserInfo(response.data.user);
//       }
//     }
//     catch(error){
//       if(error.response.status === 401)
//       {
//         localStorage.clear();
//         navigate("/login");
//       }
//     }
//   };

//   useEffect(()=>{
//     getUserInfo();
//     return () =>{};
//   }, []);
  
//   return (
//     <>
//       <Navbar userInfo={userInfo} showSearchBar={false}></Navbar>


//     </>
//   )
// }

// export default Problems

import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Tag, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

// Default platforms and difficulty levels
const PLATFORMS = ['LeetCode', 'HackerRank', 'CodeForces', 'CodeChef', 'TopCoder', 'AlgoExpert', 'Other'];
const DIFFICULTY = ['Easy', 'Medium', 'Hard'];

export default function Problems() {
  // State for questions and form inputs
  const [questions, setQuestions] = useState(() => {
    const savedQuestions = localStorage.getItem('codingQuestions');
    return savedQuestions ? JSON.parse(savedQuestions) : [
      {
        id: 1,
        title: 'Two Sum',
        description: 'Find two numbers that add up to a target',
        platform: 'LeetCode',
        difficulty: 'Easy',
        tags: ['Arrays', 'Hash Table'],
        link: 'https://leetcode.com/problems/two-sum/',
        notes: 'Use a hash map to solve in O(n) time',
        dateAdded: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Valid Parentheses',
        description: 'Determine if the input string has valid parentheses',
        platform: 'LeetCode',
        difficulty: 'Easy',
        tags: ['Stack', 'String'],
        link: 'https://leetcode.com/problems/valid-parentheses/',
        notes: 'Use a stack to track opening brackets',
        dateAdded: new Date().toISOString()
      }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    platform: 'LeetCode',
    difficulty: 'Medium',
    tags: [],
    link: '',
    notes: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [allTags, setAllTags] = useState(() => {
    // Collect all unique tags from questions
    const tags = new Set();
    questions.forEach(q => q.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  });
  const [sortConfig, setSortConfig] = useState({ key: 'dateAdded', direction: 'desc' });

  // Save questions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('codingQuestions', JSON.stringify(questions));
    
    // Update all tags
    const tags = new Set();
    questions.forEach(q => q.tags.forEach(tag => tags.add(tag)));
    setAllTags(Array.from(tags));
  }, [questions]);

  // Handle adding a new question
  const handleAddQuestion = (e) => {
    e.preventDefault();
    const newQuestion = {
      ...formState,
      id: questions.length ? Math.max(...questions.map(q => q.id)) + 1 : 1,
      dateAdded: new Date().toISOString()
    };
    setQuestions([...questions, newQuestion]);
    setFormState({
      title: '',
      description: '',
      platform: 'LeetCode',
      difficulty: 'Medium',
      tags: [],
      link: '',
      notes: '',
    });
    setTagInput('');
    setShowForm(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value
    });
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (tagInput && !formState.tags.includes(tagInput)) {
      setFormState({
        ...formState,
        tags: [...formState.tags, tagInput]
      });
      setTagInput('');
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove) => {
    setFormState({
      ...formState,
      tags: formState.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handle deleting a question
  const handleDeleteQuestion = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  // Filter questions based on search query and filters
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.notes.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlatform = platformFilter === 'All' || question.platform === platformFilter;
    const matchesDifficulty = difficultyFilter === 'All' || question.difficulty === difficultyFilter;
    const matchesTag = tagFilter === '' || question.tags.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()));
    
    return matchesSearch && matchesPlatform && matchesDifficulty && matchesTag;
  });

  // Sort filtered questions
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortConfig.key === 'dateAdded') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.dateAdded) - new Date(b.dateAdded)
        : new Date(b.dateAdded) - new Date(a.dateAdded);
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorting icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Coding Questions Tracker</h1>
        
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search questions..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="All">All Platforms</option>
                {PLATFORMS.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="All">All Difficulties</option>
                {DIFFICULTY.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Filter by tag"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  list="available-tags"
                />
                <datalist id="available-tags">
                  {allTags.map(tag => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
              </div>
              
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setShowForm(!showForm)}
              >
                <Plus size={18} />
                <span>Add Question</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Add Question Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
            <form onSubmit={handleAddQuestion}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Question title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formState.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    placeholder="Brief description of the problem"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formState.description}
                    onChange={handleChange}
                    rows={3}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select
                    name="platform"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formState.platform}
                    onChange={handleChange}
                  >
                    {PLATFORMS.map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    name="difficulty"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formState.difficulty}
                    onChange={handleChange}
                  >
                    {DIFFICULTY.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                  <input
                    type="url"
                    name="link"
                    placeholder="URL to the problem"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formState.link}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a tag"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      list="available-tags-input"
                    />
                    <datalist id="available-tags-input">
                      {allTags.map(tag => (
                        <option key={tag} value={tag} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      onClick={handleAddTag}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formState.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Your approach, tips, or solutions"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formState.notes}
                    onChange={handleChange}
                    rows={4}
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Your Coding Questions ({filteredQuestions.length})</h2>
          </div>
          
          {filteredQuestions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {questions.length === 0 ? 
                "You haven't added any questions yet. Click 'Add Question' to get started." :
                "No questions match your current filters."
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('title')}
                    >
                      <div className="flex items-center gap-1">
                        Title {getSortIcon('title')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('platform')}
                    >
                      <div className="flex items-center gap-1">
                        Platform {getSortIcon('platform')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('difficulty')}
                    >
                      <div className="flex items-center gap-1">
                        Difficulty {getSortIcon('difficulty')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedQuestions.map(question => (
                    <tr key={question.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{question.title}</div>
                        <div className="text-sm text-gray-500">{question.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {question.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {question.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {question.link && (
                          <a 
                            href={question.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}