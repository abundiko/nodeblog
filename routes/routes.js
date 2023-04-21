const express = require('express');
const expressFile = require('express-fileupload')
const uuid = require('uuid')
const router = express.Router();
const bcrypt = require('bcrypt');
const fs = require('fs');

const DStore = require('../dstore/dstore');

router.use(expressFile())
router.use(express.urlencoded({ extended: true }));/// to access form data
const sessions = require('express-session');
router.use(sessions(
  {
    name: "nodeblog_session",
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
      sameSite: false,
      maxAge: (1000 * 60 * 60 * 24)//24hrs

    }
  }
));
router.use(logger);

let messages = {};

router.route('/posts')
  .get((req, res) => {
    const docs = DStore.getAllDocs('posts');
    let data = [];
    docs.forEach(doc => {
      const individualData = DStore.getDocData('posts', doc);
      const posterData = DStore.getDocData('users', individualData.poster)
      let itemData = {
        uid: individualData.uid,
        title: individualData.title,
        photo: individualData.photo,
        date: Date(individualData.date).substring(0, 21),
        poster: {
          name: posterData.username,
          initial: posterData.username.split('')[0]
        }
      }
      data.push(itemData)
    });
    res.render("posts", { data: data, ...useSessionData(req) });
  });

router.route('/posts/:any')
  .get((req, res) => {
    const postId = req.params.any;
    const docData = DStore.docDataMatches('posts', 'uid', postId);
    if (docData) {
      const posterData = DStore.getDocData('users', docData.poster);
      let itemData = {
        uid: docData.uid,
        title: docData.title,
        photo: docData.photo,
        body: [...docData.body.split('\n')],
        date: Date(docData.date).substring(0, 21),
        comments: [...docData.comments].reverse(),
        poster: {
          uid: posterData.uid,
          name: posterData.username,
          initial: posterData.username.split('')[0]
        }
      }

      res.render('post', {
        ...useSessionData(req),
        data: itemData,
      });
    } else return res.redirect('/posts')
  }).post((req, res) => {
    const formData = req.body;
    if (!isLoggedIn(req)) return res.redirect('/login');
    const postId = req.params.any;
    const docData = DStore.docDataMatches('posts', 'uid', postId);
    let oldComments = []
    if (docData.comments) oldComments = [...docData.comments]
    if (docData) {
      const userData = DStore.getDocData('users', req.session.userId);
      oldComments.push({
        name: userData.username,
        date: Date(Date.now()).substring(0, 21),
        comment: String(formData.comment),
        index: oldComments.length,
        uid: userData.uid
      })
      DStore.updateDataField('posts', docData.uid, 'comments', oldComments)
      res.redirect('/posts/' + req.params.any);

    } else return res.redirect('/posts')
  })

router.get('/posts/:any/delete/:id', (req, res) => {
  if (!isLoggedIn(req)) return res.redirect('/login')
  const postId = req.params.any;
  const commentId = req.params.id;
  const postData = DStore.docDataMatches('posts', 'uid', postId)
  if (!postData) return res.redirect('/posts')
  const oldComments = postData.comments;
  oldComments.splice(commentId, 1)
  DStore.updateDataField('posts', postId, 'comments', oldComments);
  return res.redirect('/posts/' + postId)
})

router.route('/login')
  .get((req, res) => {
    console.log(__dirname);
    if (isLoggedIn(req))
      res.redirect('dashboard')
    else
      res.render('login')
  })
  .post(async (req, res) => {
  
  const tryDoc = DStore.newDoc('users');
  return res.render('login', {
        error: tryDoc,
        email: formData.email,
        password: formData.password,
      });
  
  
    const formData = req.body;
    if (formData.action == 'login') {
      let docData = DStore.docDataMatches('users', 'email', formData.email);
      if (docData == false) return res.render('login', {
        error: "You do not have an account",
        email: formData.email,
        password: formData.password,
      });
      const passwordMatches = await bcrypt.compare(formData.password, docData.password);
      if (!passwordMatches) return res.render('login', {
        error: "Incorrect password",
        email: formData.email,
        password: formData.password,
      });
      // res.cookie('nodeblog_uid', docData.uid, { secure: true, sameSite: true });
      req.session.userId = docData.uid;
      req.session.authorized = true;

      res.redirect('/dashboard');

    } else {
      res.redirect('/login');
    }
  })

