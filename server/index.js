const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const UserModel = require('./models/Users');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/fileupload')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/Images');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
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

app.post('/upload/:id', (req, res) => {
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

    UserModel.findById(req.params.id)
      .then(file => {
        if (!file) {
          return res.status(404).send('File not found');
        }

        const oldFilePath = path.join(__dirname, 'public', 'Images', file.image);
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error('Error deleting old file from filesystem:', err);
            return res.status(500).send('Error deleting old file from filesystem');
          }

          file.image = req.file.filename;
          file.save()
            .then(updatedFile => {
              console.log('File replaced in database:', updatedFile);
              res.json(updatedFile);
            })
            .catch(err => {
              console.error('Error saving updated file to database:', err);
              res.status(500).send('Error saving updated file to database');
            });
        });
      })
      .catch(err => {
        console.error('Error finding file:', err);
        res.status(500).send('Error finding file');
      });
  });
});

app.get('/files', (req, res) => {
  UserModel.find()
    .then(files => res.json(files))
    .catch(err => {
      console.error('Error retrieving files:', err);
      res.status(500).send('Error retrieving files');
    });
});

app.delete('/files/:id', (req, res) => {
  UserModel.findByIdAndDelete(req.params.id)
    .then(file => {
      if (!file) {
        return res.status(404).send('File not found');
      }
      const filePath = path.join(__dirname, 'public', 'Images', file.image);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file from filesystem:', err);
          return res.status(500).send('Error deleting file from filesystem');
        }
        res.json({ message: 'File deleted successfully' });
      });
    })
    .catch(err => {
      console.error('Error deleting file:', err);
      res.status(500).send('Error deleting file');
    });
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});






app.get('/', (req, res) => {
    UserModel.find({})
        .then(users => res.json(users))
        .catch(err => res.json(err));
})
app.get('/getUser/:id', (req, res) => {
    const id = req.params.id
    UserModel.findById({_id:id})
    .then(users => res.json(users))
    .catch(err => res.json(err));
})
app.delete('/deleteUser/:id', (req, res) => {
    const id = req.params.id;
    UserModel.findByIdAndDelete(id)
        .then(deletedUser => {
            if (!deletedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: 'User deleted successfully' });
        })
        .catch(err => res.status(500).json({ message: err.message }));
});

app.post("/createUser", (req, res) => {
    UserModel.create(req.body)
        .then(users => res.json(users))
        .catch(err => res.json(err));
});
app.put("/updateUser/:id", (req, res) => {
    const id = req.params.id;
    UserModel.findByIdAndUpdate(id, {  // Changed from { _id: id } to id
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    })
    .then(updatedUser => res.json(updatedUser))
    .catch(err => res.status(500).json({ error: err.message }));
});


