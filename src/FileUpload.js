import React, { Component } from 'react';

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      jsonData: null,  // State to store the parsed data
    };
  }

  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const json = this.csvToJson(text);
        this.setState({ jsonData: json });  // Set JSON data in state
        this.props.set_data(json); // Call the set_data function passed from App.js
      };
      reader.readAsText(file);
    }
  };

  // Convert CSV to JSON format
  csvToJson = (csv) => {
    const lines = csv.split("\n");  // Split by newline for rows
    const headers = lines[0].split(",");  // First line for headers
    const result = [];

    // Loop through each line after headers
    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(",");  // Split by comma for columns
      const obj = {};

      // Map each column value to the corresponding header
      headers.forEach((header, index) => {
        obj[header.trim()] = currentLine[index]?.trim();  // Trim spaces
      });

      // If row is not empty, convert data types and add it to result
      if (Object.keys(obj).length && lines[i].trim()) {
        const parsedObj = {
          Date: new Date(obj.Date),  // Parse the date
          'GPT-4': parseInt(obj['GPT-4'], 10),
          Gemini: parseInt(obj.Gemini, 10),
          'PaLM-2': parseInt(obj['PaLM-2'], 10),
          Claude: parseInt(obj.Claude, 10),
          'LLaMA-3.1': parseInt(obj['LLaMA-3.1'], 10),
        };
        result.push(parsedObj);
      }
    }

    return result;
  };

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 20 }}>
        <h2>Upload a CSV File for Visualization</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input 
            type="file" 
            accept=".csv" 
            onChange={(event) => this.setState({ file: event.target.files[0] })}
          />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;
