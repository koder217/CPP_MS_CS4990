const { S3Client, PutObjectCommand, ListObjectsCommand, DeleteObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const shortid = require('shortid');
const s3 = new S3Client({
    region: "us-west-2",
    signer: { sign: async (request) => request }
  });
// A utility function to create HTML
function getHtml(template) {
  return template.join("\n");
}

// Make getHTML function available to the browser
window.getHTML = getHtml;
const uploadBucketName = "group12projectupload";

const addPhoto = async () => {
  // console.log("event triggered!");
  const files = document.getElementById("photoupload").files;
  // console.log(files);
  try {
    const file = files[0];
    const fileName = shortid.generate();//file.name;
    const photoKey = fileName;
    const watermark = document.getElementById("inputWatermark").value || "CS4990";
    const email = document.getElementById("inputEmail").value || "smallena@cpp.edu";
    const uploadParams = {
      Bucket: uploadBucketName,
      Key: photoKey,
      Body: file,
      Metadata: {"x-amz-meta-watermark": watermark, "x-amz-meta-email": email}
    };
    await s3.send(new PutObjectCommand(uploadParams));
    document.getElementById("alert").style.display = "block";
    setTimeout(function(){
      document.getElementById("alert").style.display = "none";
    }, 5000);
    // const href = "https://s3.us-west-2.amazonaws.com/group12projectoutput/";
    // const url = href +fileName+ ".png";
    // document.getElementById("url").value = url;
    // document.getElementById("url").style.display = "block";
  } catch (err) {
    console.log(err);
    return alert("There was an error uploading your photo: ", err.message);
  }
};
  // Make addPhoto function available to the browser
window.addPhoto = addPhoto;

const viewAlbum = async () => {
  const viewBucketName = "group12projectoutput";
  const albumPhotosKey = "";
  try {
    const data = await s3.send(
        new ListObjectsCommand({
          Prefix: albumPhotosKey,
          Bucket: viewBucketName,
        })
    );
    if (!data || !data.Contents || data.Contents.length === 0) {
      var htmlTemplate = [
        "<h3>You don't have any photos in this album. You need to add photos.</h3>"
      ];
      document.getElementById("album").innerHTML = getHtml(htmlTemplate);
    } else {
      // console.log(data);
      const href = "https://s3.us-west-2.amazonaws.com/";
      const bucketUrl = href + viewBucketName + "/";
      const photos = data.Contents.map(function (photo) {
        const photoKey = photo.Key;
        //console.log(photo.Key);
        const photoUrl = bucketUrl + encodeURIComponent(photoKey);
        return getHtml([
            "<img src=\""+photoUrl+"\" class=\"w-25 shadow-1-strong rounded mx-auto\" alt=\"image\" onclick=\"showModal(this);\" />"
        ]);
      });

      document.getElementById("album").innerHTML = photos;
      //document.getElementsByTagName("img")[0].remove();
    }
  } catch (err) {
    return alert("There was an error viewing your album: " + err.message);
  }
};
  // Make viewAlbum function available to the browser
window.viewAlbum = viewAlbum;
viewAlbum();
window.albumInterval = window.setInterval(viewAlbum, 10000);
window.showModal = function(img){
  console.log("showing....", img.src);
  // Get the modal
  var modal = document.getElementById("myModal");
  var modalImg = document.getElementById("img01");
  modalImg.src = img.src;
  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];
  modal.style.display = "block";
  span.onclick = function() {
    modal.style.display = "none";
  }
}


window.previewImage = function() {
  console.log("img changed!!");
  var oFReader = new FileReader();
  oFReader.readAsDataURL(document.getElementById("photoupload").files[0]);

  oFReader.onload = function (oFREvent) {
    console.log("setting ig");
      document.getElementById("uploadPreview").src = oFREvent.target.result;
      document.getElementById("uploadPreview").style.display = "block";
  };
};


window.createProgressbar = function(id, duration, callback) {
  // We select the div that we want to turn into a progressbar
  var progressbar = document.getElementById(id);
  console.log("progressbar",id, progressbar);
  progressbar.className = 'progressbar';

  // We create the div that changes width to show progress
  var progressbarinner = document.createElement('div');
  progressbarinner.className = 'inner';

  // Now we set the animation parameters
  progressbarinner.style.animationDuration = duration;

  // Eventually couple a callback
  if (typeof(callback) === 'function') {
    progressbarinner.addEventListener('animationend', callback);
  }

  // Append the progressbar to the main progressbardiv
  progressbar.appendChild(progressbarinner);

  // When everything is set up we start the animation
  progressbarinner.style.animationPlayState = 'running';
}
document.addEventListener('DOMContentLoaded', function () {
  createProgressbar('progressbar1', '10s');
});

