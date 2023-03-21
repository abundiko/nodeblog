const express = require('express');
const app = express.Router();

const DStore = require('../dstore/dstore');

app.use(express.urlencoded({ extended: true }));///

app.get('/', hasSession, (req, res) => {
  const userData = DStore.getDocData('users', req.session.userId);
  res.render('dashboard', {
    userData: userData
    , ...useSessionData(req)
  });
})

app.post('/newPost', hasSession, (req, res) => {
  const formData = req.body;
  console.log(formData);
  if (formData.action != 'newPost') return res.render('login')
  if (formData.title.trim() == '' || formData.body.trim() == '') {
    return res.render('dashboard', {
      error: "Please fill all fields",
      postTitle: formData.title,
      postBody: formData.body,
    })
  }
  const docId = DStore.newDoc('posts', {
    title: formData.title,
    body: formData.body,
    date: Date.now(),
    poster: req.session.uerId
  })
  if (docId != false) return res.render('dashboard', {
    success: "post Uploaded successfully!"
  })
  else return res.render('dashboard', {
    error: "sorry, an error occurred"
  })
})


function hasSession(req, res, next) {
  if (req.session.authorized != undefined && req.session.userId != undefined) {
    next();
  } else res.redirect('/login');
}
function useSessionData(req) {
  return {
    session: req.session
  }
}


module.exports = app;