
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


// thsi code is to flech the data from category and products(i)
const paymentLabels = document.querySelectorAll('.radio-button__label');
let selectedPaymentText = ""; // Initialize for clarity

const firstRadio = document.querySelector('.radio-button__input'); // Select the first radio button
firstRadio.checked = true; 
const firstLabel = firstRadio.nextElementSibling; // Get the label associated with the first radio button
selectedPaymentText = firstLabel.textContent.trim(); // Capture initial payment type (Cash)


paymentLabels.forEach(label => {
  const associatedRadio = label.previousElementSibling; // Get the radio button associated with the label
  associatedRadio.addEventListener('change', () => {
    if (associatedRadio.checked) {
      selectedPaymentText = label.textContent.trim(); // Get and trim the text content of the label
    }
  });
});















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

let products = [];
let cart = [];

// Function to fetch JSON data
const fetchData = (url) => fetch(url).then(response => response.json());

// Fetch category data and create category buttons
fetchData('category.json')
  .then(categories => {
    categoryItemsContainer.innerHTML = ''; // Clear existing content

    categories.forEach(category => {
      const categoryButton = document.createElement('button');
      categoryButton.classList.add('category_item'); // Add class
      categoryButton.textContent = category.c_name; // Set category name
      categoryButton.dataset.categoryId = category.categoryId; // Set data-attribute for category ID

      // Event listener for category selection
      categoryButton.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryItemsContainer.querySelectorAll('.category_item').forEach(otherButton => {
          otherButton.classList.remove('active');
        });

        // Add active class to the clicked button
        categoryButton.classList.add('active');

        // Handle category selection logic (filter products)
        const selectedCategoryId = categoryButton.dataset.categoryId;
        filterProducts(selectedCategoryId); // Call filterProducts function
      });

      categoryItemsContainer.appendChild(categoryButton);
    });

    // Set the first category as selected by default (optional)
    const firstCategoryButton = categoryItemsContainer.querySelector('.category_item');
    if (firstCategoryButton) {
      firstCategoryButton.classList.add('active');
      filterProducts(firstCategoryButton.dataset.categoryId); // Display products for the first category by default
    }
  })
  .catch(error => {
    console.error("Error fetching categories:", error);
    // Handle errors fetching the JSON file (e.g., display an error message)
  });

// Function to filter and display products based on category ID
const filterProducts = (selectedCategoryId) => {
  fetchData('products.json')
    .then(productsData => {
      products = productsData; // Store products data globally
      itemContainer.innerHTML = ''; // Clear existing products
      console.log("Fetched products:", products); // Debug log
      console.log("Selected category ID:", selectedCategoryId); // Debug log

      const filteredProducts = products.filter(product => product.c_id == selectedCategoryId);
      console.log("Filtered products:", filteredProducts); // Debug log

      if (filteredProducts.length === 0) {
        itemContainer.innerHTML = '<p class="product_empty">No Items Added in this category.</p>';
      }

      filteredProducts.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('item');
        productDiv.dataset.id = product.id; // Add data attribute for product ID
        productDiv.innerHTML = `
          <img src="${product.image}" alt="">
          <h2>${product.name}</h2>
          <div class="price">₹${product.price}</div>
          <button class="addCart">Add</button>
        `;
        itemContainer.appendChild(productDiv);
      });
    })
    .catch(error => {
      console.error("Error fetching products:", error);
      // Handle errors fetching the JSON file (e.g., display an error message)
      
    });
};

// Event listener for adding products to cart
itemContainer.addEventListener('click', (event) => {
  let positionClick = event.target;
  if (positionClick.classList.contains('addCart')) {
    let id_product = positionClick.parentElement.dataset.id;
    addToCart(id_product);
  }
});

