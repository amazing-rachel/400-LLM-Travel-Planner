import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ItineraryResult.module.css';

function parseDays(itineraryText) {
  const dayBlocks = itineraryText.split(/Day \d+ —/).filter(Boolean);
  return dayBlocks.map((block, index) => {
    const titleMatch = block.match(/\d{4}-\d{2}-\d{2} \((.*)\)/);
    const dayTitle = titleMatch ? titleMatch[1] : '';

    const headings = ["Morning", "Afternoon", "Lunch", "Evening", "Dinner", "Daily total estimate"];
    const sections = [];

    headings.forEach((heading, i) => {
      const regex = new RegExp(`${heading}\\n([\\s\\S]*?)(?=${headings[i + 1]}|$)`, 'm');
      const match = block.match(regex);
      if (match) {
        sections.push({ time: heading, activity: match[1].trim() });
      }
    });

    return { day: `Day ${index + 1}`, title: dayTitle, sections };
  });
}

const ItineraryResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData = location.state;

  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItinerary, setShowItinerary] = useState(false);


  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!tripData || !tripData.itinerary) return;

    const parsed = parseDays(tripData.itinerary);
    setDays(parsed);
    setLoading(false);
  }, [tripData]);

  if (!tripData) {
    return (
      <div className={styles.container}>
        <p>No trip data found. Please start a new trip.</p>
        <button className={styles.goButton} onClick={() => navigate('/trip-input')}>
          ← Go Back
        </button>
      </div>
    );
  }

  const toggleSave = () => {
      setSaved(prev => !prev);
    };


  return (
    <div className={styles.container}>
      <header className={styles.resultsHeader}>
        <h1>Itinerary Results: {tripData.destination}</h1>
      </header>

      {loading && <p>Loading itinerary…</p>}

      <div className={styles.optionsGrid}>
        <div className={styles.optionCard}> {/* ONE WHITE BOX FOR THE CITY */}
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <h3>{tripData.destination}</h3>
              <span className={styles.price}>Budget: ${tripData.budget}</span>
            </div>

            <div className={styles.cardActions}>
              <button
                className={styles.viewDetailsButton}
                onClick={() => setShowItinerary(prev => !prev)}
              >
                {showItinerary ? "Hide Full Daily Plan" : "View Full Daily Plan"}
              </button>

              <button 
                className={saved ? styles.savedButton : styles.saveButton}
                onClick= {toggleSave}
              >
                {saved ? "✓ Saved" : "Save Itinerary"}
              </button>

            </div>

            {showItinerary && (
              <div className={styles.dayContent}>
                {days.map((day) => (
                  <div key={day.day} className={styles.dayCard}>
                    <h4>{day.day} — {day.title}</h4>
                    {day.sections.map((sec, idx) => (
                      <div key={idx} className={styles.activity}>
                        <strong>{sec.time}:</strong> {sec.activity}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.footerNav}>
        <button className={styles.goButton} onClick={() => navigate('/trip-input')}>← Edit Trip</button>
        <button className={styles.goButton} onClick={() => navigate('/saved-itineraries')}>
          View All Saved Trips →
        </button>
      </div>
    </div>
  );
};

export default ItineraryResult;