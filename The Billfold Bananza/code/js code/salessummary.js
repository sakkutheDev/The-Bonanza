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









document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('yesterdayBtn').addEventListener('click', () => fetchSalesReport('yesterday'));
  document.getElementById('todayBtn').addEventListener('click', () => fetchSalesReport('today'));
  
  // Load today's sales report by default
  fetchSalesReport('today');
});



function fetchSalesReport(day) {
  const url = day === 'yesterday' ? '/yesterday_orders' : '/today_orders';
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        displayReport(data.orders, data.cancelledOrders, day);
      } else {
        console.error('Error fetching sales report:', data.error);
      }
    })
    .catch(error => console.error('Error fetching sales report:', error));
}

function displayReport(orders, cancelledOrders, day) {
  let totalOrders = 0;
  let totalCashAmount = 0;
  let totalCardAmount = 0;
  let totalUpiAmount = 0;
  let totalDiscountAmount = 0;
  let grandTotal = 0;

  orders.forEach(order => {
    totalOrders++;
    grandTotal += order.total_amount;
    totalDiscountAmount += order.discount;

    if (order.payment_type_id === 2) { // Assuming 2 is Cash
      totalCashAmount += order.total_amount;
    } else if (order.payment_type_id === 3) { // Assuming 3 is Card
      totalCardAmount += order.total_amount;
    } else if (order.payment_type_id === 4) { // Assuming 4 is UPI
      totalUpiAmount += order.total_amount;
    }
  });

  document.getElementById('total_orders').value = totalOrders;
  document.getElementById('total_cash_amount').value = totalCashAmount;
  document.getElementById('total_card_amount').value = totalCardAmount;
  document.getElementById('total_upi_amount').value = totalUpiAmount;
  document.getElementById('total_discount_amount').value = totalDiscountAmount;
  document.getElementById('grand_total').value = grandTotal;
  // document.getElementById('total_canceled_orders').value = cancelledOrders;

  // Update the date based on the report day
  const dateElement = document.getElementById('today_date');
  const currentDate = new Date();
  if (day === 'yesterday') {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  dateElement.textContent = currentDate.toLocaleDateString();
}

function printReport() {
  window.print();
}