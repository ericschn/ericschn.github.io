import { phoneList } from "./phoneList.js";
import { batteryColors } from "./batteryColors.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let phone;
let screenshotImage;

const screenshotUrlDebug = "./images/test-xs-gray.png";

// Event Listeners

// Screenshot form event listener
const imgInput = document.querySelector("#upload-screenshot");
imgInput.addEventListener("change", () => {
  const screenshotUrl = URL.createObjectURL(imgInput.files[0]);
  if (screenshotUrl) {
    console.log("Image is in the form");
    // document.querySelector(".upload-wrapper").hidden = true;
    hideUploadButton();
    processScreenshot(screenshotUrl);
  }
});

// Add some juice button event listener
let drawBatteryBtn = document.getElementById("draw-battery");
drawBatteryBtn.addEventListener("click", chargeBattery);

// Download screenshot result event listener
document.getElementById("download-screenshot").addEventListener("click", () => {
  const link = document.createElement('a');
  link.download = 'download.png';
  link.href = canvas.toDataURL();
  link.click();
  link.delete;
});

// Canvas Drawing

// Process screenshot and draw to canvas
async function processScreenshot(screenshotUrl) {
  console.log("processScreenshot");
  // Load screenshot from generated URL
  await loadImage(screenshotUrl).then((img) => {
    screenshotImage = img;
  });

  // Assign phone model info
  phone = getPhoneModel(screenshotImage, phoneList);

  // Set canvas to proper size and draw screenshot
  ctx.canvas.width = phone.width;
  ctx.canvas.height = phone.height;

  ctx.drawImage(screenshotImage, 0, 0);

  // Get battery color, green = charging
  phone.batColor = getBatteryColor(ctx, phone);
  console.log("Battery icon color: " + phone.batColor);

  // Move mockup into view
  moveMockupUp();

  // TODO: if battery isn't charging, sample further out
  // to see about how much charge it has

  // DEBUG - show battery sample location
  let debug = 0;
  if (debug) {
    let imgData = ctx.getImageData(phone.batColorX, phone.batColorY, 6, 6);
    let data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 220; // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
    }
    ctx.putImageData(imgData, phone.batColorX, phone.batColorY);
  }
}

// Draw chosen battery overlayed on screenshot
async function drawBattery() {
  // TODO: determine what battery overlay to load
  let batCapL, batCapR;
  await loadImage(phone.batUrl + phone.batColor[0] + "_L.png").then((img) => {
    batCapL = img;
  });
  await loadImage(phone.batUrl + phone.batColor[0] + "_R.png").then((img) => {
    batCapR = img;
  });

  // Draw battery on page
  ctx.rect(
    phone.batRect[0],
    phone.batRect[1],
    phone.batLength[2],
    phone.batHeight
  );
  ctx.fillStyle = phone.batColor[1];
  ctx.fill();
  ctx.drawImage(
    batCapR,
    phone.batRect[0] + phone.batLength[2],
    phone.batRect[1]
  );

  moveMockupUp();

  // DEBUG - rectangle draw test
  // ctx.fillStyle = 'white';
  // ctx.beginPath();
  // ctx.rect(phone.batIconX + 10, phone.batIconY + 7, 46, 22);
  // ctx.fill();
}

// Helper Functions

// Promise for loading image files
function loadImage(imgUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => {
      resolve(img);
    });
    img.src = imgUrl;
  });
}

// Get user's phone model
function getPhoneModel(screenshot, phones) {
  for (let p of phones) {
    if (screenshot.width === p.width && screenshot.height === p.height) {
      console.log("Phone identified as: iPhone " + p.name);
      return p;
    }
  }
  console.log("Phone not found.");
  // TODO: error handling
  return "Phone not found.";
}

// Get battery icon color in screenshot
function getBatteryColor(ctx, p) {
  let c = ctx.getImageData(p.batColorX, p.batColorY, 1, 1).data;
  if (c[0] > 245 && c[1] > 245 && c[2] > 245) return ["wht", "#FFFFFF"];
  if (c[0] < 11 && c[1] < 11 && c[2] < 11) return ["blk", "#000000"];
  if (c[0] < 115 && c[1] > 186 && c[2] < 115) return ["grn", "#67ce67"];
  if (c[0] > 230 && c[1] < 90 && c[2] < 72) return ["red", "red"];
}

// Animations

// Vars
let mockup = document.querySelector(".mockup-wrapper");

function hideUploadButton() {
  let uploadBtn = document.querySelector(".upload-wrapper");
  uploadBtn.classList.add("fade-out");
  hideInfoText();
  showControls();
}

function hideInfoText() {
  let uploadBtn = document.querySelector(".info-text");
  uploadBtn.classList.add("fade-out");
}

function showControls() {
  let controls = document.querySelector(".controls");
  controls.classList.add("fade-in");
}

function moveMockupUp() {
  mockup.classList.remove("mockup-down");
}

function moveMockupDown() {
  mockup.classList.add("mockup-down");
}

function chargeBattery() {
  moveMockupDown();
  showChargeAnimation();
  setTimeout(drawBattery, 800);
}

function showChargeAnimation() {
  for (let i = 0; i < 4; i++) {
    createParticle(i);
  }
}

function createParticle(num) {
  const bolt = document.createElement("bolt");
  bolt.innerHTML = "⚡";
  document.body.appendChild(bolt);
  let startX = Math.floor(window.innerWidth / 2) - 28;
  let startY = window.innerHeight;
  let endX = Math.floor(Math.random() * (startX * 2 - 150) + 75);

  const animation = bolt.animate(
    [
      {
        transform: `translate(${startX}px, ${startY}px) rotate(0deg)`,
        opacity: 1,
      },
      {
        transform: `translate(${(endX + startX) / 2}px, ${
          startY - 150
        }px) rotate(0deg)`,
        opacity: 1,
      },
      {
        transform: `translate(${endX}px, ${startY - 300}px) rotate(0deg)`,
        opacity: 0,
      },
    ],
    {
      duration: 800,
      easing: "cubic-bezier(0, .9, .57, 1)",
      easing: "cubic-bezier(.2, .7, .7, 1)",
      delay: 150 * num,
    }
  );
  animation.onfinish = () => bolt.remove();
}

// Test
// showChargeAnimation();
