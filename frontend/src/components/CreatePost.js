import React, { useState } from 'react';
import axiosInstance from '../api/axios';
import { FaPaperPlane, FaImage, FaLink, FaTimes, FaTag } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    time: Math.floor(Date.now() / 1000),
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() === '') return;
    
    // Remove spaces and make lowercase for consistency
    const processedTag = tagInput.trim().toLowerCase();
    
    // Don't add duplicate tags
    if (formData.tags.includes(processedTag)) {
      setTagInput('');
      return;
    }
    
    // Add the new tag
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, processedTag]
    }));
    
    // Clear the input
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const expandForm = () => {
    if (!currentUser) {
      setError('Войдите, чтобы создать пост');
      return;
    }
    setIsExpanded(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Войдите, чтобы создать пост');
      return;
    }

    if (!formData.title.trim() || !formData.short_description.trim() || !formData.description.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axiosInstance.post('/posts/create_post', {
        ...formData,
        user_id: currentUser.id
      });

      if (response.data === 'Пост успешно добавлен') {
        setFormData({
          title: '',
          short_description: '',
          description: '',
          time: Math.floor(Date.now() / 1000),
          tags: []
        });
        setIsExpanded(false);
        
        // Уведомляем родительский компонент о создании поста
        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Произошла ошибка при создании поста');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tag input with Enter key
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(e);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-extralight overflow-hidden">
      {error && (
        <div className="bg-red-50 p-3 text-red-500 text-sm flex items-center justify-between">
          <p>{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <FaTimes />
          </button>
        </div>
      )}

      <div className="p-4">
        <form onSubmit={handleSubmit}>
          {!isExpanded ? (
            <div className="flex items-center">
              {currentUser && (
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3 shadow-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div 
                onClick={expandForm} 
                className="flex-grow bg-gray-50 hover:bg-gray-100 border border-extralight rounded-full px-4 py-2.5 cursor-text transition-colors"
              >
                <p className="text-secondary">Что у вас нового?</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-4">
                {currentUser && (
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-dark">{currentUser?.name}</p>
                  <p className="text-xs text-secondary">Публикация будет видна всем</p>
                </div>
              </div>
            
              <div className="mb-4">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Заголовок"
                  className="w-full bg-gray-50 border border-extralight rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  maxLength={100}
                />
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  placeholder="Краткое описание"
                  className="w-full bg-gray-50 border border-extralight rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  maxLength={150}
                />
              </div>
              
              <div className="mb-4">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Полное описание"
                  className="w-full bg-gray-50 border border-extralight rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px] resize-y"
                  maxLength={1000}
                />
              </div>
              
              {/* Tags Input */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <FaTag className="text-primary mr-2" />
                  <label className="text-sm font-medium text-dark">Теги</label>
                </div>
                
                {/* Display existing tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <div 
                        key={tag}
                        className="bg-blue-100 text-primary rounded-full px-3 py-1 text-sm flex items-center gap-1.5"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-primary hover:text-red-500 transition-colors"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Tag input */}
                <div className="flex">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Добавить тег..."
                      className="w-full bg-gray-50 border border-extralight rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <span className="absolute inset-y-0 left-3 flex items-center pl-0 text-gray-400 pointer-events-none">
                      {tagInput && '#'}
                    </span>
                    {tagInput && (
                      <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400">
                        Нажмите Enter
                      </span>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddTag}
                    className="bg-primary text-white px-4 rounded-r-lg hover:bg-blue-600 transition-colors"
                  >
                    Добавить
                  </button>
                </div>
              </div>

              <div className="border-t border-extralight pt-3 flex flex-wrap gap-3">
                <button type="button" className="flex items-center text-secondary hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-blue-50">
                  <FaImage className="mr-2" />
                  <span>Добавить изображение</span>
                </button>
                <button type="button" className="flex items-center text-secondary hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-blue-50">
                  <FaLink className="mr-2" />
                  <span>Добавить ссылку</span>
                </button>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-extralight">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-secondary hover:text-dark hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center shadow-sm disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Публикация...
                    </span>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Опубликовать
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePost; 