function changeMessage() {
  const message = document.getElementById("message");

  const messages = [
    "CI/CD is working...",
    "Deployment successful!",
    "Netlify rebuilt this site.",
    "You triggered automation."
  ];

  const random = Math.floor(Math.random() * messages.length);
  message.textContent = messages[random];
}