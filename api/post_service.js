const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('../database');
const fs = require('fs');
const path = require('path');

const port = process.env.POST_PORT || 4002;

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/uploads', express.static(__dirname + '../uploads'));
app.use(express.static(__dirname + '/uploads'));

//Post function to make an upload item request to the database
app.post('/api/post', (req, res) => {
  if (req.files === null)
    return res.status(400).send({ err: 'No image provided.' });

  const file = req.files.file;

  file.mv(
    `${__dirname}/../uploads/post_images/${file.name}`,
    err => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
    },
    err => {
      if (err) {
        return console.log(err);
      }
    }
  );
  pool.query(
    'INSERT INTO posts SET ?',
    {
      userId: req.body.userId,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      filename: `${file.name}`
    },
    (err, insertedRecord) => {
      if (err) {
        return res.send({
          valid: false,
          err: 'Something went wrong when posting your swap! Please try again.'
        });
      }
      return res.send({
        valid: true
      });
    }
  );
});

app.get('/api/getPost', (req, res) => {
  pool.query(
    'SELECT * FROM posts WHERE postId = ?',
    [req.query.postId],
    (err, result) => {
      if (err || result.length == 0) {
        return res.send({
          valid: false,
          err: err || 'Could not fetch post with given ID.'
        });
      }

      return res.send({
        valid: true,
        result: result
      });
    }
  );
});

app.get('/api/getUserPosts', (req, res) => {
  pool.query(
    'SELECT * FROM posts where userId = ?',
    [req.query.userId],
    (err, result) => {
      if (err || result.length == 0) {
        return res.send({
          valid: false,
          err: err || 'Could not fetch post with given user ID.'
        });
      }

      return res.send({
        valid: true,
        result: result
      });
    }
  );
});

app.get('/api/deletePost', (req, res) => {
  const filename = req.query.filename;
  fs.unlink(`${__dirname}/../uploads/post_images/${filename}`, err => {
    if (err) {
      console.log(err);
    }
  });

  pool.query(
    'DELETE FROM posts WHERE postId = ?',
    [req.query.postId],
    (err, result) => {
      if (err) {
        return res.send({
          valid: false,
          err: err || 'Error deleting post'
        });
      }

      console.log(result);

      return res.send({
        valid: true
      });
    }
  );
});

app.post('/api/updateSwap', (req, res) => {
  if (req.files === null) {
    pool.query(
      'UPDATE posts SET title = ?, description = ?, category = ? WHERE postId = ?',
      [
        req.body.title,
        req.body.description,
        req.body.category,
        req.body.postId
      ],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.send({
            valid: false,
            err: 'An error occured update selected post'
          });
        }
      }
    );
  } else {
    const filename = req.body.currentImage;
    fs.unlink(`${__dirname}/../uploads/post_images/${filename}`, err => {
      if (err) {
        console.log(err);
      }
    });

    const file = req.files.file;

    file.mv(
      `${__dirname}/../uploads/post_images/${file.name}`,
      err => {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }
      },
      err => {
        if (err) {
          return console.log(err);
        }
      }
    );

    pool.query(
      'UPDATE posts SET filename = ?, title = ?, description = ?, category = ? WHERE postId = ?',
      [
        `${file.name}`,
        req.body.title,
        req.body.description,
        req.body.category,
        req.body.postId
      ],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.send({
            valid: false,
            err: 'An error occured update selected post'
          });
        }
      }
    );
  }
});

app.post('/api/getPosterInfo', (req, res) => {
  pool.query(
    'SELECT * FROM users WHERE userId=?',
    [req.body.userId],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.send({
          valid: false,
          err: "That email doesn't have an account associated with it."
        });
      }
      if (result.length == 0) {
        console.log('Invalid userId passed to endpoint.');
        return res.send({
          valid: false,
          err: 'Invalid userId passed to endpoint.'
        });
      }
      res.send({
        valid: true,
        email: result[0].email,
        rating: result[0].rating,
        username: result[0].username,
        completedSwaps: result[0].completedSwaps
      });
    }
  );
});

app.listen(port, console.log('Post service running.'));
