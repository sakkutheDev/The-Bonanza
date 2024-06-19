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


// ordersummary.js
document.addEventListener('DOMContentLoaded', function() {
  fetchOrders();
});

function fetchOrders() {
  fetch('/get_orders')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        displayOrders(data.orders);
      } else {
        console.error('Failed to fetch orders:', data.error);
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
}
function displayOrders(orders) {
  const orderSummaryContainer = document.getElementById('order-summary');
  orderSummaryContainer.innerHTML = ''; // Clear any existing content

  orders.forEach(order => {
    const orderDiv = document.createElement('div');
    orderDiv.classList.add('order');

    // Create order details HTML
    const orderTop = `
      <div class="o_top">
        <p class="order_no"><u>Order No. : ${order.bill_no}</u></p>
        <p class="type"><b>Order Type :</b> ${order.order_type_id === 1 ? "Dine In" : "Pick Up"}</p>
      </div>
    `;

    // Generate item list HTML
    let itemsListHTML = '';
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      itemsListHTML = order.items.map(item => `>${item.quantity}-${item.name}`).join('<br>');
    } else {
      itemsListHTML = '>No items found'; // Placeholder or error handling message
    }

    // Create order items and totals HTML
    const orderDetails = `
      <p class="items">Items</p>
      <p class="item_list">${itemsListHTML}</p>
      <div class="o_bottom">
        <p class="item_detail">Total items : ${calculateTotalItems(order.items)}</p>
        <p class="item_detail">Total Amount : ₹${order.total_amount.toFixed(2)}</p>
        <p class="item_detail">Payment Type : ${paymentTypeMapReverse[order.payment_type_id]}</p>
        <p class="item_detail">Discount : ₹${order.discount.toFixed(2)}</p>
      </div>
      <button class="cancel_btn" data-order-id="${order.id}" popovertarget="my-popover-delete-alert"><u>Cancel Order.....</u></button>
    `;

    // Combine all parts into the order div
    orderDiv.innerHTML = orderTop + orderDetails;

    // Append to the summary container
    orderSummaryContainer.appendChild(orderDiv);

    // Add event listener to the cancel button
    const cancelButton = orderDiv.querySelector('.cancel_btn');
    cancelButton.addEventListener('click', () => {
      const orderId = cancelButton.getAttribute('data-order-id');
      showDeleteConfirmation(orderId);
    });
  });
}

// Function to display delete confirmation popover
function showDeleteConfirmation(orderId) {
  const deletePopover = document.getElementById('my-popover-delete-alert');
  const deleteButton = deletePopover.querySelector('.delete');
  deleteButton.setAttribute('data-order-id', orderId); // Set orderId as an attribute to the delete button

  // Show popover
  deletePopover.classList.add('show-popover');

  // Add event listener to delete button in popover
  deleteButton.addEventListener('click', () => {
    deleteOrder(orderId);
    hidePopovers();
  });
}

// Function to delete an order
function deleteOrder(orderId) {
  fetch(`/delete_order/${orderId}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log(`Order with ID ${orderId} deleted successfully`);
        // Optionally, update the UI to reflect the deletion
        showDeleteDonePopover();
        // Refresh the orders after deletion
        fetchOrders();
      } else {
        console.error('Failed to delete order:', data.error);
      }
    })
    .catch(error => {
      console.error('Delete order error:', error);
    });
}

// Function to display "Order removed/cancelled" popover
function showDeleteDonePopover() {
  const deleteDonePopover = document.getElementById('my-popover-detele-done');
  deleteDonePopover.classList.add('show-popover');
}

// Function to hide all popovers
function hidePopovers() {
  const popovers = document.querySelectorAll('[popover]');
  popovers.forEach(popover => {
    popover.classList.remove('show-popover');
  });
}

// Function to calculate total items in an order
function calculateTotalItems(items) {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((acc, item) => acc + item.quantity, 0);
}

const paymentTypeMapReverse = {
  2: 'Cash',
  3: 'Card',
  4: 'UPI'
};
