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

// Select elements
let dropdownBtn = document.getElementById("drop-text");
let list = document.getElementById("list");
let span = document.getElementById("drop-text"); // Assuming the span is within the button
let input = document.querySelector('.label_txt_n'); // Select the input field
let icon = document.getElementById('icon'); // Assuming you have an icon element

// Function to fetch categories from server
async function fetchCategories() {
  try {
    const response = await fetch('/categories'); // Fetch data from /categories endpoint
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const categories = await response.json(); // Parse JSON response
    populateDropdown(categories); // Call function to populate dropdown with categories
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

// Function to populate dropdown list with categories
function populateDropdown(categories) {
  list.innerHTML = ''; // Clear existing list items

  categories.forEach(category => {
    const listItem = document.createElement('li'); // Create <li> element
    listItem.classList.add('dropdown-list-item'); // Add class to <li> element
    listItem.textContent = category.cat_name; // Set text content to category name
    listItem.onclick = function(e) {
      // Change dropdown button text on click of selected list item
      span.innerText = e.target.innerText;
      
      // Update input field value
      input.value = e.target.innerText;

      list.classList.remove('show'); // Hide dropdown list
      icon.style.transform = "rotate(0deg)"; // Reset arrow icon rotation
    };
    list.appendChild(listItem); // Append <li> to <ul>
  });
}

// Show dropdown list on click
dropdownBtn.onclick = function () {
  list.classList.toggle("show"); // Toggle show class to display dropdown list

  // Rotate arrow icon
  if (list.classList.contains("show")) {
    icon.style.transform = "rotate(-180deg)"; // Rotate arrow icon up
  } else {
    icon.style.transform = "rotate(0deg)"; // Reset arrow icon rotation
  }

  // Fetch categories if dropdown is shown
  if (list.classList.contains("show")) {
    fetchCategories();
  }
};

// Hide dropdown list when clicking outside dropdown button
window.onclick = function (e) {
  if (!dropdownBtn.contains(e.target) && e.target !== span && e.target !== icon) {
    list.classList.remove("show"); // Hide dropdown list
    icon.style.transform = "rotate(0deg)"; // Reset arrow icon rotation
  }
};

// Add event listener for the Add Category button
document.getElementById('addCategoryBtn').addEventListener('click', async () => {
  const newCategoryInput = document.getElementById('newCategoryInput');
  const newCategoryName = newCategoryInput.value.trim();

  if (newCategoryName) {
    try {
      const response = await fetch('/add-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cat_name: newCategoryName })
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        newCategoryInput.value = ''; // Clear input field
        fetchCategories(); // Refresh the category list

        // Update the input field with the new category name
        input.value = newCategoryName;
      } else {
        alert(result.message || 'Error adding category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category');
    }
  } else {
    alert('Please enter the category name first.');
  }
});


