import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ShoppingListOverview from "./ShoppingListOverview";
import ShoppingListDetail from "./ShoppingListDetail";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="app-root">
        <Routes>
          <Route path="/" element={<ShoppingListOverview />} />
          <Route path="/list/:id" element={<ShoppingListDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;