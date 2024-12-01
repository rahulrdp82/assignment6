import React, { useState } from 'react';
import FileUpload from './FileUpload';
import Streamgraph from './Streamgraph';
import './App.css';

const App = () => {
  const [data, setData] = useState(null); // Store parsed data in state

  // Function to receive and store the data
  const handleData = (newData) => {
    setData(newData); // Update state with new data
  };

  return (
    <div>
     
      <FileUpload set_data={handleData} />  {/* Pass handleData as prop */}
      {data && <Streamgraph data={data} />}  {/* Render Streamgraph when data is available */}
    </div>
  );
};

export default App;
