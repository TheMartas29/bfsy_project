import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ShoppingListDetail from "./ShoppingListDetail";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="container">
        <h1>Shopping List App</h1>

        <nav>
          <Link to="/list/1">Show detail</Link>
        </nav>

        <Routes>
          <Route path="/list/:id" element={<ShoppingListDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;