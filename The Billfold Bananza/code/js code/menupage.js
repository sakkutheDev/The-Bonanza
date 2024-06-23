
// Functionality to handle dine-in/pickup button selection and color change

const buttons = document.querySelectorAll(".button");

let isActiveButton = "dinein"; // Set "dinein" as default

// Add "active" class to the first button initially (optional)
buttons[0].classList.add("active"); // Assuming the first button is "Dine In"

buttons.forEach(button => {
  button.addEventListener("click", () => {
    // Remove "active" class from all buttons
    buttons.forEach(otherButton => otherButton.classList.remove("active"));

    // Add "active" class to the clicked button
    button.classList.add("active");

    // Update isActiveButton based on the clicked button
    if (button.classList.contains("dinein")) {
      isActiveButton = "dinein";
    } else if (button.classList.contains("pickup")) {
      isActiveButton = "pickup";
    } else {
      console.warn("Unexpected button class. Please use 'dinein' or 'pickup'.");
    }
  });
});


//code for the discount slide..
const disBut = document.querySelector('.dis_but');
const discount = document.querySelector('.discount');
const disinput = document.querySelector('.discount_input')

disBut.addEventListener('click', () => {
  discount.classList.toggle('show');
  disBut.classList.toggle('show');
  // disinput.classList.toggle('show');

});


//code for discount validation
 const discountInput = document.querySelector('.discount_input');

  discountInput.addEventListener('keyup', (event) => {
    const value = event.target.value;
    discountInput.value = value.replace(/[^0-9]/g, '');  // Allow only numbers and add "%" at the end

    let newValue = Math.max(0, Math.min(50, parseInt(value, 10) || 0)); // Default to 0 for non-numeric input

    discountInput.value = newValue + '.00%';
    
  });


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

const paymentTypeMap = {
  'Cash': 2,
  'Card': 3,
  'UPI': 4
  // Add other payment types as needed
};

const paymentLabels = document.querySelectorAll('.radio-button__label');
let selectedPaymentId = 2; // Default to 'Cash' which maps to ID 1
let selectedPaymentText = 'Cash'; // Default to 'Cash'

const firstRadio = document.querySelector('.radio-button__input'); // Select the first radio button
firstRadio.checked = true;
const firstLabel = firstRadio.nextElementSibling; // Get the label associated with the first radio button
selectedPaymentId = paymentTypeMap[firstLabel.textContent.trim()]; // Capture initial payment type ID (Cash)
selectedPaymentText = firstLabel.textContent.trim(); // Capture initial payment type text (Cash)

paymentLabels.forEach(label => {
  const associatedRadio = label.previousElementSibling; // Get the radio button associated with the label
  associatedRadio.addEventListener('change', () => {
    if (associatedRadio.checked) {
      const paymentText = label.textContent.trim(); // Get and trim the text content of the label
      selectedPaymentId = paymentTypeMap[paymentText]; // Get the corresponding ID
      selectedPaymentText = paymentText; // Update selected payment text
    }
  });
});









//Here is the real magic starts fleching the data from the database . oooh yeh excited










// this code here ,eat my head and at the same time this mf google ,chatGPT and this Bard-AI they are also just f with me :(

