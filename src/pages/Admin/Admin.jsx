import { useEffect, useState } from "react";
import { supabase } from "../../supabase-client";


import NewPost from "./components/Newpost/NewPost";


import "./Admin.css";

function Admin() {

  // ==================== Auth States ====================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [errorText, setErrorText] = useState("");

// ==================== SESSION MANAGEMENT ====================
  useEffect(() => {

    // Runs once when the component mounts (because of the empty dependency array at the bottom).
    // This is where you set up global authentication awareness.

    //Asks Supabase: “Do I already have a logged-in user?”
    //This checks local storage / cookies, not the network.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      //Stores the current session in React state
      // If the user is already logged in → session is an object
    });

    const {
      data: { subscription }, // Sets up a listener for auth changes
    } = supabase.auth.onAuthStateChange((_event, session) => { // Sets up a listener for auth changes (login, logout, etc)
      setSession(session); // Keeps React state perfectly in sync with Supabase auth
    });

    return () => subscription.unsubscribe();
    // Removes the auth listener when the component unmounts
  }, []);


// ==================== LOGIN ====================
  async function handleLogin(e) {
    e.preventDefault(); // Stops the browser from: Reloading the page
    setErrorText("");

    // Asks Supabase to log in with email & password
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email,
      password,
    });

    
    // If there was an error, show it
    if (error) {
      setErrorText(error.message);
    } else {
      setSession(data.session); // If successful, save the session in React state
    }
  }
 

// ==================== LOGIN SCREEN ====================
  if (!session) {
    return (
      <div className="admin-container">
        <div className="admin-content">
          <AdminLogin email={email} setEmail={setEmail} password={password} setPassword={setPassword} handleLogin={handleLogin} errorText={errorText}/>
        </div>
      </div>
    );
  }

  else if (session) { // If the user is logged in, show the admin dashboard
  // ==================== DASHBOARD ====================
    return (
      <div className="admin-container">
        <div className="admin-content">
          <AdminAccountDashboard />
          <NewPost />

        </div>
      </div>
    );
  }
}

export default Admin;


// ==================== COMPONENTS ====================

// Login form component
function AdminLogin({ email, setEmail, password, setPassword, handleLogin, errorText }) {
  return (
    <div>
     <h1 style={{ textAlign: "center" }}>Login</h1>
          <div className="login-form">
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input type="password" placeholder="Password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />
              </div>
              {errorText && <p className="error-text">{errorText}</p>}
              <button className="login-button" type="submit">Login</button>
            </form>
        </div>
    </div>
  )
};


// Account dashboard component (shown when logged in)
function AdminAccountDashboard() {
  return (
  <div className="admin-account-header">
    <h1>Account</h1>
    <button type="button" className="logout-button"  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
    onClick={async () => { await supabase.auth.signOut();}}
    >
      <ion-icon name="log-out-outline" style={{ fontSize: "1.2rem" }}></ion-icon>
      Logout
    </button>
  </div>
  );
};