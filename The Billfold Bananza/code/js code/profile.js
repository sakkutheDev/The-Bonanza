//The Nav side bars js code :)

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





document.getElementById('updateButton').addEventListener('click', updateProfile);

function updateProfile() {
    const formData = new FormData();
    formData.append('restaurant_name', document.getElementById('restaurant_name').value);
    formData.append('restaurant_address', document.getElementById('restaurant_address').value);
    formData.append('restaurant_number', document.getElementById('restaurant_number').value);

    const fileInput = document.getElementById('itemImage');
    if (fileInput.files.length > 0) {
        formData.append('restaurant_image', fileInput.files[0]);
    }

    fetch('/update-profile', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the profile image and other fields
            document.getElementById('profile_img').src = data.profile.restaurant_image;
            document.getElementById('profile_img2').src = data.profile.restaurant_image;
            alert('Profile updated successfully!');
        } else {
            alert('Error updating profile: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating profile');
    });
}

// Function to fetch and display current profile details
function fetchProfile() {
    fetch('/get-profile')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const profile = data.profile;
            document.getElementById('restaurant_name').value = profile.restaurant_name;
            document.getElementById('restaurant_address').value = profile.restaurant_address;
            document.getElementById('restaurant_number').value = profile.restaurant_number;
            document.getElementById('profile_img').src = profile.restaurant_image;
            document.getElementById('profile_img2').src = profile.restaurant_image;
        } else {
            alert('Error fetching profile: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error fetching profile');
    });
}

// Fetch profile details on page load
window.onload = fetchProfile;