// then finally it worked ,after 1 hole f weeks. That was alot of time for me to spend on this MF code :(
  const categoryItemsContainer = document.querySelector('.category_items');
  const itemContainer = document.getElementById('item_container');
  const listProductHTML = document.querySelector('.listProduct');
  const listCartHTML = document.querySelector('.listCart');
  const cartTotalSpan = document.querySelector('.total_div span');
  const discountAmountInput = document.querySelector('#discountAmount');
  const totalDiscountSpan = document.querySelector('#totalDiscountSpan');
  const clearButton = document.getElementById('clear-cart-button');
 
  
  let menu_items = [];
  let cart = [];
  
  // Function to fetch data from the API
  // Function to fetch data from the API
  const fetchData = (url) => fetch(url).then(response => response.json());


  // Fetch category data and create category buttons
  fetchData('/categories')
  .then(categories => {
    categoryItemsContainer.innerHTML = '';

    categories.forEach(category => {
      const categoryButton = document.createElement('button');
      categoryButton.classList.add('category_item');
      categoryButton.textContent = category.cat_name;
      categoryButton.dataset.categoryId = category.cat_id;

      categoryButton.addEventListener('click', () => {
        categoryItemsContainer.querySelectorAll('.category_item').forEach(otherButton => {
          otherButton.classList.remove('active');
        });

        categoryButton.classList.add('active');
        filterMenuItems(categoryButton.dataset.categoryId);
      });

      categoryItemsContainer.appendChild(categoryButton);
    });

    const firstCategoryButton = categoryItemsContainer.querySelector('.category_item');
    if (firstCategoryButton) {
      firstCategoryButton.classList.add('active');
      filterMenuItems(firstCategoryButton.dataset.categoryId);
    }
  })
  .catch(error => {
    console.error("Error fetching categories:", error);
  });

  
  // Function to filter and display menu items based on category ID
  const filterMenuItems = (selectedCategoryId) => {
    fetchData('/menu_items')
      .then(menuItemsData => {
        menu_items = menuItemsData; // Store menu items data globally
        itemContainer.innerHTML = ''; // Clear existing products
        console.log("Fetched menu items:", menu_items); // Debug log
        console.log("Selected category ID:", selectedCategoryId); // Debug log
  
        const filteredMenuItems = menu_items.filter(menu_item => 
          menu_item.cat_id == selectedCategoryId && menu_item.onmenu_offmenu
      );
      console.log("Filtered menu items:", filteredMenuItems); // Debug log
  
        if (filteredMenuItems.length === 0) {
          itemContainer.innerHTML = '<p class="product_empty">No Items Added in this category.</p>';
        }
  
        filteredMenuItems.forEach(menu_item => {
          const menuItemDiv = document.createElement('div');
          menuItemDiv.classList.add('item');
          menuItemDiv.dataset.id = menu_item.id; // Add data attribute for menu item ID
          menuItemDiv.innerHTML = `
            <img src="${menu_item.item_img}" alt="">
            <h2>${menu_item.item_name}</h2>
            <div class="price">₹${menu_item.item_price}</div>
            <button class="addCart">Add</button>
          `;
          itemContainer.appendChild(menuItemDiv);
        });
      })
      .catch(error => {
        console.error("Error fetching menu items:", error);
        // Handle errors fetching the menu items
      });
  };
  
  // Event listener for adding menu items to cart
  itemContainer.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('addCart')) {
      let id_menu_item = positionClick.parentElement.dataset.id;
      addToCart(id_menu_item);
    }
  });
  
  const addToCart = (menu_item_id) => {
    let positionThisMenuItemInCart = cart.findIndex((value) => value.menu_item_id == menu_item_id);
    if (positionThisMenuItemInCart < 0) {
      cart.push({
        menu_item_id: menu_item_id,
        quantity: 1
      });
    } else {
      cart[positionThisMenuItemInCart].quantity += 1;
    }
    addCartToHTML();
    addCartToMemory();
  }
  
  const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    let totalDiscountValue = 0;
    let totalPrice = 0;
  
    if (cart.length === 0) {
      // Create the empty cart div
      let emptyCartDiv = document.createElement('div');
      emptyCartDiv.classList.add('empty-cart'); // Add a class for styling
  
      // Set the content of the empty cart div
      emptyCartDiv.innerHTML = `
      <img src="./images/card.png" class="empty-cart-icon">
      `;
  
      // Append the empty cart div to the appropriate container (replace `listCartHTML` with your actual container)
      listCartHTML.appendChild(emptyCartDiv);
    } else {
      cart.forEach(item => {
        totalQuantity += item.quantity;
        totalPrice += item.quantity * menu_items.find((value) => value.id == item.menu_item_id).item_price;
        let newItem = document.createElement('div');
        newItem.classList.add('item');
        newItem.dataset.id = item.menu_item_id;
  
        let positionMenuItem = menu_items.findIndex((value) => value.id == item.menu_item_id);
        let info = menu_items[positionMenuItem];
        listCartHTML.appendChild(newItem);
        newItem.innerHTML = `
        <div class="image">
            <img src="${info.item_img}">
        </div>
        <div class="name">
        ${info.item_name}
        </div>
        
        <div class="quantity">
            <span class="minus"><</span>
            <span>${item.quantity}</span>
            <span class="plus">></span>
        </div>
        <div class="totalPrice">₹${info.item_price * item.quantity}.00</div>
        `;
  
        // Add event listeners for the plus and minus buttons
        newItem.querySelector('.plus').addEventListener('click', () => {
          item.quantity += 1;
          addCartToHTML();
          addCartToMemory();
        });
  
        newItem.querySelector('.minus').addEventListener('click', () => {
          if (item.quantity > 1) {
            item.quantity -= 1;
          } else {
            // Optionally, remove the item from the cart if quantity is 0
            cart = cart.filter(cartItem => cartItem.menu_item_id !== item.menu_item_id);
          }
          addCartToHTML();
          addCartToMemory();
        });
      });
    }
  
    discountAmountInput.addEventListener('input', () => {
      const discountPercentage = parseFloat(discountAmountInput.value);
      totalDiscountValue = totalPrice * (discountPercentage / 100);
      totalDiscountSpan.innerText = totalDiscountValue;
      cartTotalSpan.innerText = totalPrice - totalDiscountValue;
    });
  
    cartTotalSpan.innerText = totalPrice;
  };
  
  // Attach click event listener to the clear button
  clearButton.addEventListener('click', () => {
    // Clear cart items and update UI
    cart.length = 0; // Empty the cart array
    addCartToHTML(); // Recalculate and re-render cart items (clears existing ones)
    
    addCartToMemory();
  });
  
  document.querySelector('.new_order_box').addEventListener('click', function() {
    window.location.reload();
      // Clear cart items and update UI
      cart.length = 0; // Empty the cart array
      addCartToHTML(); // Recalculate and re-render cart items (clears existing ones)
      
      addCartToMemory();
  });
 
  // Print bill button functionality
  document.addEventListener('DOMContentLoaded', () => {
    const printButton = document.getElementById('printButton');
  
    // Check if the printButton element exists
    if (!printButton) {
      console.error('Print button not found');
      return;
    }
  
    // Print bill button functionality
printButton.addEventListener('click', () => {
  // Get cart details
  let totalQuantity = 0;
  let itemizedBill = "";
  let itemizedAmt = ""; // String to store item details

  // Loop through cart items and build itemized bill content
  cart.forEach((item) => {
    const menu_item = menu_items.find((value) => value.id == item.menu_item_id);
    totalQuantity += item.quantity;

    // Build the itemized bill string with a newline at the end
    const itemizedBillEntry = `>${item.quantity} x ${menu_item.item_name}<br/>`;
    itemizedBill += itemizedBillEntry;

    // Build the itemized price string with a newline at the end
    const formattedPrice = menu_item.item_price.toFixed(2);
    const itemizedAmtEntry = `(₹) ${formattedPrice}<br>`;
    itemizedAmt += itemizedAmtEntry;
  });

  // Assume isActiveButton is set to "dinein" or "pickup"
  const orderTypeId = isActiveButton === "dinein" ? 1 : 2; // 1 for Dine In, 2 for Pickup
  

  // Calculate total price for all items in the cart
  let totalPrice = 0;
  cart.forEach((item) => {
    totalPrice += item.quantity * menu_items.find((value) => value.id == item.menu_item_id).item_price;
  });

  // Calculate discount value (only if a discount is entered)
  let totalDiscountValue = 0;
  if (discountAmountInput.value) {
    totalDiscountValue = totalPrice * (parseFloat(discountAmountInput.value) / 100);
  }

  // Retrieve nextBillNumber from localStorage or initialize to 1
  const storedNextBillNumber = localStorage.getItem('nextBillNumber');
  let nextBillNumber = storedNextBillNumber ? parseInt(storedNextBillNumber, 10) : 1;

  // Generate unique bill number
  const dateString = new Date().toISOString().slice(0, 10); // Date string
  const billNumber = `${nextBillNumber.toString().padStart(4, "0")}`;

  const now = new Date();
  const formattedTime = now.toLocaleTimeString();
  const formattedDateTime = now.toISOString().slice(0, 19).replace('T', ' '); // Format the datetime

  // Update nextBillNumber and store in localStorage
  nextBillNumber++;
  localStorage.setItem('nextBillNumber', nextBillNumber);

  // Prepare data to send to the server
  const billData = {
    date_time: formattedDateTime,
    bill_no: billNumber,
    payment_type_id: selectedPaymentId,
    discount: totalDiscountValue,
    total_amount: totalPrice - totalDiscountValue,
    order_type_id: orderTypeId,
    items: cart
  };

  // Fetch call to save the invoice
  fetch('http://localhost:5500/save_invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(billData)
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(errorInfo => {
        console.error('Server responded with an error:', errorInfo);
        throw new Error('Server error');
      });
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      console.log('Invoice saved successfully:', data);
      // Your existing code for printing the bill
      let billContent = `
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
.bill-id{
  font-size: 13px;
  display: inline;
  padding-right:135px;
  padding-left: 6px;
  
  
  
}

.bill-date{
  display: inline;
  font-size: 12px;
}

.bill-time{

  font-size: 12px;  
  padding-left: 210px;
  margin-top: 6px;
}

.bill-type{
  font-size: 12px;  
  text-align: left;
  margin-top: 6px; 
  margin-bottom: 10px;
  margin-left: 8px;


}

.bill-payment-type{
  font-size: 12px;  
  text-align: left;
  margin-top: 0px; 
  margin-left: 8px;
 

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

.bill-discount {
  
  text-align: left;
  margin-left: 8px;
  font-size: 12px;
  margin-bottom: 6px;
  

  .bill-discount__text{
      
      display: inline;
      margin-right: 200px;
   
  }

  .bill-discount__amount{
      text-align: right;
      display: inline;
  }
}
.bill-total{
  margin-top: 10px;
  margin-bottom:20px ;

  .bill-total__text {
      font-weight: bold; 
      display: inline;
      margin-right: 100px;
     
      font-size: 16px;
   
  }
  
   .bill-total__amount {
      text-align: right;
      display: inline;
      margin-right: 10px;
      font-weight: bold; 
  
  }
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
          ******************************************** <h1 class="bill-header">Order Receipt</h1>********************************************
          <br>
          <br>
          <p class="bill-id">Bill no. ${billNumber}</p>
          <p class="bill-date">Date : ${dateString}</p>
          <p class="bill-time">Time : ${formattedTime} </p>
          <p class="bill-type">Order type : ${isActiveButton === "dinein" ? "Dine In" : "Pickup"}</p>
          <p class="bill-payment-type">Payment Type: ${selectedPaymentText}</p>
          <hr>
          <table class="bill-items">
              <thead>
                  <tr>
                      <th>Items</th>
                      <th>(₹) Price </th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>${itemizedBill}</td>
                      <td>${itemizedAmt}</td>
                  </tr>  
              </tbody>
          </table>
          <hr>
          <div class="bill-discount">
            <p class="bill-discount__text">Total Items : ${totalQuantity}</p>
          </div>
          <div class="bill-discount">
            <p class="bill-discount__text"><u>Discount :</u></p>
            <p class="bill-discount__amount">₹${totalDiscountValue.toFixed(2)}</p>
          </div>
          <div class="bill-total">
              <p class="bill-total__text">TOTAL AMOUNT :</p>
              <p class="bill-total__amount">₹${(totalPrice - totalDiscountValue).toFixed(2)}</p>
          </div>
          <p class="bill-footer">*****************THANK YOU!*****************</p>
          <p class="bill-footer-2">Please visit again :)</p>
          <br>
        </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(billContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print(); // Trigger print dialog

      cart.length = 0; // Empty the cart array
      addCartToHTML(); // Recalculate and re-render cart items (clears existing ones)
      addCartToMemory();
    } else {
      console.error('Error saving invoice:', data.error);
    }
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
});

// Initialize the app
const initApp = () => {
  fetch('/menu_items')
    .then(response => response.json())
    .then(data => {
      menu_items = data;
      // Get data cart from memory
      if (localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
        addCartToHTML();
      }
    });
};

initApp();
});
