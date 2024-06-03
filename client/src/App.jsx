import React, { useState, useRef } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import images from "../src/assets/images.png";

function App() {
  const [file, setFile] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const uploadFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const filename = file.name.length > 12
      ? `${file.name.substring(0, 13)}... .${file.name.split('.').pop()}`
      : file.name;

    const formData = new FormData();
    formData.append("file", file);
    setFile(prevState => [...prevState, { name: filename, loading: 0 }]);
    setShowProgress(true);

    axios.post('http://localhost:3001/upload', formData, {
      onUploadProgress: ({ loaded, total }) => {
        setFile(prevState => {
          const newFiles = [...prevState];
          newFiles[newFiles.length - 1].loading = Math.floor((loaded / total) * 100);
          return newFiles;
        });

        if (loaded === total) {
          const filesize = total < 1024
            ? `${total} KB`
            : `${(loaded / (1024 * 1024)).toFixed(2)} MB`;
          setUploadFiles([...uploadFiles, { name: filename, size: filesize }]);
          setFile([]);
          setShowProgress(false);
        }
      }
    });
  };

  return (
    <div className='upload-box'>
      <p>Upload your file</p>
      <form>
        <input
          type='file'
          className='file-input'
          hidden
          ref={fileInputRef}
          onChange={uploadFile}
        />
        <div className='icon' onClick={handleFileInputClick}>
          <img src={images} alt="Upload Icon" />
        </div>
        <p>Browse File to upload</p>
      </form>
      {showProgress && (
        <section className='loading-area'>
          <ul>
            {file.map((fileItem, index) => (
              <li key={index} className='row'>
                <i className='fas fa-file-alt'></i>
                <div className='content'>
                  <div className='details'>
                    <div className='name'>
                      {`${fileItem.name} - uploading`}
                    </div>
                    <div className='percent'>
                      {`${fileItem.loading}%`}
                    </div>
                    <div className='loading-bar'>
                      <div
                        className='loading'
                        style={{ width: `${fileItem.loading}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className='uploaded-area'>
        <ul>
          {uploadFiles.map((file, index) => (
            <li key={index} className='row'>
              <div className='content upload'>
                <i className='fas fa-file-alt'></i>
                <div className='details'>
                  <span className='name'>{file.name}</span>
                  <span className='size'>{file.size}</span>
                </div>
              </div>
              <i className='fas fa-check'></i>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
