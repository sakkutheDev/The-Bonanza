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


//this code is for the category select 

let dropdownBtn = document.getElementById("drop-text");
let list = document.getElementById("list");
let span = document.getElementById("span");
let listItmes = document.querySelectorAll(".dropdown-list-item");

//show dropdown list on click on dropdown
dropdownBtn.onclick = function () {
    //rotate arrow icon
    if(list.classList.contains("show")){
        icon.style.rotate = "-0deg";
    } else {

        icon.style.rotate = "-180deg";
    }
    list.classList.toggle("show");
};

//hide dropdown list when click outside dropdown btn
window.onclick = function (e) {
    if (e.target.id !== "drop-text" && e.target.id !== "span" && e.target.id !== "icon") {
        list.classList.remove("show");
        icon.style.rotate = "0deg";
    }
};

for(item of listItmes){
    item.onclick = function(e){
        //change dropdown btn text on click on selected list item
        span.innerText = e.target.innerText;
    }
}