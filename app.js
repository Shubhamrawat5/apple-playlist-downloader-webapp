const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const INFO_URL = "https://slider.kz/vk_auth.php?q=";
const DOWNLOAD_URL = "https://slider.kz/download/";

const getSong = async (song, singer) => {
  let query = (song + "%20" + singer).replace(/\s/g, "%20");
  console.log(INFO_URL + query);
  const { data } = await axios.get(encodeURI(INFO_URL + query));

  // when no result then [{}] is returned so length is always 1, when 1 result then [{id:"",etc:""}]
  if (!data["audios"][""][0].id) {
    return { matchTrack: "NOT FOUND!", url: "" };
  } else {
    //avoid remix,revisited,mix
    let i = 0;
    let track = data["audios"][""][i];
    while (/remix|revisited|mix/i.test(track.tit_art)) {
      i += 1;
      track = data["audios"][""][i];
    }
    //if reach the end then select the first song
    if (!track) {
      track = data["audios"][""][0];
    }

    let link = DOWNLOAD_URL + track.id + "/";
    link = link + track.duration + "/";
    link = link + track.url + "/";
    link = link + track.tit_art + ".mp3" + "?extra=";
    link = link + track.extra;
    link = encodeURI(link);
    return { matchTrack: track.tit_art, url: link };
  }
};

app.get("/", (req, res) => {
  res.render("index", {
    playlistUrl: "",
    playlistName: "NA",
    userName: "NA",
    total: 0,
    songsList: [],
    resultInfo: "",
  });
});

app.post("/", (req, res) => {
  let playlistUrl = req.body.playlistUrl; //get url from user inputed

  let playlist = require(__dirname + "/js/apple_playlist"); //open js file
  playlist.getPlaylist(playlistUrl).then(async (response) => {
    //no error with extracting playlist
    if (response !== null) {
      let playlistName = response.playlist;
      let userName = response.user;
      let total = response.total;
      let songsList = response.songs;
      console.log("Total songs:" + total);

      res.render("index", {
        playlistUrl: playlistUrl,
        playlistName: playlistName,
        userName: userName,
        total: total,
        songsList: songsList,
        resultInfo: "FOUND !",
      });
    }
    //some error was there
    else {
      res.render("index", {
        playlistUrl: playlistUrl,
        playlistName: "NA",
        userName: "NA",
        total: 0,
        songsList: [],
        resultInfo: "NOT FOUND !",
      });
    }
  });
});

app.post("/find", (req, res) => {
  let singer = req.body.singer;
  let song = req.body.song;

  getSong(song, singer).then((response) => {
    console.log("SENDING RESPONSE:" + response);
    res.send(response);
  });
});

app.listen(process.env.PORT || 80, () => {
  console.log("SERVER STARTED!");
});
