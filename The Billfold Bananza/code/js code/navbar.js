//The Nav side bars js code which is not using right now:)

let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");
closeBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange(); //calling the function(optional)
});

// following are the code to change sidebar button(optional)
function menuBtnChange() {
  if (sidebar.classList.contains("open")) {
    closeBtn.classList.replace("bx-menu", "bx-menu-alt-right"); //replacing the iocns class
  } else {
    closeBtn.classList.replace("bx-menu-alt-right", "bx-menu"); //replacing the iocns class
  }
}

// Example of updating profile data on the frontend
fetch('/get-profile')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const profile = data.profile;
      document.getElementById('res_name').textContent = profile.restaurant_name;
      document.getElementById('res_image').src = data.profile.restaurant_image;
    } else {
      console.error('Error fetching profile:', data.message);
    }
  })
  .catch(error => console.error('Error fetching profile:', error));

