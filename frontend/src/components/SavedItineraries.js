import { useState, useEffect } from 'react';
import styles from './SavedItineraries.module.css';
import { API_BASE, adminHeaders } from '../config/api';

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

function ItineraryDayBlocks({ dayByDayInfo }) {
  if (!Array.isArray(dayByDayInfo) || dayByDayInfo.length === 0) {
    return null;
  }
  return (
    <div className={styles.itineraryDays}>
      {dayByDayInfo.map((day, di) => (
        <div key={di} className={styles.dayBlock}>
          <h3 className={styles.dayHeading}>
            Day {day.day != null ? day.day : di + 1}
            {day.title || day.date
              ? ` — ${day.title || day.date}`
              : ''}
          </h3>
          {(day.activities || []).map((sec, si) => (
            <div key={si} className={styles.sectionRow}>
              {sec.time ? (
                <strong className={styles.sectionLabel}>{sec.time}:</strong>
              ) : null}
              <div className={styles.sectionBody}>{sec.activity}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function SavedItineraries() {
  const [trips, setTrips] = useState([]);
  const [editingTrip, setEditingTrip] = useState(null);
  const [error, setError] = useState('');
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;

        if (!userId) {
          setError('User not found. Please log in again.');
          return;
        }

        const admin = user?.role === 'admin';
        setIsAdminView(admin);

        const url = admin
          ? `${API_BASE}/admin/saved-itineraries`
          : `${API_BASE}/saved-itineraries/${userId}`;
        const headers = admin
          ? { 'Content-Type': 'application/json', ...adminHeaders() }
          : {};

        const response = await fetch(url, { headers });
        const data = await response.json();

        if (data.success) {
          const formattedTrips = (data.itineraries || []).map((trip, index) => {
            const ownerLabel =
              admin && trip.owner_display_name
                ? `${trip.owner_display_name} · ${trip.owner_email || ''}`
                : null;
            return {
              id: trip.itinerary_id,
              user_id: trip.user_id,
              destination: trip.destination,
              duration: `${calculateDuration(trip.startDate, trip.endDate)} Days`,
              date: trip.startDate,
              endDate: trip.endDate,
              budget: `$${trip.budget}`,
              day_by_day_info: trip.day_by_day_info,
              activities: formatActivities(trip.day_by_day_info),
              rank: index + 1,
              notes: '',
              ownerLabel,
            };
          });

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
      alert(
        'Sharing is not supported here, so the itinerary text was copied to your clipboard instead.'
      );
    } catch (err) {
      console.error('Share error:', err);
      alert('Unable to share this itinerary right now.');
    }
  };

  const handleRankChange = (id, newRank) => {
    newRank = parseInt(newRank);

    setTrips(prevTrips => {
      // Make a shallow copy
      const tripsCopy = [...prevTrips];

      // Find the trip being moved
      const movedTrip = tripsCopy.find(t => t.id === id);
      if (!movedTrip) return tripsCopy;

      const oldRank = movedTrip.rank;

      // Adjust other trips
      const updatedTrips = tripsCopy.map(t => {
        if (t.id === id) return { ...t, rank: newRank };

        // If trip is between old and new rank, shift it
        if (newRank < oldRank) {
          // Moving up means shift down trips with rank >= newRank && < oldRank
          if (t.rank >= newRank && t.rank < oldRank) {
            return { ...t, rank: t.rank + 1 };
          }
        } else if (newRank > oldRank) {
          // Moving down means shift up trips with rank <= newRank && > oldRank
          if (t.rank <= newRank && t.rank > oldRank) {
            return { ...t, rank: t.rank - 1 };
          }
        }
        return t;
      });

      // Sort by rank before returning
      return updatedTrips.sort((a, b) => a.rank - b.rank);
    });
  };


  const handleRegenerate = async (e) => {
    e.preventDefault();

    const tripId = editingTrip.id;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;


      if (!userId) {
        alert("User not found. Please log in.");
        return;
      }


      const payload = {
        user_id: userId,
        destination: editingTrip.destination,
        startDate: editingTrip.date,
        endDate: editingTrip.endDate,
        budget: editingTrip.budget.replace(/\$/g, '').trim(),
        activities: editingTrip.notes
        
      };

      const response = await fetch(`${API_BASE}/update-itinerary/${editingTrip.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });


      const data = await response.json();


      // check status 
      if (!response.ok) {
        alert(data.message || "Failed to regenerate itinerary.");
        return;
      }


      const newDayInfo = data.itinerary.day_by_day_info;


      // Update the trip in state
      setTrips(prev =>
        prev.map(t =>
          t.id === tripId
            ? {
                ...t,
                destination: payload.destination,
                date: payload.startDate,
                endDate: payload.endDate,
                budget: `$${payload.budget}`,
                day_by_day_info: newDayInfo,
                activities: formatActivities(newDayInfo),
                duration: `${calculateDuration(payload.startDate, payload.endDate)} Days`
              }
            : t
        )
      );


      setEditingTrip(null);


    } catch (err) {
      console.error("Regenerate error:", err);
      alert("Failed to regenerate. Try again.");
    }
  };




  const handleUnsave = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/delete-itinerary/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        // Filter out deleted trip
        let remainingTrips = trips.filter(t => t.id !== id);

        // Re-assign sequential ranks
        remainingTrips = remainingTrips
          .sort((a, b) => a.rank - b.rank) // sort by old rank
          .map((t, i) => ({ ...t, rank: i + 1 }));

        setTrips(remainingTrips);
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
      {isAdminView && (
        <p className={styles.pageSubtitle}>
          Administrator view: showing saved itineraries from all registered users.
        </p>
      )}

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
              {trip.ownerLabel && (
                <p className={styles.ownerLine}>
                  <strong>Saved by:</strong> {trip.ownerLabel}
                </p>
              )}
              <h2>{trip.destination} <span className={styles.dateText}>({trip.date})</span></h2>
              <p>{trip.duration}</p>
              <p>Budget: {trip.budget}</p>
              {Array.isArray(trip.day_by_day_info) && trip.day_by_day_info.length > 0 ? (
                <ItineraryDayBlocks dayByDayInfo={trip.day_by_day_info} />
              ) : (
                <p className={styles.fallbackParagraph}>{trip.activities}</p>
              )}
            </div>

            <div className={styles.actions}>
              <select
                value={trip.rank}
                onChange={(e) => handleRankChange(trip.id, e.target.value)}
              >
                {trips.map((_, i) => (
                  <option key={i} value={i + 1}>
                    Rank {i + 1}
                  </option>
                ))}
              </select>
              <button onClick={() => handleShare(trip)}>Share</button>
              <button onClick={() => setEditingTrip(trip)}>Regenerate</button>
              <button className={styles.unsaveBtn} onClick={() => handleUnsave(trip.id)}>Unsave</button>
            </div>
          </div>
        ))}
      </div>

      {editingTrip && (
        <div className={styles.overlay}>
          <div className={styles.editCard}>
            <h2>Edit {editingTrip.destination} Itinerary</h2>
            <form onSubmit={handleRegenerate} className={styles.editForm}>
              <div className={styles.inputGroup}>
                <label>Destination</label>
                <input
                  value={editingTrip.destination}
                  onChange={e => setEditingTrip({ ...editingTrip, destination: e.target.value })}
                />
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={editingTrip.date}
                    onChange={e => setEditingTrip({ ...editingTrip, date: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>End Date</label>
                  <input
                    type="date"
                    value={editingTrip.endDate}
                    onChange={e => setEditingTrip({ ...editingTrip, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Budget</label>
                <input
                  value={editingTrip.budget}
                  onChange={e => setEditingTrip({ ...editingTrip, budget: e.target.value })}
                />
              </div> 
               
              <div className={styles.inputGroup}>
                <label>Activities</label>
                <textarea
                  value={editingTrip.notes}
                  onChange={e => setEditingTrip({ ...editingTrip, notes: e.target.value })}
                />
              </div>
              
              <div className={styles.modalBtns}>
                <button type="submit" className={styles.saveBtn}>Regenerate</button>
                <button type="button" onClick={() => setEditingTrip(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}