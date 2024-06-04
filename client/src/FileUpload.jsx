import React, { useState, useRef } from 'react';
import axios from 'axios';
import images from "../src/assets/images.png";
import './FileUpload.css'
export default function FileUpload() {
    const [file, setFile] = useState([]);
    const [uploadFiles, setUploadFiles] = useState([]);
    const [showProgress, setShowProgress] = useState(false);
    const [replaceFileId, setReplaceFileId] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileInputClick = () => {
        fileInputRef.current.click();
    };

    const fetchFiles = () => {
        axios.get('http://localhost:3001/files')
            .then(res => setUploadFiles(res.data))
            .catch(err => console.error('Error fetching files:', err));
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

        const url = replaceFileId
            ? `http://localhost:3001/upload/${replaceFileId}`
            : 'http://localhost:3001/upload';

        axios.post(url, formData, {
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
                    fetchFiles(); // Refresh the file list after upload
                    setReplaceFileId(null);
                }
            }
        });
    };

    const deleteFile = (id) => {
        axios.delete(`http://localhost:3001/files/${id}`)
            .then(() => {
                setUploadFiles(uploadFiles.filter(file => file._id !== id));
            })
            .catch(err => console.error('Error deleting file:', err));
    };

    const replaceFile = (id) => {
        setReplaceFileId(id);
        handleFileInputClick();
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
                                <div className='details '>
                                    <div className='d-flex'>
                                        <span className='name'>{file.image}</span>
                                        <div className="d-flex justify-content-end ms-auto">
                                            <span >
                                                <button className='btn btn-primary' onClick={() => replaceFile(file._id)}>Replace File</button>
                                            </span>
                                            <span >
                                                <button className='btn btn-danger' onClick={() => deleteFile(file._id)}>Delete</button>
                                            </span>
                                        </div>
                                    </div>
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
