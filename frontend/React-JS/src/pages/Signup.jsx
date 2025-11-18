import { Link } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    alert("Account Created! Add API later.");
  };

  return (
    <div className="container">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <input 
          type="text" 
          placeholder="Enter Full Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <input 
          type="email" 
          placeholder="Enter Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input 
          type="password" 
          placeholder="Create Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button type="submit">Signup</button>
      </form>

      <p style={{textAlign:"center", marginTop:10}}>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}
