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
  let url = matchedSong.urlLink;
  let namee = { namee: matchedSong.matchTrack, url: url };
  console.log(url);
  let filename = JSON.stringify(namee);
  let k = document.querySelector("#download-btn-" + songNumb);
  // console.log(filename);

  if (matchedSong.matchTrack !== "NOT FOUND!") {
    document
      .querySelector("#download-btn-" + songNumb)
      .classList.add("show-download"); //show download btn
    document
      .querySelector("#download-" + songNumb)
      .addEventListener("click", (e) => {
        k.innerHTML = `  <img
                  type="gif"
                  src="../images/downloading.gif"
                  alt="gif"
                  style="width:86px"
                />`;
        //           `<div style="position: relative; background-color: ; width: 7rem; height: 2rem;>
        //     <h6 style="color: azure; font-size: 200px; font-weight: 200;">Downloading...</h6>
        // </div>`
        e.preventDefault();
        fetch(`/download?filename=${filename}`)
          .then((response) => response.arrayBuffer())
          .then((buffer) => {
            // Create a blob from the buffer
            const audioBlob = new Blob([buffer], { type: "audio/mpeg" });

            // Create a link element
            const link = document.createElement("a");

            // Create an object URL for the blob
            const url = URL.createObjectURL(audioBlob);

            // Set link's href to point to the object URL
            link.href = url;
            link.download = `${matchedSong.matchTrack}.mp3`; // Set the filename

            // Programmatically click the link to trigger the download
            link.click();

            console.log(matchedSong.matchTrack);
          })
          .catch((error) => console.error("Error fetching audio:", error));
      });
  }

  ////////////////////////////////////////////////////
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
