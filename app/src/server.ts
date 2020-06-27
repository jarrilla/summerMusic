require('dotenv').config();

const {
  SPOTIFY_API_KEY,
  SPOTIFY_API_SECRET,
  REDIRECT_URL,
  SPOTIFY_REFRESH_TOKEN
} = process.env;

import express from "express";
import axios from "axios";

const app = express();
app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let ACCESS_TOKEN: string;

app.get('/', (_req, res) => {
  res.render('index.ejs');
});

app.get('/login', (_req, res) => {
  const scopes = 'playlist-modify-public';
  res.redirect(
    'https://accounts.spotify.com/authorize?response_type=code&client_id='
    + SPOTIFY_API_KEY
    + '&scope=' + encodeURIComponent(scopes)
    + '&redirect_uri=' + encodeURIComponent(REDIRECT_URL!)
  );
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  const url = 'https://accounts.spotify.com/api/token'
    + '?grant_type=authorization_code'
    + '&code=' + code
    + '&redirect_uri=' + encodeURIComponent(REDIRECT_URL!)
    + '&client_id=' + SPOTIFY_API_KEY
    + '&client_secret=' + SPOTIFY_API_SECRET;

  const response = await axios.post(url);
  const { access_token } = response.data;
  ACCESS_TOKEN = access_token;
  //REFRESH_TOKEN = refresh_token;

  res.render('index.ejs');
});

app.post('/api/search', async (req, res) => {
  const { track } = req.body;

  const headers = { 'Authorization': 'Bearer ' + ACCESS_TOKEN };
  const url = 'https://api.spotify.com/v1/search'
    + '?q=' + encodeURIComponent(track)
    + '&type=track';

  while (1) {
    try {
      const response = await axios.get(url, { headers } );
      const { tracks } = response.data;

      res.send(tracks);
      break;
    }
    catch (e) {
      const { status } = e.response;
      if (status !== 401) {
        res.status(status).send({ error: e });
        break;
      }
      else {
        const [refErr, ] = await refreshAccessToken();
        if (refErr) {
          res.status(refErr.response.status).send({ error: refErr });
          break;
        }
      }
    }
  }
});

app.get('/prevText', (_req, res) => {
  res.send(`<html>
    <body>
      <div>Search and select a track to preview</div>
    </body>
  </html>`);
});

async function refreshAccessToken() {
  // const headers = {
  //   'Authorization': 'Basic ' + SPOTIFY_API_KEY + ':' + SPOTIFY_API_SECRET
  // };
  
  const url = 'https://accounts.spotify.com/api/token'
    + '?grant_type=refresh_token'
    + '&refresh_token=' + encodeURIComponent(SPOTIFY_REFRESH_TOKEN!)
    + '&client_id=' + SPOTIFY_API_KEY
    + '&client_secret=' + SPOTIFY_API_SECRET;

    try {
      const response = await axios.post(url);
      const { access_token } = response.data;
      ACCESS_TOKEN = access_token;

      return [null, null];
    }
    catch (e) {
      return [e];
    }
}


app.listen(3000, () => console.log('running on 3000'));