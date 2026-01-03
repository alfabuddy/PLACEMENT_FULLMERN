// src/pages/ProfilePage.jsx (CORRECTED FULL CODE)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx';
import api from '../lib/api.js';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
// Assuming you have components/ui/select from shadcn-ui
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Globe } from 'lucide-react'; // Import icons

const supportedLanguages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'es', label: 'Spanish (Español)' },
];

const ProfilePage = () => {
  // Get user data and the function to update context
  const { user, logout, updateUserLanguage } = useAuth();
  // Initialize state from the context
  const [selectedLanguage, setSelectedLanguage] = useState(user?.preferredLanguage || 'en');
  const [isLoading, setIsLoading] = useState(false);
  
  // This useEffect ensures the local state syncs if user logs in later
  useEffect(() => {
    if (user && user.preferredLanguage) {
      setSelectedLanguage(user.preferredLanguage);
    }
  }, [user]);

  // --- DEFINITION FOR MISSING FUNCTION ---
  const handleLanguageChange = (value) => {
    setSelectedLanguage(value);
  };
  // --- END DEFINITION ---

  if (!user) {
    return (
      <div>
        <Header />
        <div className="flex justify-center items-center p-8">Loading profile...</div>
      </div>
    );
  }
  
  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Call the new API endpoint to save the preference in the database
      await api.put('/users/language', { language: selectedLanguage });
      
      // Update the user state in the AuthContext for immediate effect
      updateUserLanguage(selectedLanguage);
      
      toast.success('Language preference updated! 🌐');
    } catch (error) {
      console.error('Failed to update language', error);
      toast.error(error.response?.data?.message || 'Failed to update preferences.');
      // Revert state if API call fails
      setSelectedLanguage(user.preferredLanguage);
    } finally {
      setIsLoading(false);
    }
  };

  const isSaveDisabled = isLoading || selectedLanguage === user.preferredLanguage;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header /> 
      
      <div className="max-w-2xl mx-auto my-8 p-8 bg-white border border-gray-200 rounded-xl shadow-lg">
        
        <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-3">
          User Profile & Preferences
        </h1>
        
        {/* User Information Card */}
        <div className="space-y-6 mb-8 p-4 border border-indigo-200 bg-indigo-50 rounded-lg">
          <div className="flex items-center gap-4">
            <User className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-indigo-700">Name</p>
              <p className="text-xl font-semibold text-gray-900">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Mail className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-indigo-700">Email</p>
              <p className="text-lg text-gray-700">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Language Preference Section */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <Globe className="w-5 h-5"/> Chat Language Settings
          </h2>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="language" className="text-sm font-medium text-gray-700">
              Preferred Translation Language
            </label>
            <Select 
              onValueChange={handleLanguageChange} // Now defined and functional
              value={selectedLanguage}
              disabled={isLoading}
            >
              <SelectTrigger id="language" className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent 
                 position="popper" // FIX: Ensures dropdown renders correctly without clipping
              > 
                {supportedLanguages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSavePreferences} 
              disabled={isSaveDisabled}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Language Preference'}
            </Button>
          </div>
        </div>
        
        {/* Logout Button */}
        <Button 
          onClick={logout}
          variant="destructive"
          className="w-full mt-8 bg-red-600 hover:bg-red-700 transition-colors"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;