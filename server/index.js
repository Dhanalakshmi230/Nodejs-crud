const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const UserModel = require('./models/Users'); // Ensure this path is correct
const path = require('path'); // Changed 'Path' to 'path' (proper import)

const app = express();

// Allow requests from http://localhost:5173
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/fileupload')
  .then(() => {
      console.log('Connected to MongoDB');
  })
  .catch((err) => {
      console.error('Failed to connect to MongoDB', err);
  });

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './public/Images');
  },
  filename: function (req, file, cb) {
      cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname)); // Corrected 'fieldname'
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('file');

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(500).send('Multer error occurred');
    } else if (err) {
      console.error('Unknown error:', err);
      return res.status(500).send('An unknown error occurred');
    }

    if (!req.file) {
      console.error('No file received');
      return res.status(400).send('No file received');
    }

    console.log('File received:', req.file);

    UserModel.create({ image: req.file.filename })
      .then(result => {
        console.log('File saved to database:', result);
        res.json(result);
      })
      .catch(err => {
        console.error('Error saving to database:', err);
        res.status(500).send('Error saving to database');
      });
  });
});


// Start the server
app.listen(3001, () => {
  console.log('Server is Running on port 3001');
});





// app.get('/', (req, res) => {
//     UserModel.find({})
//         .then(users => res.json(users))
//         .catch(err => res.json(err));
// })
// app.get('/getUser/:id', (req, res) => {
//     const id = req.params.id
//     UserModel.findById({_id:id})
//     .then(users => res.json(users))
//     .catch(err => res.json(err));
// })
// app.delete('/deleteUser/:id', (req, res) => {
//     const id = req.params.id;
//     UserModel.findByIdAndDelete(id)
//         .then(deletedUser => {
//             if (!deletedUser) {
//                 return res.status(404).json({ message: 'User not found' });
//             }
//             res.json({ message: 'User deleted successfully' });
//         })
//         .catch(err => res.status(500).json({ message: err.message }));
// });

// app.post("/createUser", (req, res) => {
//     UserModel.create(req.body)
//         .then(users => res.json(users))
//         .catch(err => res.json(err));
// });
// app.put("/updateUser/:id", (req, res) => {
//     const id = req.params.id;
//     UserModel.findByIdAndUpdate(id, {  // Changed from { _id: id } to id
//         name: req.body.name,
//         email: req.body.email,
//         age: req.body.age
//     })
//     .then(updatedUser => res.json(updatedUser))
//     .catch(err => res.status(500).json({ error: err.message }));
// });


