const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('../database');

const port = process.env.USER_INFO_PORT || 4007;

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

app.post('/api/getUserData', (req, res) => {
  pool.query('SELECT * FROM users WHERE userId=?', [req.body.userId], function(
    err,
    results
  ) {
    if (results.length === 0) {
      console.log(err);
      return res.send({
        valid: false,
        err: 'That userId is not available'
      });
    }
    return res.send({
      valid: true,
      email: results[0].email,
      username: results[0].username,
      completedSwaps: results[0].completedSwaps,
      rating: results[0].rating,
      totalRating: results[0].totalRating,
      favoriteCategories: results[0].favoriteCategories,
      interests: results[0].interests
    });
  });
});

app.post('/api/updateUserData', (req, res) => {
  pool.query(
    'UPDATE users SET email=?, interests=?, favoriteCategories=? WHERE userId=?',
    [
      req.body.email,
      req.body.interests,
      req.body.favoriteCategories,
      req.body.userId
    ],
    function(err, results) {
      if (err) {
        return res.send({
          valid: false,
          err: 'An error has occured'
        });
      }

      if (results.length === 0) {
        return res.send({
          valid: false,
          err: 'That userId is not available'
        });
      }
      return res.send({
        valid: true
      });
    }
  );
});

app.listen(port, console.log('User Info service running.'));
