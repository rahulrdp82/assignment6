import React, { useState } from 'react';
import FileUpload from './FileUpload';
import Streamgraph from './Streamgraph';
import './App.css';

const App = () => {
  const [data, setData] = useState(null); 

 
  const handleData = (newData) => {
    setData(newData); 
  };

  return (
    <div>
     
      <FileUpload set_data={handleData} />  
      {data && <Streamgraph data={data} />}
    </div>
  );
};

export default App;
