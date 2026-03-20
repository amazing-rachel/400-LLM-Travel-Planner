import { useState, useEffect } from 'react';
import styles from './SavedItineraries.module.css';

function formatActivities(dayByDayInfo) {
  if (!Array.isArray(dayByDayInfo)) return '';

  return dayByDayInfo
    .flatMap(day => day.activities || [])
    .map(item => item.activity)
    .join(', ');
}

function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
}

export default function SavedItineraries() {
  const [trips, setTrips] = useState([]);
  const [editingTrip, setEditingTrip] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;

        if (!userId) {
          setError('User not found. Please log in again.');
          return;
        }

        const response = await fetch(`http://127.0.0.1:5000/saved-itineraries/${userId}`);
        const data = await response.json();

        if (data.success) {
          const formattedTrips = (data.itineraries || []).map((trip, index) => ({
            id: trip.itinerary_id,
            destination: trip.destination,
            duration: `${calculateDuration(trip.startDate, trip.endDate)} Days`,
            date: trip.startDate,
            budget: `$${trip.budget}`,
            activities: formatActivities(trip.day_by_day_info),
            rank: index + 1,
            notes: ''
          }));

          setTrips(formattedTrips);
        } else {
          setError(data.message || 'Failed to load history.');
        }
      } catch (err) {
        console.error('Fetch history error:', err);
        setError('Failed to load saved itineraries.');
      }
    };

    fetchHistory();
  }, []);

  const handleShare = async (trip) => {
    const shareText = `Check out my ${trip.duration} itinerary for ${trip.destination} on ${trip.date}!`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `My Trip to ${trip.destination}`,
          text: shareText,
          url: window.location.href,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      alert("Sharing is not supported here, so the itinerary text was copied to your clipboard instead.");
    } catch (err) {
      console.error("Share error:", err);
      alert("Unable to share this itinerary right now.");
    }
  };

  const handleRankChange = (id, newRank) => {
    const updatedTrips = trips.map(t =>
      t.id === id ? { ...t, rank: parseInt(newRank) } : t
    );
    setTrips(updatedTrips.sort((a, b) => a.rank - b.rank));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://127.0.0.1:5000/update-itinerary/${editingTrip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: editingTrip.destination,
          startDate: editingTrip.date,
          budget: editingTrip.budget.replace('$', ''),
          day_by_day_info: editingTrip.activities
        })
      });

      const data = await response.json();

      if (data.success) {
        const updatedTrips = trips.map(t =>
          t.id === editingTrip.id ? editingTrip : t
        );
        setTrips(updatedTrips);
        setEditingTrip(null);
      } else {
        alert(data.message || 'Failed to save changes.');
      }
    } catch (err) {
      console.error('Update itinerary error:', err);
      alert('Failed to save changes.');
    }
  };

  const handleUnsave = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/delete-itinerary/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setTrips(trips.filter(t => t.id !== id));
      } else {
        alert(data.message || 'Failed to delete itinerary.');
      }
    } catch (err) {
      console.error('Delete itinerary error:', err);
      alert('Failed to delete itinerary.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Saved Itineraries</h1>

      {error && (
        <div style={{
          color: '#D32F2F',
          backgroundColor: '#FFEBEE',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <div className={styles.list}>
        {trips.map((trip) => (
          <div key={trip.id} className={styles.card}>
            <div className={styles.info}>
              <h2>{trip.destination} <span className={styles.dateText}>({trip.date})</span></h2>
              <p><strong>{trip.duration}</strong></p>
              <p><strong>Budget: {trip.budget}</strong></p>
              <p>{trip.activities}</p>
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

      {editingTrip && (
        <div className={styles.overlay}>
          <div className={styles.editCard}>
            <h2>Edit {editingTrip.destination} Itinerary</h2>
            <form onSubmit={handleSaveEdit} className={styles.editForm}>
              <div className={styles.inputGroup}>
                <label>Destination</label>
                <input
                  value={editingTrip.destination}
                  onChange={e => setEditingTrip({ ...editingTrip, destination: e.target.value })}
                />
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>Date</label>
                  <input
                    type="date"
                    value={editingTrip.date}
                    onChange={e => setEditingTrip({ ...editingTrip, date: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Duration</label>
                  <input
                    value={editingTrip.duration}
                    onChange={e => setEditingTrip({ ...editingTrip, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Activities</label>
                <textarea
                  value={editingTrip.activities}
                  onChange={e => setEditingTrip({ ...editingTrip, activities: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Budget</label>
                <input
                  value={editingTrip.budget}
                  onChange={e => setEditingTrip({ ...editingTrip, budget: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Additional Notes</label>
                <textarea
                  value={editingTrip.notes}
                  onChange={e => setEditingTrip({ ...editingTrip, notes: e.target.value })}
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
}