const addToCart = (product_id) => {
  let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
  if (positionThisProductInCart < 0) {
    cart.push({
      product_id: product_id,
      quantity: 1
    });
  } else {
    cart[positionThisProductInCart].quantity += 1;
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
    <img src="/code/images/card.png" class="empty-cart-icon">
    `;

    // Append the empty cart div to the appropriate container (replace `listCartHTML` with your actual container)
    listCartHTML.appendChild(emptyCartDiv);
  } else {
    cart.forEach(item => {
      totalQuantity += item.quantity;
      totalPrice += item.quantity * products.find((value) => value.id == item.product_id).price;
      let newItem = document.createElement('div');
      newItem.classList.add('item');
      newItem.dataset.id = item.product_id;

      let positionProduct = products.findIndex((value) => value.id == item.product_id);
      let info = products[positionProduct];
      listCartHTML.appendChild(newItem);
      newItem.innerHTML = `
      <div class="image">
          <img src="${info.image}">
      </div>
      <div class="name">
      ${info.name}
      </div>
      
      <div class="quantity">
          <span class="minus"><</span>
          <span>${item.quantity}</span>
          <span class="plus">></span>
      </div>
      <div class="totalPrice">₹${info.price * item.quantity}.00</div>
      `;
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
printButton.addEventListener('click', () => {
  // Get cart details
  
  let totalQuantity = 0;
  let itemizedBill = "";
  let itemizedAmt = ""; // String to store item details

  // Loop through cart items and build itemized bill content
  cart.forEach((item) => {
    const product = products.find((value) => value.id == item.product_id);
    totalQuantity += item.quantity;
  
    // Build the itemized bill string with a newline at the end
    const itemizedBillEntry = `>${item.quantity} x ${product.name}<br/>`;
    itemizedBill += itemizedBillEntry;
  
    // Build the itemized price string with a newline at the end
    const formattedPrice = product.price.toFixed(2);
    const itemizedAmtEntry = `(₹) ${formattedPrice}<br>`;
    itemizedAmt += itemizedAmtEntry;
  });


  const dineInText = isActiveButton === "dinein" ? " (Dine In)" : " (Pickup)";
  const paymentLine = `Payment Type : ${selectedPaymentText}`;

  // Calculate total price for all items in the cart
  let totalPrice = 0;
  cart.forEach((item) => {
    totalPrice += item.quantity * products.find((value) => value.id == item.product_id).price;
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
  const dateString = new Date().toISOString().slice(0, 10);//time string banana *****************************************************
  const billNumber = `${nextBillNumber.toString().padStart(4, "0")}`;

  const now = new Date();
const formattedTime = now.toLocaleTimeString();

  // Update nextBillNumber and store in localStorage
  nextBillNumber++;
  localStorage.setItem('nextBillNumber', nextBillNumber);


  // Create a printable bill content
  let billContent = `
  <!DOCTYPE html>
  <html lang="en" >
  <head>
    <meta charset="UTF-8">
    <title>The Receipt</title>
    <link rel="stylesheet" href="css code/menupage.css">
  
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
    <p class="bill-type">Order type : ${dineInText}</p>
    <p class="bill-payment-type">${paymentLine}</p>
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
    <p class="bill-footer-2">Please visit agian :)</p>
    <br>

</div>
</body>
</html>








  `;

  // Open a new print window and set its content
  const printWindow = window.open();
  printWindow.document.write(billContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print(); // Trigger print dialog


  cart.length = 0; // Empty the cart array
  addCartToHTML(); // Recalculate and re-render cart items (clears existing ones)
  addCartToHTML();
  addCartToMemory();

 

});

// Call the addCartToHTML function to update the cart display







  

listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if(positionClick.classList.contains('minus') || positionClick.classList.contains('plus')){
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if(positionClick.classList.contains('plus')){
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
})
const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if(positionItemInCart >= 0){
        let info = cart[positionItemInCart];
        switch (type) {
            case 'plus':
                cart[positionItemInCart].quantity = cart[positionItemInCart].quantity + 1;
                break;
        
            default:
                let changeQuantity = cart[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                    cart[positionItemInCart].quantity = changeQuantity;
                }else{
                    cart.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToHTML();
    addCartToMemory();
}

const initApp = () => {



    // get data product
    fetch('products.json')
    .then(response => response.json())
    .then(data => {
        products = data;
        

        // get data cart from memory
        if(localStorage.getItem('cart')){
            cart = JSON.parse(localStorage.getItem('cart'));
            addCartToHTML();
        }
     
    })
}
initApp();