const axios = require("axios");
const JSSoup = require("jssoup").default;
const htmlEntities = require("html-entities");

module.exports.getPlaylist = async (url) => {
  console.log("REQUEST TO FIND PLAYLIST INFO!");
  let playlistObj = {};
  try {
    let api = "https://api.fabdl.com/apple-music/get?url=";

    console.log("Playlist URL: ", url);
    const { data } = await axios.get(api + url);

    playlistObj.playlist = htmlEntities.decode(data.result.name);
    playlistObj.user = htmlEntities.decode(data.result.owner);
    playlistObj.songs = [];

    data.result.tracks.forEach((track) => {
      playlistObj.songs.push({
        name: htmlEntities.decode(track.name),
        singer: htmlEntities.decode(track.artists),
      });
    });

    return playlistObj;
  } catch {
    console.log("SOME ERROR WITH PLAYLIST URL!");
    playlistObj = null;
  }
  console.log("DONE WITH PLAYLIST URL");
  return playlistObj;
};
