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
    const albumPhotosKey = "";
    await s3.send(
        new ListObjectsCommand({
          Prefix: albumPhotosKey,
          Bucket: uploadBucketName
        })
    );
    try {
      const file = files[0];
      const fileName = shortid.generate();//file.name;
      const photoKey = fileName;
      const watermark = document.getElementById("inputWatermark").value || "CS4990";
      const uploadParams = {
        Bucket: uploadBucketName,
        Key: photoKey,
        Body: file,
        Metadata: {"x-amz-meta-watermark": watermark}
      };
      await s3.send(new PutObjectCommand(uploadParams));
      document.getElementById("alert").style.display = "block";
      setTimeout(function(){
        document.getElementById("alert").style.display = "none";
      }, 5000);
      const href = "https://s3.us-west-2.amazonaws.com/";
      const url = href + uploadBucketName + "/"+fileName;
      document.getElementById("url").value = url;
      document.getElementById("url").style.display = "block";
    } catch (err) {
      console.log(err);
      return alert("There was an error uploading your photo: ", err.message);
    }
  } catch (err) {
    console.log("error!!",err);
    if (!files.length) {
      return alert("Choose a file to upload first.");
    }
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
          "<div class='col-md-4 mt-3 col-lg-3'>",
          "<img src=\""+photoUrl+"\" class=\"img-fluid\" alt=\"image\" onclick=\"showModal(this);\">",
          "</div>"
        ]);
      });

      // var message = photos.length
      //     ? "<p>Click the X to delete the photo.</p>"
      //     : "<p>You don't have any photos in this album. You need to add photos.</p>";
      // const htmlTemplate = [
      //   "<h2>",
      //   "Album",
      //   "</h2>",
      //   message,
      //   "<div>",
      //   getHtml(photos),
      //   "</div>",
      //   '<input id="photoupload" type="file" accept="image/*">',
      //   '<button id="addphoto" onclick="addPhoto(\'' + "" + "')\">",
      //   "Add photo",
      //   "</button>",
      //   '<button onclick="listAlbums()">',
      //   "Back to albums",
      //   "</button>",
      // ];
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
window.setInterval(viewAlbum, 10000);
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