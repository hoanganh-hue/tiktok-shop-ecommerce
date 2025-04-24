import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import các layout và pages sẽ được thêm sau

function App() {
  return (
    <Router>
      <Routes>
        {/* Các routes sẽ được thêm sau */}
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </Router>
  );
}

export default App;
