import axios from "axios";
import { compile } from "ejs";
import "regenerator-runtime/runtime";
import io from "socket.io-client";
const socket = io("ws://localhost:8080");

const spinner = `<div class="circle-loading"></div>`;

const generateErrorAlert = (statusCode, message) => {
  return `<div class="alert alert-danger alert-dismissible fade show" role="alert">
  <strong>${statusCode}-${message}</strong> Try again !
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
  </div>`;
};

const generateUrlCrawled = (url) => {
  return `<div class="alert alert-success" role="alert">
  ${url}
  </div>`;
};

const generateSiteMapXmlLink = (newUrl) => {
  return `<a id="sm-link-dl" type="button" class="btn btn-success" href="${newUrl}" download="sitemap.xml">Download sitemap.xml now</a>`;
};

const generateSiteMap = async (url, urlToGen, depth, socketId) => {
  try {
    const data = {
      urlToGen,
      depth,
      socketId,
    };

    const response = await axios.post(url, data);

    return {
      downloadUrl: response.data.downloadUrl,
    };
  } catch (err) {
    $(".notify-area").prepend(
      generateErrorAlert(err.response.status, err.response.data.message)
    );
    return null;
  }
};

socket.on("new-url-added", (data) => {
  $(".notify-area").prepend(generateUrlCrawled(data.url));
});

$(document).ready(function () {
  $("#btn-gen-site-map").click(async function () {
    const socketId = socket.id;

    console.log(socketId);

    const urlWeb = $("#input-url").val().trim();
    const depth = $('input[name="customRadio"]:checked').val();

    $(".spinnerContainer").append(spinner);
    $("#sm-link-dl").remove();
    $(".notify-area").empty();
    $(".notify-area").empty();

    const data = await generateSiteMap(
      "http://localhost:8080/get-site-map",
      urlWeb,
      depth,
      socketId
    );

    if (data !== null) {
      $(".dl-link").append(generateSiteMapXmlLink(data.downloadUrl));
      $(".circle-loading").remove();
    } else {
      $(".circle-loading").remove();
    }
  });
});
