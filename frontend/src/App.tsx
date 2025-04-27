import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Link, Route, Routes } from 'react-router-dom'

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Appointments from './pages/Appointments'
import Calls from './pages/Calls'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Simulation from './pages/Simulation'
import { app } from './lib/firebase'

function Demo() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <h1 className="text-3xl font-bold underline">
          this line should be large and have bold and underline
        </h1>
        <div className="flex flex-col items-center justify-center min-h-svh">
          <Button>Click me</Button>

          <Button variant="secondary">Secondary</Button>

        </div>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="link">Link</Button>

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

function Home() {
  return (
    <div>
      <h1>This is the home page</h1>
      <Link to="about">Click to view our about page</Link>
      <Link to="contact">Click to view our contact page</Link>
      <div className="flex flex-col items-center justify-center">
        <Button asChild>
          <Link to="appointments">appointments</Link>
        </Button>
        <Button asChild>
          <Link to="calls">calls</Link>
        </Button>
        <Button asChild>
          <Link to="customers">customers</Link>
        </Button>
        <Button asChild>
          <Link to="dashboard">dashboard</Link>
        </Button>
        <Button asChild>
          <Link to="orders">orders</Link>
        </Button>
        <Button asChild>
          <Link to="simulation">simulation</Link>
        </Button>
      </div>
      <Demo />
    </div>
  );
}

function About() {
    return (
        <div>
            <h1>This is the about page</h1>
        </div>
    )
}

function Contact() {
    return (
        <div>
            <h1>This is the contact page</h1>
        </div>
    )
}

function App() {

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={ <Home/> } />
        <Route path="about" element={ <About/> } />
        <Route path="contact" element={ <Contact/> } />
        <Route path="appointments" element={ <Appointments/> } />
        <Route path="calls" element={ <Calls/> } />
        <Route path="customers" element={ <Customers/> } />
        <Route path="dashboard" element={ <Dashboard/> } />
        <Route path="orders" element={ <Orders/> } />
        <Route path="simulation" element={ <Simulation/> } />
      </Routes>
    </div>
  )
}

export default App
