import React, { useState, useEffect } from 'react';

const ProfileEditor = () => {
  const [profile, setProfile] = useState({ name: '', email: '', bio: '' });

  useEffect(() => {
    // Fetch user profile from an API or context
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit updated profile to an API
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name='name' value={profile.name} onChange={handleChange} placeholder='Name' />
      <input name='email' value={profile.email} onChange={handleChange} placeholder='Email' />
      <textarea name='bio' value={profile.bio} onChange={handleChange} placeholder='Bio' />
      <button type='submit'>Save</button>
    </form>
  );
};

export default ProfileEditor;