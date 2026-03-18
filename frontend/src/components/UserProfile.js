import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './UserProfile.module.css';

const UserProfile = () => {
  const { user } = useAuth(); 
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
        consent: user.consent || false
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Backend stuff can be added here, user should have the same consent setting from consent page
    console.log("API CALL: PUT /api/users/profile", formData);
    
    alert("Profile and consent settings updated!");
    setIsEditing(false); 
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
              Edit Information
            </button>
          </div>
        ) : (
          /* Edit Profile */
          <form onSubmit={handleSave} className={styles.editForm}>
            <div className={styles.sectionHeader}>Edit Details</div>
            <div className={styles.inputGroup}>
              <label>First Name</label>
              <input 
                type="text" 
                value={formData.firstName} 
                onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Last Name</label>
              <input 
                type="text" 
                value={formData.lastName} 
                onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

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