router.route('/signup')
  .get((req, res) => {
    if (isLoggedIn(req)) return res.redirect('dashboard');
    res.render('signup')
  })
  .post(async (req, res) => {
    const formData = req.body;
    if (formData.action == 'signup') {
      if (DStore.docDataMatches('users', 'email', formData.email)) return res.render('signup', {
        email: formData.email,
        password: formData.password,
        error: "Account exists with email: " + formData.email,
      });
      if (DStore.docDataMatches('users', 'username', formData.username)) return res.render('signup', {
        email: formData.email,
        password: formData.password,
        error: "Account exists with username: " + formData.username,
      });
      if (formData.password.length < 6) {
        res.render('signup', {
          email: formData.email,
          password: formData.password,
          error: "Password must be up to 6 characters",
        });
        return;
      }
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      DStore.newDoc('users', {
        "username": formData.username,
        "email": formData.email,
        "password": hashedPassword,
      });
      res.render('signup', {
        success: "Your Account was Successfully created"
      })
    } else {
      res.redirect('/signup');
    }
  })

router.get('/dashboard', hasSession, (req, res) => {
  const docs = DStore.getAllDocsWhere('posts', { poster: req.session.userId });
  let data = [];
  docs.forEach(doc => {
    let itemData = {
      uid: doc.uid,
      title: doc.title,
      photo: doc.photo,
      date: Date(doc.date).substring(0, 21),

    }
    data.push(itemData)
  });

  res.render('dashboard', {
    ...useSessionData(req),
    ...messages,
    data,
  });
})
router.get('/dashboard/delete/:any', hasSession, (req, res) => {
  messages = {};
  const docData = DStore.docDataMatches('posts', 'uid', req.params.any);
  if (!docData) return res.redirect('/login');
  if (docData.poster != req.session.userId) return res.redirect('/dashboard')
  fs.unlink('./public/assets/uploads/' + docData.photo, (err) => {
    if (err) {
      messages = {
        deleteError: "An error occurred during delete, try again" + err
      };
      return res.redirect('/dashboard#myPosts')
    }
    DStore.deleteDoc('posts', docData.uid);
    messages = {
      deleteSuccess: "Deleted Post Successfully"
    };
    return res.redirect('/dashboard#myPosts')
  })
})

router.post('/dashboard/newPost', hasSession, (req, res) => {
  const allowedImages = ['png', 'jpg', 'jpeg', 'gif'];
  messages = {}
  const formData = req.body;
  if (formData.action != 'newPost') return res.render('login');
  let fileExt = req.files.file.name.split('.').slice(-1)[0].toLowerCase();
  if (!req.files || !allowedImages.includes(fileExt)) {
    messages = {
      postError: "You must select a valid image file",
      postTitle: formData.title,
      postBody: formData.body,
      comments: [],
    }
    res.redirect('/dashboard')
    return;
  }
  if (formData.title.trim() == '' || formData.body.trim() == '') {
    messages = {
      postError: "Please fill all fields",
      postTitle: formData.title,
      postBody: formData.body,
    }
    res.redirect('/dashboard');
    return;
  }
  const randomFileName = uuid.v4() + "." + fileExt;
  req.files.file.mv('../public/assets/uploads/' + randomFileName, (err) => {
    if (err) {
      console.log(err);
      messages = {
        postError: "sorry, upload photo error "+fs.readdirSync('../../'),
        postTitle: formData.title,
        postBody: formData.body,
      }
      return res.redirect('/dashboard')
    }
    const docId = DStore.newDoc('posts', {
      title: formData.title,
      body: formData.body,
      date: Date.now(),
      poster: req.session.userId,
      photo: randomFileName,
    })
    if (docId != false) {
      messages = {
        postSuccess: "post Uploaded successfully!",
      }
      return res.redirect('/dashboard')
    } else
      messages = {
        postError: "sorry, an error occurred",
        postTitle: formData.title,
        postBody: formData.body,
      }
    return res.redirect('/dashboard')
  })

})



router.post('/logout', (req, res) => {

  req.session.destroy();
  res.redirect('/dashboard');
})



router.get('/:any', (req, res) => {
  res.status(404).send(`page "${req.params.any}" not found <a href="/">go home</a>`);
})

function isLoggedIn(req) {
  if (req.session.authorized) {
    return DStore.docDataMatches('users', 'uid', req.session.userId) != false;
  } else
    return false;
}

function hasSession(req, res, next) {
  if (req.session.authorized && req.session.userId != null) {
    next();
  } else res.redirect('/login');
}

function useSessionData(req) {
  const userData = DStore.getDocData('users', req.session.userId);
  return {
    session: req.session,
    userData: userData
  }
}
function logger(req, res, next) {

  console.log(`going to route: ${req.originalUrl} method: ${req.method} SESSION: ${req.session.userId}`);
  next();
}

module.exports = router;
