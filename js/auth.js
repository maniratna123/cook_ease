document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const authLink = document.getElementById('auth-link');
  const signupError = document.getElementById('signup-error');
  const loginError = document.getElementById('login-error');
  const successMessage = document.getElementById('success-message'); 


  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if (!username || !password) {
        signupError.textContent = "Both username and password are required!";
        signupError.style.color = 'red';
      } else {
        const existingUser = localStorage.getItem(username);
        if (existingUser) {
          signupError.textContent = "User already exists. Please log in.";
          signupError.style.color = 'red';
        } else {
          localStorage.setItem(username, JSON.stringify({ password }));
          successMessage.textContent = "Signup successful! Redirecting to login...";
          successMessage.style.color = 'green';
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
        }
      }
    });
  }


  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if (!username || !password) {
        loginError.textContent = "Both username and password are required!";
        loginError.style.color = 'red';
      } else {
        const storedUser = localStorage.getItem(username);
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          if (userObj.password === password) {
            localStorage.setItem('loggedInUser', username); 
            loginError.textContent = "";
            window.location.href = 'index.html';
          } else {
            loginError.textContent = "Incorrect password!";
            loginError.style.color = 'red';
          }
        } else {
          loginError.textContent = "User not found!";
          loginError.style.color = 'red';
        }
      }
    });
  }

  updateAuthLink();


  if (authLink) {
    if (isLoggedIn()) {
      authLink.textContent = 'Logout';
      authLink.href = '#';
      authLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedInUser');
        updateAuthLink();
        window.location.href = 'index.html'; 
      });
    } else {
      authLink.textContent = 'Login';
      authLink.href = 'login.html';
    }
  }
});


function isLoggedIn() {
  return !!localStorage.getItem('loggedInUser');
}


function updateAuthLink() {
  const authLink = document.getElementById('auth-link');
  const signupLink = document.querySelector('nav a[href="./signup.html"]');

  if (authLink) {
    if (isLoggedIn()) {
      authLink.textContent = 'Logout';
      authLink.href = '#';
      signupLink.style.display = 'none'; 
    } else {
      authLink.textContent = 'Login';
      authLink.href = 'login.html';
      signupLink.style.display = 'inline'; 
    }
  }
}
