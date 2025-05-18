import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Post from '../components/Post';
import { FaSearch, FaTag, FaTimes } from 'react-icons/fa';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [popularTags, setPopularTags] = useState([]);

  // Parse query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tag = queryParams.get('tag');
    const query = queryParams.get('query');
    
    setActiveTag(tag || '');
    setActiveQuery(query || '');
    
    if (tag || query) {
      searchPosts(tag, query);
    } else {
      fetchAllPosts();
    }
  }, [location.search]);

  // Fetch all posts when no filters are applied
  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/posts/get_all_post');
      setPosts(response.data);
      
      // Extract and count tags from all posts
      const tagsMap = {};
      response.data.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => {
            tagsMap[tag] = (tagsMap[tag] || 0) + 1;
          });
        }
      });
      
      // Convert to array and sort by popularity
      const sortedTags = Object.entries(tagsMap)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Take top 10 tags
        
      setPopularTags(sortedTags);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить посты');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search posts by tag and/or query
  const searchPosts = async (tag, query) => {
    try {
      setLoading(true);
      
      // Построение URL с параметрами
      let url = '/posts/search?';
      const params = [];
      if (tag) params.push(`tag=${encodeURIComponent(tag)}`);
      if (query) params.push(`query=${encodeURIComponent(query)}`);
      url += params.join('&');
      
      const response = await axiosInstance.get(url);
      setPosts(response.data);
      setError('');
    } catch (err) {
      const tagMsg = tag ? ` с тегом "#${tag}"` : '';
      const queryMsg = query ? ` по запросу "${query}"` : '';
      setError(`Не удалось найти посты${tagMsg}${queryMsg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle tag click
  const handleTagClick = (tag) => {
    setActiveTag(tag);
    setActiveQuery('');
    navigate(`/search?tag=${encodeURIComponent(tag)}`);
  };

  // Clear active filters
  const clearFilters = () => {
    setActiveTag('');
    setActiveQuery('');
    setSearchTerm('');
    navigate('/search');
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    if (searchTerm.trim().startsWith('#')) {
      // If search term starts with #, treat it as a tag search
      const tag = searchTerm.trim().substring(1);
      if (tag) {
        setActiveTag(tag);
        setActiveQuery('');
        navigate(`/search?tag=${encodeURIComponent(tag)}`);
      }
    } else {
      // Regular text search
      const query = searchTerm.trim();
      setActiveQuery(query);
      setActiveTag('');
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(posts.filter(post => post.id !== deletedPostId));
  };

  const getSearchTitle = () => {
    if (activeTag && activeQuery) {
      return `Посты с тегом "#${activeTag}" и запросом "${activeQuery}"`;
    } else if (activeTag) {
      return `Посты с тегом: #${activeTag}`;
    } else if (activeQuery) {
      return `Результаты поиска: "${activeQuery}"`;
    } else {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white">
      {/* Search Header */}
      <div className="bg-white border-b border-extralight shadow-sm">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-dark">Поиск постов</h1>
            
            <form onSubmit={handleSearchSubmit} className="w-full md:w-auto md:min-w-[300px]">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по тегу (#тег) или содержимому"
                  className="w-full py-2.5 pl-10 pr-4 bg-gray-50 border border-extralight rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Active Filters */}
        {(activeTag || activeQuery) && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaSearch className="text-primary" />
                <h2 className="text-xl font-medium">{getSearchTitle()}</h2>
              </div>
              <button 
                onClick={clearFilters}
                className="text-gray-500 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar with Popular Tags */}
          <div className="hidden md:block">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h3 className="text-xl font-bold text-dark mb-4 flex items-center">
                <FaTag className="mr-2 text-primary" />
                Популярные теги
              </h3>
              
              {popularTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(({tag, count}) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`${
                        activeTag === tag 
                          ? 'bg-primary text-white' 
                          : 'bg-blue-50 text-primary hover:bg-blue-100'
                      } transition-colors rounded-full px-3 py-1 text-sm flex items-center gap-1`}
                    >
                      <span>#{tag}</span>
                      <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-secondary text-sm">Нет активных тегов</p>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="my-4">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100">
                  <p className="text-red-500 mb-3 font-medium">{error}</p>
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map(post => (
                    <Post 
                      key={post.id} 
                      post={post} 
                      onDelete={handlePostDeleted}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center bg-white p-10 rounded-xl border border-extralight shadow-sm">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaSearch className="text-primary text-xl" />
                  </div>
                  <p className="text-xl font-medium text-dark">Посты не найдены</p>
                  <p className="text-secondary mt-2">
                    {getSearchTitle() 
                      ? `Нет результатов по вашему запросу` 
                      : 'Попробуйте другие параметры поиска'}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Tags */}
            <div className="md:hidden mt-8 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-dark mb-3 flex items-center">
                <FaTag className="mr-2 text-primary" />
                Популярные теги
              </h3>
              
              {popularTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(({tag, count}) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`${
                        activeTag === tag 
                          ? 'bg-primary text-white' 
                          : 'bg-blue-50 text-primary hover:bg-blue-100'
                      } transition-colors rounded-full px-3 py-1 text-sm flex items-center gap-1`}
                    >
                      <span>#{tag}</span>
                      <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-secondary text-sm">Нет активных тегов</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 