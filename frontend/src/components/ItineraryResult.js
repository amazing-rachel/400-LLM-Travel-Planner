import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ItineraryResult.module.css';

const ItineraryResult = () => {
  const navigate = useNavigate();
  
  // Temporary mock data (remove when backend stuff added)
  const [options, setOptions] = useState([
    {
      id: 'option_1',
      title: "Japan",
      description: "Informative, Educational, & Relaxing",
      priceEstimate: "$1,800",
      saved: false
    },
    {
      id: 'option_2',
      title: "New York City",
      description: "Exciting, High Energy, Thrilling",
      priceEstimate: "$2,400",
      saved: false
    },
    {
      id: 'option_3',
      title: "Peru",
      description: "Adventurous, Scenic, Breathtaking",
      priceEstimate: "$2,100",
      saved: false
    }
  ]);

  const toggleSave = (id) => {
    setOptions(options.map(opt => {
      if (opt.id === id) {
        const newState = !opt.saved;
        if (newState) {
          // Backend stuff
        } else {
          // Backend stuff
        }
        return { ...opt, saved: newState };
      }
      return opt;
    }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.resultsHeader}>
        <h1>Itinerary Results</h1>
      </header>

      <div className={styles.optionsGrid}>
        {options.map((option) => (
          <div key={option.id} className={`${styles.optionCard} ${option.saved ? styles.savedCard : ''}`}>
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <h3>{option.title}</h3>
                <span className={styles.price}>{option.priceEstimate}</span>
              </div>
              <p>{option.description}</p>
            </div>
            
            <div className={styles.cardActions}>
              <button className={styles.viewDetailsButton}>View Full Daily Plan</button>
              <button 
                className={option.saved ? styles.savedButton : styles.saveButton}
                onClick={() => toggleSave(option.id)}
              >
                {option.saved ? "✓ Saved" : "Save Itinerary"}
              </button>
            </div>
          </div>
        ))}
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