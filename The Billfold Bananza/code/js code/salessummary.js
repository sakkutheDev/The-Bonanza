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
  const ordersUrl = day === 'yesterday' ? '/yesterday_orders' : '/today_orders';
  const canceledOrdersUrl = day === 'yesterday' ? '/yesterday_canceled_orders' : '/today_canceled_orders';

  Promise.all([
    fetch(ordersUrl).then(response => response.json()),
    fetch(canceledOrdersUrl).then(response => response.json())
  ])
  .then(([ordersData, canceledOrdersData]) => {
    if (ordersData.success && canceledOrdersData.success) {
      displayReport(ordersData.orders, canceledOrdersData.cancelledOrders, day);
    } else {
      console.error('Error fetching sales report:', ordersData.error || canceledOrdersData.error);
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

  const totalOrdersElem = document.getElementById('total_orders');
  const totalCashAmountElem = document.getElementById('total_cash_amount');
  const totalCardAmountElem = document.getElementById('total_card_amount');
  const totalUpiAmountElem = document.getElementById('total_upi_amount');
  const totalDiscountAmountElem = document.getElementById('total_discount_amount');
  const totalCanceledOrdersElem = document.getElementById('total_canceled_orders');
  const totalCanceledOrdersAmountElem = document.getElementById('total_canceled_orders_amount');
  const grandTotalElem = document.getElementById('grand_total');
  const dateElement = document.getElementById('today_date');

if (totalOrdersElem) totalOrdersElem.value = totalOrders;
if (totalCashAmountElem) totalCashAmountElem.value = totalCashAmount.toFixed(2);
if (totalCardAmountElem) totalCardAmountElem.value = totalCardAmount.toFixed(2);
if (totalUpiAmountElem) totalUpiAmountElem.value = totalUpiAmount.toFixed(2);
if (totalDiscountAmountElem) totalDiscountAmountElem.value = totalDiscountAmount.toFixed(2);
if (totalCanceledOrdersElem) totalCanceledOrdersElem.value = cancelledOrders.length; // Assuming this should be fixed to 0 decimal places
if (totalCanceledOrdersAmountElem) totalCanceledOrdersAmountElem.value = cancelledOrders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2);
if (grandTotalElem) grandTotalElem.value = grandTotal.toFixed(2);


  // Update the date based on the report day
  const currentDate = new Date();
  if (day === 'yesterday') {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  if (dateElement) dateElement.textContent = currentDate.toLocaleDateString('en-GB');
}

function printReport() {
  const reportContent = `
    Sales Report
    Date: ${document.getElementById('today_date').textContent}

    Total Orders: ${document.getElementById('total_orders').value}
    Total Cash Amount: ₹${document.getElementById('total_cash_amount').value}
    Total Card Amount: ₹${document.getElementById('total_card_amount').value}
    Total UPI Amount: ₹${document.getElementById('total_upi_amount').value}
    Total Discount Amount: ₹${document.getElementById('total_discount_amount').value}
    Total Canceled Orders: ${document.getElementById('total_canceled_orders').value}
    Total Canceled Orders Amount: ₹${document.getElementById('total_canceled_orders_amount').value}
    Grand Total: ₹${document.getElementById('grand_total').value}
  `;

  // Create a new window with the report content
  const printWindow = window.open('', '_blank');
  printWindow.document.open();
  printWindow.document.write(`
  <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>The Receipt</title>
          <style>
          
                .bill {
                  text-align: center;
                  width: 340px;
                  margin: 0 auto;
                  background-color: rgb(229, 237, 243);
                }

                .bill-header {
                  font-size: 18px;
                  padding: 0;
                  margin: 0;


                }
                .report-date{
                  font-size: 15px;
                  display: inline;
                  padding-right:200px;
                

                }


                .bill-items {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 10px;
                }

                .bill-items td{
                  font-size: 12px;

                }


                .bill-items th,
                .bill-items td {
                  padding: 0.5rem;
                  border-bottom: 1px solid #ddd;
                  text-align: left;

                }

                .bill-items th:first-child,
                .bill-items td:first-child {
                  width: 75%;
                  
                }

                .bill-items th:last-child,
                .bill-items td:last-child {
                  width: 25%;
                }




                .bill-footer {
                  margin-top: 1rem;
                  font-size: 0.8rem;
                  margin-bottom: 20px
                }
          </style>
        </head>
        <body>
          <div class="bill">
          <br>
          ****************************************** <h1 class="bill-header">Sales Report</h1>******************************************
          <br>
          <br>
          <p class="report-date">Date : ${document.getElementById('today_date').textContent}</p>
          <hr>
          <table class="bill-items">
              <thead>
                  <tr>
                      <th>Orders</th>
                      <th>(₹)Total Amount </th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>Total Bills</td>
                      <td>${document.getElementById('total_orders').value}</td>
                  </tr>  
                  <tr>
                    <td>Cash Amount</td>
                    <td>₹${document.getElementById('total_cash_amount').value}</td>
                </tr>  
                <tr>
                    <td>Card Amount</td>
                    <td>₹${document.getElementById('total_card_amount').value}</td>
                </tr>  
                <tr>
                    <td>UPI Amount</td>
                    <td>₹${document.getElementById('total_upi_amount').value}</td>
                </tr>  
                <tr>
                    <td>Discount Amount</td>
                    <td>₹${document.getElementById('total_discount_amount').value}</td>
                </tr>  
                <tr>
                    <td>Cancelled Bills</td>
                    <td>${document.getElementById('total_canceled_orders').value}</td>
                </tr>  
                <tr>
                    <td>Cancelled Bill Amount</td>
                    <td>₹${document.getElementById('total_canceled_orders_amount').value}</td>
                </tr>  
                <tr>
                    <td>Total Sales</td>
                    <td>₹${document.getElementById('grand_total').value}</td>
                </tr>  
              </tbody>
          </table>
          <hr>
         
          <p class="bill-footer">*****************THANK YOU!*****************</p>
          <br>
        </div>
        </body>
        </html>
  `);
  printWindow.document.close();

  // Wait for the window content to be fully loaded before printing
  printWindow.onload = function() {
    printWindow.print();
    printWindow.onafterprint = function() {
      printWindow.close();
    };
  };
}

