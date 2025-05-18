import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import { useAuth } from '../context/AuthContext';
import { FaLightbulb, FaRedo } from 'react-icons/fa';

const Homepage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/posts/get_all_post');
      setPosts(response.data);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить посты');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts(); // Обновляем посты после создания нового
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(posts.filter(post => post.id !== deletedPostId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Делитесь своими мыслями
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-6">
                Создавайте посты, делитесь идеями и обсуждайте интересные темы в нашем сообществе
              </p>
              {!currentUser && (
                <div className="flex gap-4 mt-2">
                  <a href="/register" className="bg-white text-blue-600 hover:bg-opacity-90 px-6 py-3 rounded-full font-bold transition shadow-lg">
                    Присоединиться
                  </a>
                  <a href="/login" className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 px-6 py-3 rounded-full font-bold transition">
                    Войти
                  </a>
                </div>
              )}
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="/hero-image.svg" 
                alt="Hero illustration" 
                className="max-w-full h-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="hidden md:block">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h3 className="text-xl font-bold text-dark mb-4">Добро пожаловать!</h3>
              <p className="text-secondary mb-4">
                Это платформа для обмена мыслями и идеями. Создавайте посты и общайтесь с другими пользователями.
              </p>
              {currentUser ? (
                <div className="flex items-center p-3 bg-blue-50 rounded-lg text-primary">
                  <FaLightbulb className="mr-2" />
                  <p className="text-sm font-medium">Создайте свой первый пост прямо сейчас!</p>
                </div>
              ) : (
                <a href="/register" className="block text-center bg-primary text-white hover:bg-blue-600 transition py-2 px-4 rounded-lg font-medium">
                  Зарегистрироваться
                </a>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold text-dark mb-6">Лента постов</h2>
            
            <CreatePost onPostCreated={handlePostCreated} />
            
            <div className="my-8">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100">
                  <p className="text-red-500 mb-3 font-medium">{error}</p>
                  <button 
                    onClick={fetchPosts}
                    className="flex items-center mx-auto text-primary hover:underline font-medium"
                  >
                    <FaRedo className="mr-2" />
                    Попробовать снова
                  </button>
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
                    <FaLightbulb className="text-primary text-xl" />
                  </div>
                  <p className="text-xl font-medium text-dark">Пока нет постов</p>
                  <p className="text-secondary mt-2">
                    {currentUser ? 'Создайте первый пост!' : 'Зарегистрируйтесь, чтобы создать первый пост!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage; 