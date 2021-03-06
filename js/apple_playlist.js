const axios = require("axios");
const JSSoup = require("jssoup").default;
const htmlEntities = require("html-entities");

module.exports.getPlaylist = async (playlistUrl) => {
  console.log("REQUEST TO FIND PLAYLIST INFO!");
  // return {
  //   total: 2,
  //   playlist: "FAVOURITE",
  //   user: "Shubham",
  //   songs: [
  //     {
  //       name: "love song",
  //       singer: "why dont we",
  //     },
  //     {
  //       name: "Story Of My Life",
  //       singer: "One Direction",
  //     },
  //     {
  //       name: "lucid dreams",
  //       singer: "juice wrld",
  //     },
  //   ],
  // };
  let playlistObj = {};
  try {
    const response = await axios.get(playlistUrl);
    const { data } = response;
    const soup = new JSSoup(data);

    //scraping...
    const playlistHeaderBlock = soup.find("div", "album-header-metadata");
    let playlistName = playlistHeaderBlock.find("h1").text.trim();
    let playlistUser = playlistHeaderBlock
      .find("div", "product-creator")
      .text.trim();
    //   console.log(playlistName, playlistUser);
    playlistObj.playlist = htmlEntities.decode(playlistName);
    playlistObj.user = htmlEntities.decode(playlistUser);

    const tracksInfo = soup.findAll("div", "songs-list-row");
    // console.log(tracksInfo.length);
    playlistObj.songs = [];

    for (let track of tracksInfo) {
      let songName = track.find("div", "songs-list-row__song-name").text;
      let singerNames = track.find("div", "songs-list-row__by-line").text;
      singerNames = singerNames.replace(/\s{2,10}/g, ""); //remove spaces
      songName = songName.replace(/\?|<|>|\*|"|:|\||\/|\\/g, ""); //removing special characters which are not allowed in file name
      playlistObj.songs.push({
        name: htmlEntities.decode(songName),
        singer: htmlEntities.decode(singerNames),
      });
    }
    playlistObj.total = playlistObj.songs.length;
    // console.log(playlistObj);
  } catch {
    console.log("SOME ERROR WITH PLAYLIST URL!");
    playlistObj = null;
  }
  console.log("DONE WITH PLAYLIST URL");
  return playlistObj;
};
