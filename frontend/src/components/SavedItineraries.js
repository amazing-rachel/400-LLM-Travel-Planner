import { useState } from 'react';
import styles from './SavedItineraries.module.css';

const SavedItineraries = () => {
  // Add backend logic, using temporary mock data for now
  const [itineraries, setItineraries] = useState([
    { 
      id: '101', 
      destination: "Paris", 
      duration: "5 Days", 
      date: "2026-06-12", 
      budget: "$4000-$5000", 
      activities: "Eiffel Tower, Louvre Museum, Seine River Cruise",
      rank: 1, 
      notes: "Focus on art museums." 
    },
    { 
      id: '102', 
      destination: "Tokyo", 
      duration: "7 Days", 
      date: "2026-10-05", 
      budget: "Under $8000", 
      activities: "Shibuya Crossing, Tsukiji Market, Akihabara",
      rank: 2, 
      notes: "Include food tours." 
    },
    { 
      id: '103', 
      destination: "Egypt", 
      duration: "12 Days", 
      date: "2026-12-20", 
      budget: "$5000-$6000", 
      activities: "Great Pyramids of Giza, Sphinx, Nile Cruise",
      rank: 3, 
      notes: "Visit the pyramids."
    }
  ]);

  const [editingTrip, setEditingTrip] = useState(null);

  // Interaction Logic
  const handleShare = async (trip) => {
    try {
      await navigator.share({
        title: `My Trip to ${trip.destination}`,
        text: `Check out my ${trip.duration} itinerary for ${trip.date}!`,
        url: window.location.href,
      });
    } catch (err) {
      alert("Sharing not supported on this browser.");
    }
  };

  const handleRankChange = (id, newRank) => {
    // Add backend logic
    const updated = itineraries.map(t => t.id === id ? { ...t, rank: parseInt(newRank) } : t);
    setItineraries(updated.sort((a, b) => a.rank - b.rank));
  };

  // Editing & Storage
  const handleSaveEdit = (e) => {
    // Add backend logic
    e.preventDefault();
    const updated = itineraries.map(t => t.id === editingTrip.id ? editingTrip : t);
    setItineraries(updated);
    setEditingTrip(null);
  };

  const handleUnsave = (id) => {
    // Add backend logic
    setItineraries(itineraries.filter(t => t.id !== id));
  };

  return (
    // List of Itineraries View 
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Saved Itineraries</h1>
      <div className={styles.list}>
        {itineraries.map((trip) => (
          <div key={trip.id} className={styles.card}>
            <div className={styles.info}>
              <h2>{trip.destination} <span className={styles.dateText}>({trip.date})</span></h2>
              <p>{trip.duration}</p>
              <p>Budget: {trip.budget}</p>
            </div>

            <div className={styles.actions}>
              <select value={trip.rank} onChange={(e) => handleRankChange(trip.id, e.target.value)}>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Rank {n}</option>)}
              </select>
              <button onClick={() => handleShare(trip)}>Share</button>
              <button onClick={() => setEditingTrip(trip)}>Edit Details</button>
              <button className={styles.unsaveBtn} onClick={() => handleUnsave(trip.id)}>Unsave</button>
            </div>
          </div>
        ))}
      </div>

      {/* Editing Trip Details Logic */}
      {editingTrip && (
        <div className={styles.overlay}>
          <div className={styles.editCard}>
            <h2>Edit {editingTrip.destination} Itinerary</h2>
            <form onSubmit={handleSaveEdit} className={styles.editForm}>
              <div className={styles.inputGroup}>
                <label>Destination</label>
                <input 
                  value={editingTrip.destination} 
                  onChange={e => setEditingTrip({...editingTrip, destination: e.target.value})} 
                />
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>Date</label>
                  <input 
                    type="date"
                    value={editingTrip.date} 
                    onChange={e => setEditingTrip({...editingTrip, date: e.target.value})} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Duration</label>
                  <input 
                    value={editingTrip.duration} 
                    onChange={e => setEditingTrip({...editingTrip, duration: e.target.value})} 
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Activities</label>
                <textarea 
                  value={editingTrip.activities} 
                  onChange={e => setEditingTrip({...editingTrip, activities: e.target.value})} 
                  placeholder="e.g. Hiking, Museums, Fine Dining"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Budget</label>
                <input 
                  value={editingTrip.budget} 
                  onChange={e => setEditingTrip({...editingTrip, budget: e.target.value})}
                >
                </input>
              </div>

              <div className={styles.inputGroup}>
                <label>Additional Notes</label>
                <textarea 
                  value={editingTrip.notes} 
                  onChange={e => setEditingTrip({...editingTrip, notes: e.target.value})} 
                />
              </div>

              <div className={styles.modalBtns}>
                <button type="submit" className={styles.saveBtn}>Save Changes</button>
                <button type="button" onClick={() => setEditingTrip(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedItineraries;