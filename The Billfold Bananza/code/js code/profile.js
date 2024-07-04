

document.getElementById('itemImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile_img2').src = e.target.result;
            document.getElementById('profile_img').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

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
