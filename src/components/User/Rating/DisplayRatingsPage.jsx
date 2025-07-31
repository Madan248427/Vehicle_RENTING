// MyReviews.js
"use client"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import { useUser } from "@clerk/clerk-react"
import { Star } from "lucide-react"
import "./my-reviews.css"
import Sidebar from "../Sidebar/sidebar"


export default function MyReviews() {
  const { user, isLoaded } = useUser()
  const [myRatings, setMyRatings] = useState([])
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchUserRatings = async () => {
      if (!user) return
      setLoading(true)
      try {
        const ratingsRef = collection(db, "ratings")
        const q = query(ratingsRef, where("userId", "==", user.id))
        const querySnapshot = await getDocs(q)
        const fetched = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }))
        setMyRatings(fetched)
      } catch (err) {
        console.error("Failed to fetch ratings", err)
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded) {
      fetchUserRatings()
    }
  }, [isLoaded, user])

  const handleEdit = (review) => {
    setEditingReviewId(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment)
    setMessage("")
  }

  const handleUpdate = async () => {
    if (!editRating || !editComment.trim()) {
      setMessage("Rating and comment are required.")
      return
    }

    try {
      const docRef = doc(db, "ratings", editingReviewId)
      await updateDoc(docRef, {
        rating: editRating,
        comment: editComment.trim(),
      })

      setMyRatings((prev) =>
        prev.map((r) =>
          r.id === editingReviewId ? { ...r, rating: editRating, comment: editComment } : r
        )
      )

      setEditingReviewId(null)
      setEditRating(0)
      setEditComment("")
      setMessage("Review updated successfully.")
    } catch (err) {
      console.error("Update failed", err)
      setMessage("Failed to update review.")
    }
  }

  if (loading) return <p className="loading">Loading your reviews...</p>
  if (!myRatings.length) return <p className="no-reviews">You haven't submitted any reviews yet.</p>

  return (
    <>
    <Sidebar/>
    <div className="my-reviews-page">
      <h2>My Reviews</h2>
      {message && <p className="message">{message}</p>}
      {myRatings.map((review) => (
        <div key={review.id} className="review-card">
          <p><strong>Vehicle ID:</strong> {review.vehicleId}</p>
          <p><strong>Date:</strong> {review.createdAt?.toLocaleDateString()}</p>

          {editingReviewId === review.id ? (
            <>
              <div className="star-input">
                <label>Edit Rating:</label>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={`star-icon ${star <= editRating ? "filled" : ""}`}
                    onClick={() => setEditRating(star)}
                  />
                ))}
              </div>
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Edit your comment..."
              ></textarea>
              <div className="edit-buttons">
                <button className="btn btn-save" onClick={handleUpdate}>Save</button>
                <button className="btn btn-cancel" onClick={() => setEditingReviewId(null)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div className="rating-display">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={`star-icon ${i < review.rating ? "filled" : ""}`} />
                ))}
              </div>
              <p><strong>Comment:</strong> {review.comment}</p>
              <button className="btn btn-edit" onClick={() => handleEdit(review)}>Edit</button>
            </>
          )}
        </div>
      ))}
    </div>
    </>
  )
}
