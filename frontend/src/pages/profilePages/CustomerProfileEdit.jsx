import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Calendar, Edit, Save, X ,User, Camera} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Footer from '../../layouts/Footer';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;


const defaultRecentActivity = [
  { title: "Rented a Tesla Model 3", timestamp: "2 hours ago" },
  { title: "Updated profile picture", timestamp: "1 day ago" },
  { title: "Left a review for BMW X5", timestamp: "3 days ago" },
];

export const CustomerProfileEdit = ({
  'data-id': dataId,
  profile ,
  stats ,
  recentActivity = defaultRecentActivity,
  onSave,
  onProfileChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeProfile, setActiveProfile] = useState([]);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [customerBookings, setCustomerBookings] = useState([]);
    
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

            const response2 = await axios.get(`${baseUrl}${apiVersion}/bookings/customer/${userId}`, {
                withCredentials: true
            });

            if (response.data) {
                const userData = response.data.user || response.data; 

                const mappedProfile = {                    
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

            if(response2.data){
              const customerBookings = response2.data.data;
              setCustomerBookings(customerBookings);
              console.log(customerBookings);
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

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(activeProfile); // Reset to active profile when starting edit
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

      const token = localStorage.getItem('token');
      document.cookie = `access_token=${token}`;

      const response = await axios.put(`${baseUrl}${apiVersion}/authUser/updateUser/`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
      });
      
      if(response.data && response.data.success){
        // Refresh profile data to get new image URL
         const updatedProfile = { ...editedProfile };
         if(response.data.user && response.data.user.profilePicture){
             updatedProfile.profilePicture = response.data.user.profilePicture;
             setImagePreview(`${baseUrl}/${response.data.user.profilePicture}`);
         }

        setActiveProfile(updatedProfile);
        toast.success("Profile updated successfully");
        setIsEditing(false);
        setImageFile(null);
        onSave?.(updatedProfile);
      }

    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Failed to update profile data");
    }
  };

  const handleCancel = () => {
    setEditedProfile(activeProfile);
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(activeProfile.profilePicture ? `${baseUrl}/${activeProfile.profilePicture}` : null);
  };
  const handleFieldChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value
    }));
    onProfileChange?.(field, value);
  };
  const initials = activeProfile.name ? activeProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'A';
  const currentProfile = isEditing ? editedProfile : activeProfile;
  return (
    <div data-id={dataId} className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="bg-[#0A2E5C] px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#0A2E5C] font-semibold text-xl overflow-hidden">
                
                <img
                    src={ imagePreview || currentProfile.avatar ||"https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop"}
                    alt={initials}
                    className="w-full h-full object-cover" /> 
                
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
              <h1 className="text-white text-2xl font-semibold capitalize">
                {currentProfile.first_name} {currentProfile.last_name}
              </h1>
              <p className="text-white/80 text-sm">{"customer"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ?
            <>
                <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-md font-medium hover:bg-white/20 transition-colors">

                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#0A2E5C] rounded-md font-medium hover:bg-white/90 transition-colors">

                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </> :

            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#0A2E5C] rounded-md font-medium hover:bg-white/90 transition-colors">

                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            }
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div
              className={`bg-white rounded-lg shadow-sm p-6 transition-all ${isEditing ? 'ring-2 ring-[#0A2E5C]/20' : ''}`}>

              <h2 className="text-[#0A2E5C] font-semibold text-lg mb-6">
                Personal Information
              </h2>
              <div className="space-y-6">

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-[#999fa8] mt-1" />
                  <div className="flex-1">
                    <label className="text-[#999fa8] text-sm block mb-1">
                     First Name
                    </label>
                    <input
                      type="text"
                      value={currentProfile.first_name||""}
                      onChange={(e) =>
                      handleFieldChange('first_name', e.target.value)
                      }
                      disabled={!isEditing}
                      className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} />

                  </div>
                </div>

                  <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-[#999fa8] mt-1" />
                  <div className="flex-1">
                    <label className="text-[#999fa8] text-sm block mb-1">
                     Last Name
                    </label>
                    <input
                      type="text"
                      value={currentProfile.last_name||""}
                      onChange={(e) =>
                      handleFieldChange('last_name', e.target.value)
                      }
                      disabled={!isEditing}
                      className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} />

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
                      value={currentProfile.email||""}
                      readOnly
                      disabled={isEditing}
                      className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} />

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
                      value={currentProfile.contactNumber||""}
                      onChange={(e) =>
                      handleFieldChange('contactNumber', e.target.value)
                      }
                      disabled={!isEditing}
                      className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} />

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
                      value={currentProfile.location||""}
                      onChange={(e) =>
                      handleFieldChange('location', e.target.value)
                      }
                      disabled={!isEditing}
                      className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} />

                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#999fa8] mt-1" />
                  <div className="flex-1">
                    <label className="text-[#999fa8] text-sm block mb-1">
                      Member Since
                    </label>
                    <div className="text-[#0A2E5C] font-medium">
                      {currentProfile.createdAt||""}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div
              className={`bg-white rounded-lg shadow-sm p-6 transition-all ${isEditing ? 'ring-2 ring-[#0A2E5C]/20' : ''}`}>

              <h2 className="text-[#0A2E5C] font-semibold text-lg mb-4">
                Bio
              </h2>
              <textarea
                value={activeProfile.bio||""}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className={`w-full text-[#999fa8] text-sm leading-relaxed resize-none focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`}
                placeholder="Tell us about yourself..." />

            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-[#0A2E5C] font-semibold text-lg mb-6">
                Account Stats
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="text-[#999fa8] text-sm mb-1">
                   All booking
                  </div>
                  <div className="text-[#0A2E5C] text-3xl font-bold">
                    {customerBookings.length }
                  </div>
                </div>
                <div>
                  <div className="text-[#999fa8] text-sm mb-1">
                    pending bookings 
                  </div>
                  <div className="text-[#0A2E5C] text-3xl font-bold">
                    {customerBookings.filter((booking) => booking.status === 'pending').length}
                  </div>
                </div>
                <div>
                  <div className="text-[#999fa8] text-sm mb-1">
                    cancelled bookings 
                  </div>
                  <div className="text-[#0A2E5C] text-3xl font-bold">
                    {customerBookings.filter((booking) => booking.status === 'cancelled').length}
                  </div>
                </div>
               <div>
                  <div className="text-[#999fa8] text-sm mb-1">
                    total spends 
                  </div>
                  <div className="text-[#0A2E5C] text-3xl font-bold">
                    {customerBookings.reduce((totalAmount, tot) => totalAmount + tot.totalAmount, 0) }
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#0A2E5C] rounded-lg shadow-sm p-6">
              <h2 className="text-white font-semibold text-lg mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) =>
                <div
                  key={index}
                  className="border-b border-white/20 pb-4 last:border-0 last:pb-0">

                    <div className="text-white font-medium text-sm mb-1">
                      {activity.title}
                    </div>
                    <div className="text-white/60 text-xs">
                      {activity.timestamp}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>);

};