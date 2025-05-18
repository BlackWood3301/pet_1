import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import Post from '../components/Post';

const ProfilePage = () => {
  const { currentUser, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const response = await axiosInstance.post('/posts/get_post_user');
        setPosts(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке постов пользователя:', err);
        setError('Не удалось загрузить ваши посты');
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchUserPosts();
    }
  }, [currentUser, loading]);

  const handlePostDeleted = (deletedPostId) => {
    setPosts(posts.filter(post => post.id !== deletedPostId));
  };

  // Редирект на страницу входа, если пользователь не авторизован
  if (!loading && !currentUser) {
    return <Navigate to="/login" />;
  }

  // Показываем загрузку, пока проверяем статус пользователя
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center">
          <div className="h-20 w-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold text-dark">{currentUser.name}</h1>
            <p className="text-secondary">{currentUser.email}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-dark mb-4">Мои публикации</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">
          <p>{error}</p>
        </div>
      ) : posts.length > 0 ? (
        <div>
          {posts.map(post => (
            <Post 
              key={post.id} 
              post={post} 
              onDelete={handlePostDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-secondary py-10 bg-white rounded-xl shadow-sm">
          <p className="text-lg">У вас пока нет публикаций</p>
          <p className="mt-2">Создайте свой первый пост на главной странице!</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 