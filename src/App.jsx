// App.jsx
import { useState } from 'react'
// You can remove the viteLogo, reactLogo, and App.css imports if they are no longer needed for the login page
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

// 1. Import your new Login Component
import Login from './Components/Login'

function App() {
  // You can remove the state variable if you don't need it in App anymore
  // const [count, setCount] = useState(0) 

  return (
    // 2. Render the Login instead of the default starter code
    <div className="app-main">
      <Login />
    </div>
    // Note: The surrounding div is for structure, and the component itself contains the main login page logic.
  )
}

export default App