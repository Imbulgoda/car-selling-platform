import React, { useEffect, useState } from 'react';
import { Star, MoreVertical, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../layouts/Layout';
import axios from 'axios';
import carPlaceholder from "../assets/ContactUsBG.jpeg";


const MyReviews = () => {
  const [reviews, setReviews] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editFeedback, setEditFeedback] = useState('');
  const [showMenu, setShowMenu] = useState(null);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);


  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_VERSION = import.meta.env.VITE_API_VERSION;
  const IMAGE_BASE_URL = API_BASE_URL;


  const stars = [1, 2, 3, 4, 5];

  const fetchMyReviews = async ()=>{
    try {
        const res = await axios.get(`${API_BASE_URL}${API_VERSION}/reviews/me`,
        {withCredentials:true}
        );
        console.log("Fetched Reviews: ",res);
        setReviews(res.data.reviews);
    } catch (error) {
        console.error("Faile to fetch reviews", error);

        if (error.request && !error.response) {
            toast.error("Network error. Please try again later.");
          } else {
            toast.error(
              error.response?.data?.message || "Failed to fetch reviews"
            );
          }

    } finally {
        setLoading(false);
    }
  };

  useEffect(()=>{

    fetchMyReviews();

  }, []);

  const handleEdit = (review) => {
    setEditingId(review._id);
    setEditRating(review.rate);
    setEditFeedback(review.feedback);
    setShowMenu(null);
  };

  const handleDelete = async () => {

    try {
        await axios.delete(
            `${API_BASE_URL}${API_VERSION}/reviews/delete/${deleteTargetId}`,
            {withCredentials:true}
        );

        await fetchMyReviews();
        toast.success('Review deleted successfully');

        setDeleteTargetId(null); // colse modal
    } catch (error) {
        console.error('Failed to delete review', error);
        if (error.request && !error.response) {
            toast.error("Network error. Please try again later.");
          } else {
            toast.error(
              error.response?.data?.message || "Failed to delete review"
            );
          }

    }
  };

  const handleUpdate = async (reviewId) => {
    try {
        const res = await axios.put(
            `${API_BASE_URL}${API_VERSION}/reviews/update/${reviewId}`,
            {
                rate: editRating,
                feedback: editFeedback,
            },
            {withCredentials:true}
        );
        console.log('Update response:', res.data);

        // Re-fetch latest reviews
        await fetchMyReviews();

        toast.success('Review updated successfully');


        
        setEditingId(null);
        setEditRating(0);
        setEditFeedback('');
        setHover(0);
    } catch (error) {
        console.error('Failed to update review', error);
       if (error.request && !error.response) {
            toast.error("Network error. Please try again later.");
        } else {
            toast.error(
            error.response?.data?.message || "Failed to update review"
            );
        }

    }  
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditFeedback('');
  };

  return (
    <Layout>

        {loading && (
            <p className="text-center text-gray-500">Loading reviews...</p>
        )}

        <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-12 text-center">{`My Reviews (${reviews.length})`}</h1>
            
            <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-xl shadow-md p-6 border-2 border-[#0D3778]">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 relative">
                    {/* Car Image Placeholder */}
                    <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 md:w-24 md:h-24 lg:w-28 lg:h-28">
                        {review.vehicle_id?.photos?.length > 0 ? (
                            <img
                                src={`${IMAGE_BASE_URL}${review.vehicle_id.photos[0].url}`}
                                alt={review.vehicle_id?.model || "Vehicle"}
                                onError={(e) => {
                                    e.target.src= carPlaceholder;
                                }}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100">
                                <span className="text-[#0D3778] font-semibold text-xs text-center px-1">
                                    {review.vehicle_id?.model}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg text-gray-800 truncate">{review.vehicle_id?.title || " "}</h3>
                        <div 
                        className="p-2 hover:bg-gray-100 rounded-full cursor-pointer relative"
                        onClick={() => setShowMenu(showMenu === review._id ? null : review._id)}
                        >
                        <MoreVertical className="w-5 h-5 text-gray-500" />

                        
                        {/* Menu Dropdown */}
                        {showMenu === review._id && (
                            <div 
                            className="
                                absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg 
                                border-2 border-[#0D3778] z-10
                                origin-top-right transform transition-all duration-150
                                scale-95 opacity-100 animate-dropdown
                                "
                            >
                            {editingId !== review._id ? (
                                <button
                                onClick={() => handleEdit(review)}
                                className="block w-full text-center px-4 py-2 text-sm text-[#0D3778] hover:bg-[#0D3778] hover:text-white rounded-t-md border-b-2 border-b-[#0D3778]"
                                >
                                Edit
                                </button>
                            ) : (
                                <>
                                <button
                                    onClick={() => handleUpdate(review._id)}
                                    disabled={editRating === 0 || !editFeedback.trim()}
                                    className="block w-full text-center px-4 py-2 text-sm text-green-600 hover:bg-gray-100 font-medium disabled:text-gray-400 border-b-2 border-b-[#0D3778]"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="block w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b-2 border-b-[#0D3778]"
                                >
                                    Cancel
                                </button>
                                </>
                            )}
                            <button
                                onClick={() => {
                                    setDeleteTargetId(review._id);
                                    setShowMenu(null);
                                }}
                                className="block w-full text-center px-4 py-2 text-sm text-red-600 hover:bg-red-500 hover:text-white rounded-b-md"
                            >
                                Delete
                            </button>
                            </div>
                        )}
                        </div>
                    </div>

                    {editingId === review._id ? (
                        // Edit Form
                        <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="flex gap-1">
                                {stars.map((star) => (
                                    <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="transition-all duration-150 hover:scale-110 active:scale-95"
                                    >
                                    <Star
                                        size={32}
                                        className={
                                        star <= (hover || editRating )
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-yellow-400'
                                        }
                                    />
                                    </button>
                                ))}
                            </div>

                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                            <textarea
                            value={editFeedback}
                            onChange={(e) => setEditFeedback(e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D3778] resize-vertical"
                            required
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <button
                            onClick={() => handleUpdate(review._id)}
                            disabled={editRating === 0 || !editFeedback.trim()}
                            className="flex-1 px-4 py-2 bg-[#0D3778] text-white rounded-lg hover:bg-blue-950 disabled:bg-gray-400 transition-colors font-medium"
                            >
                            Update Review
                            </button>
                            <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-4 py-2 bg-gray-100 text-[#0D3778] rounded-lg hover:bg-gray-400 hover:border-0 transition-colors border-2 border-[#0D3778]"
                            >
                            Cancel
                            </button>
                        </div>
                        </div>
                    ) : (
                        // View Mode
                        <>
                        <div className="flex mr-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                key={star}
                                size={28}
                                className={
                                    star <= review.rate
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-yellow-400'
                                }
                                />
                            ))}
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-3">{review.feedback}</p>
                        <p className="text-sm text-gray-500">{new Date(review.createdAt || " ").toLocaleDateString()}</p>
                        </>
                    )}
                    </div>
                </div>
                </div>
            ))}
            </div>

            {reviews.length === 0 && (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No reviews yet.</p>
            </div>
            )}
        </div>
        </div>

        {deleteTargetId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 animate-scaleIn text-center">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-md md:text-lg lg:text-xl font-semibold text-gray-800 mb-3 text-center">
                            Delete Review
                        </h2>
                        </div>

                    <p className="text-gray-600 mb-6">
                        Are you sure you want to delete this review?  
                        This action cannot be undone.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteTargetId(null)}
                            className="flex-1 px-4 py-2 border-2 border-[#0D3778] text-[#0D3778] rounded-lg hover:bg-gray-100"
                        >
                        Cancel
                        </button>

                        <button
                            onClick={handleDelete}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
            )}

    </Layout>
  );
};

export default MyReviews;
