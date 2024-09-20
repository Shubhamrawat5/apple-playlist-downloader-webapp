const express = require("express");
// const ejs = require("ejs");
const bodyParser = require("body-parser");
// const axios = require("axios");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const youtubedl = require("youtube-dl-exec");
const fs = require("fs");
// var bodyParser = require("body-parser");
// var fs = require("fs");
var path = require("path");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const INFO_URL = "https://slider.kz/vk_auth.php?q=";
// const DOWNLOAD_URL = "https://slider.kz/download/";

const getSong = async (song, singer) => {
  // let query = (song + "%20" + singer).replace(/\s/g, "%20");
  // console.log(INFO_URL + query);
  // const { data } = await axios.get(encodeURI(INFO_URL + query));

  //----------------------------------------------------//
  // const data = [];
  const r = await yts(`${song} +" - "+${singer}`);

  const videoID = r.all[0].url;
  console.log(videoID);

  let info = await ytdl.getInfo(videoID);

  let songDownloadUrl = videoID;
  let songTitleFound = info.videoDetails.title;

  // when no result then [{}] is returned so length is always 1, when 1 result then [{id:"",etc:""}]
  if (!songDownloadUrl) {
    return { matchTrack: "NOT FOUND!", url: "" };
  } else {
    //avoid remix,revisited,mix
    // let i = 0;
    // let track = data["audios"][""][i];
    // let totalTracks = data["audios"][""].length;
    // while (
    //   i < totalTracks &&
    //   /remix|revisited|reverb|mix/i.test(track.tit_art)
    // ) {
    //   i += 1;
    //   track = data["audios"][""][i];
    // }
    // //if reach the end then select the first song
    // if (!track) {
    //   track = data["audios"][""][0];
    // }

    // let link = DOWNLOAD_URL + track.id + "/";
    // link = link + track.duration + "/";
    // link = link + track.url + "/";
    // link = link + track.tit_art + ".mp3" + "?extra=";

    // link = link + track.extra;
    // await youtubedl(videoID, {
    //   format: "m4a",
    //   output: "./songs/" + info.videoDetails.title + ".mp3",
    //   maxFilesize: "104857600",
    //   preferFreeFormats: true,
    // });
    let link = songDownloadUrl;
    // let link =
    //   "https://static.toiimg.com/thumb/msid-104375923,width-1280,height-720,imgsize-29630,resizemode-6,overlay-toi_sw,pt-32,y_pad-40/photo.jpg";
    // link = encodeURIComponent(link);
    return {
      matchTrack: info.videoDetails.title,
      urlLink: link,
    };
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
    // console.log("SENDING RESPONSE:" + response);
    res.send(response);
  });
});

// app.use(bodyParser.raw({ type: "application/octet-stream", limit: "2mb" }));

// app.post("/download", function (req, res) {
//   var filePath = path.join(__dirname, "./a.mp3");
//   fs.open(filePath, "w", function (err, fd) {
//     fs.write(fd, req.body, 0, req.body.length, null, function (err) {
//       if (err) throw "error writing file: " + err;
//       fs.close(fd, function () {
//         console.log("wrote the file successfully");
//         res.status(200).end();
//       });
//     });
//   });
//   console.log("downlaod Api hit");
// });

app.get("/download", async (req, res) => {
  // files comes as string in object //
  const fileNameObj = req.query.filename;
  const k = JSON.parse(fileNameObj);
  // let fileName = { namee: "matchedSong.matchTrack", url: "url" };

  // const url = req.query.url;
  console.log("fileName -" + k.namee);
  console.log("URL -" + k.url);

  await youtubedl(k.url, {
    format: "m4a",
    output: "./songs/" + k.namee + ".mp3",
    maxFilesize: "104857600",
    preferFreeFormats: true,
  });
  // let song = req.body.songName;
  // console.log(song);

  const audioPath = path.join(__dirname, `/songs/${k.namee}.mp3`); // Replace with your audio file path
  // console.log(JSON.stringify(audioPath));

  fs.readFile(audioPath, (err, data) => {
    if (err) {
      res.status(500).send("Error reading audio file");
      return;
    }

    // Set the content type to audio/mpeg (or another appropriate audio type)
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="${k.namee}" `);

    // Send the audio buffer
    res.send(data);
    // console.log("Download APi hit");
  });
  fs.unlink(audioPath, (err) => {
    if (err) {
      console.error("Error deleting the file:", err);
      return;
    }
    console.log("File successfully deleted after download!");
  });
});

// app.get("/download", (req, res) => {
//   let song = req.body.songName;
//   // // res.download(`./songs/+${k}+.mp3`);
//   // for (let i = 0; i < songNameArray.length; ++i) {
//   //   document
//   //     .querySelector("#download-btn-" + songNumb)
//   //     .addEventListener("click", () => {
//   //       res.download(`./songs/One Direction - Best Song Ever.mp3`);
//   //     });
//   // }
//   console.log("download API hit " + song);

//   res.download("./songs/One Direction - Best Song Ever.mp3");
//   // var file = fs.readFileSync(
//   //   __dirname + "/songs/One Direction - Best Song Ever.mp3",
//   //   "binary"
//   // );

//   // res.setHeader("Content-Length", file.length);
//   // res.write(file, "binary");
//   // res.end();
// });

app.listen(process.env.PORT || 8000, () => {
  console.log("SERVER STARTED!");
});
