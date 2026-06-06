import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Calendar, Edit, Save, User, X, CheckCircle, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from '../../layouts/Footer';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

const defaultProfile = {
  name: "",
  first_name: "",
  last_name: "",
  subtitle: "Admin",
  avatar: "https://avatar.iran.liara.run/public/boy?username=Admin",
  email: "",
  phone: "",
  contactNumber: "",
  location: "",
  bio: "",
  // memberSince: new Date().toLocaleDateString(),
  // createdAt: new Date().toLocaleDateString(),
  status: "unverified"
};

export const AdminProfileEdit = ({
  'data-id': dataId,
  profile = defaultProfile,
  onSave,
  onProfileChange
}) => {
  const [activeProfile, setActiveProfile] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
       
        if (storedUser && token) {
          const userObj = JSON.parse(storedUser);
          const userId = userObj.user ? userObj.user._id : (userObj._id || userObj.userid);

          if (userId) {
            document.cookie = `access_token=${token}`;
            const response = await axios.get(`${baseUrl}${apiVersion}/authUser/getUserDetails`, {
                withCredentials: true
            });
    
            if (response.data) {
                const userData = response.data.user || response.data; 

                const mappedProfile = {
                    ...defaultProfile,
                    ...activeProfile,
                    ...userData,
                    contactNumber: userData.contactNumber || activeProfile.contactNumber || activeProfile.phone || defaultProfile.contactNumber,
                    // If backend doesn't send subtitle, keep default "Admin"
                    name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || activeProfile.name || defaultProfile.name,
                    createdAt: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'
                };
                
                setActiveProfile(mappedProfile);
                setEditedProfile(mappedProfile);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      }
    };

    fetchUserData();
  }, []); // Run once on mount

    useEffect(() => {
        if (activeProfile.profilePicture) {
            setImagePreview(`${baseUrl}/${activeProfile.profilePicture}`);
        }
    }, [activeProfile.profilePicture]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

  const initials = activeProfile.name ? activeProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'A';

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(activeProfile);
  };

  const handleSave = async () => {
    try {
        const formData = new FormData();
        Object.keys(editedProfile).forEach(key => {
            formData.append(key, editedProfile[key]);
        });
        
        if (imageFile) {
            formData.append("profilePicture", imageFile);
        }

        // Optimistic update (skip for file upload as we need backend url)
        // onSave?.(editedProfile);
        
        // API update
        const token = localStorage.getItem('token');
        document.cookie = `access_token=${token}`;
        const response = await axios.put(`${baseUrl}${apiVersion}/authUser/Updateuser`, formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data && response.data.success) {
            toast.success("Profile updated successfully");
            // Refresh profile data to get new image URL
             const updatedProfile = { ...editedProfile };
             if(response.data.user && response.data.user.profilePicture){
                 updatedProfile.profilePicture = response.data.user.profilePicture;
                 setImagePreview(`${baseUrl}/${response.data.user.profilePicture}`);
             }

            setActiveProfile(updatedProfile);
            setIsEditing(false);
            setImageFile(null);
        } else {
             // Revert or show error (for now just toast)
             toast.error(response.data?.message || "Failed to update profile");
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(error.response?.data?.message || "An error occurred while updating profile");
    }
  };

  const handleCancel = () => {
    setEditedProfile(activeProfile);
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(activeProfile.profilePicture ? `${baseUrl}/${activeProfile.profilePicture}` : null);
  };

  const handleVerify = async () => {
    try {
      const token = localStorage.getItem('token');
      if(!token){
        toast.error("Please login and try again to verify your email");
      }
        
        const response = await axios.get(`${baseUrl}${apiVersion}/authUser/getVerificationMail`, {
            params: { token: token },
            withCredentials: true
        });

        if (response.data && response.data.success) {
            toast.success(response.data.message || "Verification email sent. Please check your inbox.");
        } else {
            toast.error(response.data?.message || "Failed to send verification email.");
        }
    } catch (error) {
        console.error("Verification error:", error);
        toast.error(error.response?.data?.message || "An error occurred while sending verification email.");
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value
    }));
    onProfileChange?.(field, value);
  };

  const currentProfile = isEditing ? editedProfile : activeProfile;

  return (
    <div data-id={dataId} className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="bg-[#0A2E5C] px-6 py-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#0A2E5C] font-semibold text-xl overflow-hidden">
                {imagePreview ? (
                    <img
                    src={imagePreview}
                    alt={currentProfile.name}
                    className="w-full h-full object-cover" 
                    />
                ) : (
                    currentProfile.avatar ? (
                        <img 
                            src={currentProfile.avatar} 
                            alt={currentProfile.name} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        initials
                    )
                )}
                </div>
                {isEditing && (
                    <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer shadow-md hover:bg-gray-100 transition-colors">
                        <Camera className="w-4 h-4 text-[#0A2E5C]" />
                        <input 
                            type="file" 
                            id="profile-upload" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageChange}
                        />
                    </label>
                )}
            </div>
            <div>
              <h1 className="text-white text-2xl font-semibold">
                {currentProfile.name || "Admin User"}
              </h1>
              <p className="text-white/80 text-sm">{currentProfile.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-md font-medium hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-[#0A2E5C] rounded-md font-medium hover:bg-white/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#0A2E5C] rounded-md font-medium hover:bg-white/90 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div
          className={`bg-white rounded-lg shadow-sm p-6 transition-all ${isEditing ? 'ring-2 ring-[#0A2E5C]/20' : ''}`}
        >
          <h2 className="text-[#0A2E5C] font-semibold text-lg mb-6">
            Personal Information
          </h2>
          <div className="space-y-6">

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-[#999fa8] mt-1" />
              <div className="flex-1">
                <label className="text-[#999fa8] text-sm block mb-1">
                  first name
                </label>
                <input
                  type="text"
                  value={currentProfile.first_name || ''}
                  onChange={(e) => handleFieldChange('first_name', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} 
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-[#999fa8] mt-1" />
              <div className="flex-1">
                <label className="text-[#999fa8] text-sm block mb-1">
                  last name
                </label>
                <input
                  type="text"
                  value={currentProfile.last_name || ''}
                  onChange={(e) => handleFieldChange('last_name', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} 
                />
              </div>
            </div>

            
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#999fa8] mt-1" />
              <div className="flex-1">
                <label className="text-[#999fa8] text-sm block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={currentProfile.email || ''}
                  readOnly
                  disabled={isEditing}
                  className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} 
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#999fa8] mt-1" />
              <div className="flex-1">
                <label className="text-[#999fa8] text-sm block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={currentProfile.contactNumber || ''}
                  onChange={(e) => handleFieldChange('contactNumber', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} 
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#999fa8] mt-1" />
              <div className="flex-1">
                <label className="text-[#999fa8] text-sm block mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={currentProfile.location || ''}
                  onChange={(e) =>
                    handleFieldChange('location', e.target.value)
                  }
                  disabled={!isEditing}
                  className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} 
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#999fa8] mt-1" />
              <div className="flex-1">
                <label className="text-[#999fa8] text-sm block mb-1">
                  Member Since
                </label>
                <div className="text-[#0A2E5C] font-medium">
                  {currentProfile.createdAt}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-8">
            <h3 className="text-[#0A2E5C] font-semibold text-base mb-3">
              Bio
            </h3>
            <textarea
              value={currentProfile.bio || ''}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              disabled={!isEditing}
              rows={3}
              className={`w-full text-[#999fa8] text-sm leading-relaxed resize-none focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`}
              placeholder="Tell us about yourself..." 
            />
          </div>

          {/* status */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-[#0A2E5C] font-semibold text-base mb-3">
              Account Status
            </h3>
            {activeProfile.status === 'verified' ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg w-fit">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Verified Account</span>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="text-yellow-700 font-medium">
                    Status: {activeProfile.status || 'Unverified'}
                  </div>
                </div>
                <button 
                  onClick={handleVerify}
                  className="group flex items-center gap-2 bg-gradient-to-r from-[#0A2E5C] to-[#0A2E5C]/80 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg hover:to-[#0A2E5C] transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Verify Now</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </div>
    
  );
};