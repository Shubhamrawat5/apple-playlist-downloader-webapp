let songNameArray = [];
let singerNameArray = [];

for (song of document.querySelectorAll(".song-name")) {
  songNameArray.push(song.textContent.replace(/↵|\s{2,10}/g, ""));
}
// console.log("GOT ALL SONG LIST", songNameArray);

for (singer of document.querySelectorAll(".singer-name")) {
  singerNameArray.push(singer.textContent.replace(/↵|\s{2,10}/g, ""));
}
// console.log("GOT ALL SINGER LIST", singerNameArray);

const updateMatchedSong = (songNumb, matchedSong) => {
  document.querySelector("#matched-" + songNumb).textContent =
    matchedSong.matchTrack;

  if (matchedSong.matchTrack !== "NOT FOUND!") {
    document
      .querySelector("#download-btn-" + songNumb)
      .classList.add("show-download"); //show download btn
    document
      .querySelector("#download-" + songNumb)
      .setAttribute("href", matchedSong.url); //add url
  } else {
    document.querySelector("#download-" + songNumb).removeAttribute("href");
  }
};

for (let i = 0; i < songNameArray.length; ++i) {
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/find", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      updateMatchedSong(i, JSON.parse(this.responseText));
    }
  };
  xhttp.send(`song=${songNameArray[i]}&singer=${singerNameArray[i]}`);
}
