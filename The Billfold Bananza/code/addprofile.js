document.getElementById('itemImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile_img2').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('updateButton').addEventListener('click', addProfile);

function addProfile() {
    const formData = new FormData();
    formData.append('restaurant_name', document.getElementById('restaurant_name').value);
    formData.append('restaurant_address', document.getElementById('restaurant_address').value);
    formData.append('restaurant_number', document.getElementById('restaurant_number').value);

    const fileInput = document.getElementById('itemImage');
    if (fileInput.files.length > 0) {
        formData.append('restaurant_image', fileInput.files[0]);
    }

    fetch('/add-profile', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the profile image and other fields
            document.getElementById('profile_img2').src = data.profile.restaurant_image;
            alert('Profile added successfully!');
            window.location.href = './Menu_Page.html'; // Redirect to menu page
        } else {
            alert('Error adding profile: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding profile');
    });
}
