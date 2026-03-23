import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './UserProfile.module.css';

const UserProfile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
 
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    consent: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        consent: user.consent ?? false,
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
   
    try {
      const response = await fetch(`http://localhost:5000/api/consent/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent_given: formData.consent }),
      });

      if (!response.ok) throw new Error('Failed to update consent');

      const data = await response.json();

      const updatedConsent = Boolean(data.consent_given); // <- directly from response

      // Update local state
      setFormData(prev => ({ ...prev, consent: updatedConsent }));

      // Update context + localStorage so it persists after refresh
      setUser(prev => {
        const updatedUser = { ...prev, consent: updatedConsent };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });

      setIsEditing(false);
      alert('Consent settings updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error updating consent. Please try again.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>My Profile</h1>

      <div className={styles.profileCard}>
        {!isEditing ? (
          /* View Profile */
          <div className={styles.viewMode}>
            <div className={styles.sectionHeader}>Personal Details</div>
            <div className={styles.infoGroup}>
              <label>Name:</label>
              <p>{formData.firstName} {formData.lastName}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Email:</label>
              <p>{formData.email}</p>
            </div>

            <div className={styles.sectionHeader}>Generative AI Usage & Data Consent</div>
            <div className={styles.infoGroup}>
              <p className={formData.consent ? styles.statusEnabled : styles.statusDisabled}>
                {formData.consent
                  ? "✔ You have consented to saving past travel preferences to improve future itineraries."
                  : "✖ You have not consented to saving past travel preferences."}
              </p>
            </div>
           
            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
              Edit Consent Status
            </button>
          </div>
        ) : (
          /* Edit Profile */
          
          <form onSubmit={handleSave} className={styles.editForm}>
            
            {/* Change Consent */}
            <div className={styles.sectionHeader}>Privacy Preferences</div>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="consent"
                checked={formData.consent}
                onChange={(e) => setFormData({...formData, consent: e.target.checked})}
              />
              <label htmlFor="consent">
                Allow the system to save my travel activity preferences to generate better itineraries in the future.
              </label>
            </div>

            <div className={styles.actionBtns}>
              <button type="submit" className={styles.saveBtn}>Save Changes</button>
              <button type="button" className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;