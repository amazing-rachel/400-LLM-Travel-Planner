import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ItineraryResult.module.css';

function parseDays(itineraryText) {
  let text = typeof itineraryText === 'string' ? itineraryText : '';
  text = text.replace(/^\s*:\s*/, '').trim();
  const dayBlocks = text.split(/Day\s+\d+\s*[—–-]\s*/).filter(Boolean);
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

/** Flask backend returns JSON: { day_by_day_info: [{ day, date, title, activities: [{time, activity}] }] } */
function parseStructuredItinerary(itineraryObj) {
  if (!itineraryObj || typeof itineraryObj !== 'object') {
    return [];
  }
  const days = itineraryObj.day_by_day_info;
  if (!Array.isArray(days)) {
    return [];
  }
  const mapped = days.map((d, index) => ({
    day: `Day ${d.day != null ? d.day : index + 1}`,
    title: d.title || d.date || '',
    sections: (d.activities || []).map((a) => ({
      time: a.time || '',
      activity: (a.activity || '').replace(/^\s*:\s*/, '').trim(),
    })),
  }));

  /* Legacy: one blob from old backend — re-parse with same rules as plain-text LLM */
  if (
    mapped.length === 1 &&
    mapped[0].sections.length === 1 &&
    (!mapped[0].sections[0].time || mapped[0].sections[0].time === '') &&
    (mapped[0].sections[0].activity || '').length > 120
  ) {
    const blob = mapped[0].sections[0].activity;
    if (/Day\s+\d+\s*[—–-]/i.test(blob)) {
      return parseDays(blob);
    }
  }
  return mapped;
}

const ItineraryResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData = location.state;

  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItinerary, setShowItinerary] = useState(false);


  

  useEffect(() => {
    if (!tripData) {
      setLoading(false);
      return;
    }
    const raw = tripData.itinerary;
    if (raw == null) {
      setDays([]);
      setLoading(false);
      return;
    }
    if (typeof raw === 'string') {
      setDays(parseDays(raw));
    } else if (typeof raw === 'object') {
      setDays(parseStructuredItinerary(raw));
    } else {
      setDays([]);
    }
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

              

            </div>

            {showItinerary && (
              <div className={styles.dayContent}>
                {days.map((day) => (
                  <div key={day.day} className={styles.dayCard}>
                    <h4>{day.day} — {day.title}</h4>
                    {day.sections.map((sec, idx) => (
                      <div key={idx} className={styles.activity}>
                        {sec.time ? (
                          <strong className={styles.sectionLabel}>{sec.time}:</strong>
                        ) : null}
                        <div className={styles.activityBody}>{sec.activity}</div>
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