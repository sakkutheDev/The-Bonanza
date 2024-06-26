// Java Script code for animation-click event for my Login and Sign in page :)
const signInBtnLink = document.querySelector('.signInBtn-link');
const signUpBtnLink = document.querySelector('.signUpBtn-link');
const wrapper = document.querySelector('.wrapper');
signUpBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
});
signInBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
});                                                                                                                                                                                         




document.addEventListener("DOMContentLoaded", function() {
  // Handle login form submission
  const loginForm = document.querySelector('.form-wrapper.sign-in form');

  loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const username = document.querySelector('.form-wrapper.sign-in input[name="username"]').value;
    const password = document.querySelector('.form-wrapper.sign-in input[name="password"]').value;

    // Basic validation
    if (!username || !password) {
      alert('Please fill in all fields.');
      return;
    }

    // Send the data to the server using fetch API
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        if (data.isNewUser) {
          window.location.href = './Main_Profile.html'; // Redirect new users to profile page
        } else {
          window.location.href = './Menu_Page.html'; // Redirect existing users to menu page
        }
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    });
  });

  // Handle signup form submission
  const signUpForm = document.querySelector('.form-wrapper.sign-up form');

  signUpForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const username = document.querySelector('.form-wrapper.sign-up input[name="username"]').value;
    const password = document.querySelector('.form-wrapper.sign-up input[name="password"]').value;
    const confirmPassword = document.querySelector('.form-wrapper.sign-up input[name="confirm_password"]').value;
    const terms = document.querySelector('.form-wrapper.sign-up input[name="terms"]').checked;

    // Basic validation
    if (!username || !password || !confirmPassword || !terms) {
      alert('Please fill in all fields and agree to the terms.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    // Send the data to the server using fetch API
    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password,
        confirm_password: confirmPassword,
        terms: terms
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.href = '/'; // Redirect back to login page on successful signup
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    });
  });
});