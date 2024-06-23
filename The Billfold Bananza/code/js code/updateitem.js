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











// the real magic starts here  
document.addEventListener('DOMContentLoaded', () => {
  fetchMenuItems();
});

function fetchMenuItems() {
  fetch('/menu_items_with_category')
      .then(response => response.json())
      .then(data => {
          const container = document.getElementById('menu-items-container');
          container.innerHTML = '';
          data.forEach((item, index) => {
              const itemElement = document.createElement('div');
              itemElement.classList.add('header_items');
              itemElement.innerHTML = `
                  <input type="number" readonly value="${index + 1}" class="items_txt">
                  <input type="text" readonly value="${item.cat_name}" class="items_txt">
                  <input type="text" readonly value="${item.item_name}" class="items_txt">
                  <input type="number" readonly value="${item.item_price.toFixed(2)}" class="items_txt">
                  <label class="switch-button" for="switch-${item.id}">
                      <div class="switch-outer">
                          <input id="switch-${item.id}" type="checkbox" ${item.onmenu_offmenu ? 'checked' : ''} onchange="toggleMenuStatus(${item.id}, this.checked)">
                          <div class="button">
                              <span class="button-toggle"></span>
                              <span class="button-indicator"></span>
                          </div>
                      </div>
                  </label>
                  <button class="update_btn" popovertarget="my-popover" onclick="showUpdatePopover(${item.id}, '${item.item_name}', ${item.item_price}, '${item.item_img}')"><u>Update</u></button>
                  <button class="delete_btn"  popovertarget="my-popover-delete-alert" onclick="showDeletePopover(${item.id})"><u>Delete</u></button>
              `;
              container.appendChild(itemElement);
          });
      })
      .catch(error => console.error('Error fetching menu items:', error));
}

function toggleMenuStatus(itemId, status) {
  fetch(`/update_menu_status/${itemId}`, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ onmenu_offmenu: status ? 1 : 0 }),
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          console.log('Menu status updated successfully');
      } else {
          console.error('Error updating menu status');
      }
  })
  .catch(error => console.error('Error updating menu status:', error));
}

function showUpdatePopover(itemId, itemName, itemPrice, itemImg) {
  document.getElementById('update-item-name').value = itemName;
  document.getElementById('update-item-price').value = itemPrice;
  window.currentItemId = itemId;
  document.getElementById('my-popover').style.display = 'block';
  document.getElementById('my-popover-delete-alert').style.display = 'none'; // Ensure delete popover is hidden
}

function saveItemUpdate() {
  const itemId = window.currentItemId;
  const itemName = document.getElementById('update-item-name').value;
  const itemPrice = document.getElementById('update-item-price').value;
  const itemImage = document.getElementById('update-item-image').files[0];

  const formData = new FormData();
  formData.append('itemId', itemId);
  formData.append('itemName', itemName);
  formData.append('itemPrice', itemPrice);
  if (itemImage) {
      formData.append('itemImage', itemImage);
  }

  fetch('/update_menu_item', {
      method: 'POST',
      body: formData,
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          console.log('Menu item updated successfully');
          fetchMenuItems(); // Refresh the menu items after update
          document.getElementById('my-popover').style.display = 'none'; // Hide the popover after action
      } else {
          console.error('Error updating menu item');
      }
  })
  .catch(error => console.error('Error updating menu item:', error));
}

function showDeletePopover(itemId) {
  window.currentItemId = itemId;
  document.getElementById('my-popover-delete-alert').style.display = 'block';
  document.getElementById('my-popover').style.display = 'none'; // Ensure update popover is hidden
}

function confirmDelete() {
  const itemId = window.currentItemId;

  fetch(`/delete_menu_item/${itemId}`, {
      method: 'DELETE',
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          console.log('Menu item deleted successfully');
          fetchMenuItems(); // Refresh the menu items after delete
          document.getElementById('my-popover-delete-alert').style.display = 'none'; // Hide the popover after action
      } else {
          console.error('Error deleting menu item');
      }
  })
  .catch(error => console.error('Error deleting menu item:', error));
}

function cancelDelete() {
  document.getElementById('my-popover-delete-alert').style.display = 'none'; // Hide the delete popover
}
