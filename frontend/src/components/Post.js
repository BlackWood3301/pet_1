import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaTrash, FaShare, FaBookmark, FaTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const Post = ({ post, onDelete }) => {
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const navigate = useNavigate();

  // Форматирование времени в человекочитаемый вид (пример: "2 часа назад")
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Недавно';
    
    const minutes = Math.floor(timestamp / 60);
    if (minutes < 60) return `${minutes} мин. назад`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч. назад`;
    
    const days = Math.floor(hours / 24);
    return `${days} дн. назад`;
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/posts/delete_post_account_${post.id}`);
      onDelete(post.id);
    } catch (error) {
      console.error('Ошибка при удалении поста:', error);
    }
  };

  const loadComments = async () => {
    if (!commentsLoaded) {
      try {
        const response = await axiosInstance.get(`/comment/get_comment_post/${post.id}`);
        setComments(response.data);
        setCommentsLoaded(true);
      } catch (error) {
        console.error('Ошибка при загрузке комментариев:', error);
      }
    }
    setCommentsOpen(!commentsOpen);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await axiosInstance.post('/comment/create_comment', {
        description: comment,
        post_id: post.id
      });
      
      // Перезагружаем комментарии после добавления
      const response = await axiosInstance.get(`/comment/get_comment_post/${post.id}`);
      setComments(response.data);
      setComment('');
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/search?tag=${tag}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-extralight overflow-hidden transition-all hover:shadow-md">
      {/* Post Header */}
      <div className="flex justify-between items-start p-4 pb-2">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
            {post.user_name ? post.user_name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="ml-3">
            <h3 className="font-bold text-dark">
              {post.user_name || "Пользователь"}
            </h3>
            <p className="text-secondary text-xs">{formatTime(post.time)}</p>
          </div>
        </div>

        {/* Delete Post Button (for post owner only) */}
        {currentUser && post.user_id === currentUser.id && (
          <button 
            onClick={handleDelete}
            className="text-red-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
            title="Удалить пост"
          >
            <FaTrash />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="block px-4 py-2">
        <h2 className="text-xl font-bold text-dark mb-2">{post.title}</h2>
        <p className="text-secondary">{post.short_description}</p>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <button
                key={index}
                onClick={() => handleTagClick(tag)}
                className="bg-blue-50 text-primary hover:bg-blue-100 transition-colors rounded-full px-3 py-1 text-sm flex items-center gap-1"
              >
                <FaTag size={10} />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-extralight">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setLiked(!liked)}
            className={`flex items-center ${liked ? 'text-red-500' : 'text-secondary'} hover:text-red-500 transition-colors`}
          >
            {liked ? <FaHeart className="mr-1.5" /> : <FaRegHeart className="mr-1.5" />}
            <span className="text-sm font-medium">Нравится</span>
          </button>

          <button 
            onClick={loadComments}
            className="flex items-center text-secondary hover:text-primary transition-colors"
          >
            <FaComment className="mr-1.5" />
            <span className="text-sm font-medium">
              {comments.length > 0 ? `${comments.length}` : 'Комментарии'}
            </span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="text-secondary hover:text-primary p-2 rounded-full transition-colors">
            <FaShare size={14} />
          </button>
          <button className="text-secondary hover:text-primary p-2 rounded-full transition-colors">
            <FaBookmark size={14} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {commentsOpen && (
        <div className="border-t border-extralight bg-white">
          {currentUser && (
            <form onSubmit={handleSubmitComment} className="p-4 pb-3">
              <div className="flex bg-gray-50 rounded-lg overflow-hidden border border-extralight focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Написать комментарий..."
                  className="py-2.5 px-4 flex-grow bg-transparent focus:outline-none"
                />
                <button 
                  type="submit"
                  className="bg-primary text-white px-6 hover:bg-blue-600 transition-colors font-medium"
                >
                  Отправить
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-extralight">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0">
                      {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="flex items-baseline mb-1">
                        <span className="font-semibold text-dark text-sm">
                          {comment.user_name || "Пользователь"}
                        </span>
                        <span className="ml-2 text-xs text-light">сейчас</span>
                      </div>
                      <p className="text-dark text-sm">{comment.description}</p>
                      <div className="flex items-center space-x-4 mt-1.5">
                        <button className="text-xs text-secondary hover:text-primary">Ответить</button>
                        <button className="text-xs text-secondary hover:text-red-500">Нравится</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaComment className="text-secondary" />
                </div>
                <p className="text-secondary">Нет комментариев</p>
                <p className="text-xs text-light mt-1">Будьте первым, кто оставит комментарий!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post; 