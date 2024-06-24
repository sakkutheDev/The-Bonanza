
// Function to fetch and display current profile details
function fetchProfile() {
    fetch('/get-profile')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const profile = data.profile;
            
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