console.log("Modal.js loaded!");

let captchaA;
let captchaB;
let captchaAnswer;

function generateCaptcha(){

captchaA =
Math.floor(
Math.random() * 10
) + 1;

captchaB =
Math.floor(
Math.random() * 10
) + 1;

captchaAnswer =
captchaA + captchaB;

document
.getElementById(
"captchaQuestion"
)
.innerText =
`${captchaA} + ${captchaB} = ?`;

}

function openCaptchaModal(){

generateCaptcha();

document
.getElementById(
"captchaModal"
)
.style.display =
"flex";

}

function closeCaptchaModal(){

document
.getElementById(
"captchaModal"
)
.style.display =
"none";

}