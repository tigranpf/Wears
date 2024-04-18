var urlJSON = "assets/data/";
var urlImg = 'assets/images/';
var urlOnline ='/Wears/';


navItems = [];
products = [];
categories = [];
ratings = [];


function getCurrentPageURL() {
  return window.location.href;
}

function isIndexPage() {
  return getCurrentPageURL().endsWith("index.html");
}

function isShopPage() {
  return getCurrentPageURL().endsWith("shop.html");
}

function isCartPage() {
  return getCurrentPageURL().endsWith("cart.html");
}


function getDataPromise(fileName){
  return new Promise((resolve, reject)=> {
      $.ajax({
          url: urlOnline+urlJSON + fileName,
          method: "get",
          dataType: "json", 
          success: function(response){
              resolve(response);
          },
          error: function(xhr, exception){
          var message = "";
          if (xhr.status === 0) {
              message = 'No internet connection.';
          } else if (xhr.status == 404) {
              message = 'Page not available.';
          } else if (xhr.status == 500) {
              message = 'Server error.';
          } else if (exception === 'parsererror') {
              message = 'Database error.';
          } 
          console.log(message);
          }
      });
  })
}

window.onload = async function(){

  navItems = await getDataPromise(`nav.json`);
  products = await getDataPromise(`products.json`);
  categories = await getDataPromise(`categories.json`);
  ratings = await getDataPromise(`ratings.json`);
  generateNavItems(navItems); 
  showNumProductsInCart();


if (isIndexPage()) {
  generateFeaturedProducts();
  addToCart();
  updateCountdown();
} 

if (isShopPage()) {
  $productsContainer = document.querySelector('.products__container');

  generateCheckboxes(products);
  filterProducts(products, $productsContainer);
  addToCart();
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      filterProducts(products, $productsContainer);;
    });   
  });

  const $searchKeyword = document.querySelector("#searchProduct");
  $searchKeyword.addEventListener("input", function(event) {
    searchKeyword = event.target.value;
    filterProducts(products, $productsContainer);
});

const $sortOption = document.querySelector("#sortOption");
$sortOption.addEventListener("change", function(event) {
  filterProducts(products, $productsContainer);
});

$("#clear").click(clearFilters);
}

else if (isCartPage()) {
  populateCartFromLocalStorage();
  document.querySelector("#btnOrder").addEventListener("click",printModalOrder);
  const formaObj = document.querySelector("#contactForm");
  var inputFormObjects = formaObj.querySelectorAll(`input[type='text'],input[type='email']`);
  checkFormOnBlur(inputFormObjects);

  if (numProdutcsCart() == 0) {
    var cartTotalElement = document.querySelector('.cart__total');
    if (cartTotalElement) {
      cartTotalElement.style.display = 'none';
    }
  }

}
}

const navMenu = document.getElementById('nav-menu'),
  navToggle = document.getElementById('nav-toggle'),
  navClose = document.getElementById('nav-close')

if(navToggle){
  navToggle.addEventListener('click', () => {
    navMenu.classList.add('show-menu');
  });
}


if(navClose){
  navClose.addEventListener('click', () => {
    navMenu.classList.remove('show-menu');
  });
}

function getCurrentPageFullPath() {
  const urlParts = getCurrentPageURL().split('/');
  return urlParts[urlParts.length - 1];
}

function setActiveLink() {
  const currentPageFullPath = getCurrentPageFullPath();
  const navLinks = document.querySelectorAll('.nav__link');

  navLinks.forEach(link => {
    const linkFilename = link.getAttribute('href').split('/').pop();
    if (linkFilename === currentPageFullPath) {
      link.classList.add('active-link');
    } else {
      link.classList.remove('active-link');
    }
  });
}

function generateNavItems(navItems) {
  let html = '';

  navItems.forEach(item => {
      html += `
          <li class="nav__item">
              <a href="${item.href}" class="nav__link">${item.name}</a>
          </li>
      `;
  });

  const ulElement = document.querySelector('.nav__list');
  
  ulElement.innerHTML = html;
  setActiveLink();
}

function generateProducts(products, parent){
  let html = '';


  for(var p of products){
    let ratingStars = '';
    for (let i = 0; i < p.rating; i++) {
      ratingStars += `<i class='bx bxs-star'></i>`;
    }
      for (let i = p.rating; i < 5; i++) {
        ratingStars += `<i class='bx bxs-star star__empty'></i>`;
   }
    html +=`<div class="product__item">
    <div class="product__banner">
      <div class="product__images" data-id="${p.id}">
        <img src="${urlOnline+p.images[0].href}" alt="${p.images[0].href}" class="product__img default">

        <img src="${urlOnline+p.images[1].href}" alt="${p.images[1].href}"  class="product__img hover">
      </div>

      

    </div>

    <div class="product__content">
      <span class="product__category">${categories.filter(x=>x.id==p.category)[0].name}</span>
      <div>
        <h3 class="product__title">${p.name}</h3>
      </div>
      <div class="product__rating">
        ${ratingStars}
        
      </div>
      <div class="product__price flex">
        <span class="new__price">$${p.price.new}</span>
        <span class="old__price">$${p.price.old}</span>
      
      </div>

      <button class="action__btn cart__btn" aria-label="Add To Cart" data-id="${p.id}">
        <i class='bx bx-shopping-bag'></i>
      </button>
    </div>
  </div>`;
  }

  parent.innerHTML = html;
}

function generateFeaturedProducts(){
  products.sort((a, b) => b.rating - a.rating);
  const topRatedProducts = products.slice(0, 8);

  parent = document.querySelector('.products__container')

  generateProducts(topRatedProducts, parent)
}

function generateCheckboxes(){
  let html = '';
  let parent = document.querySelector("#chbContainer");

  let arrayContent = ["Categories","Ratings"];

  let chooseCategory = categories;
  let chooseRating = ratings;

  var arrayCb = [chooseCategory,chooseRating];
  html = `<div class="row">`;
  for(var i in arrayCb){
      html+=`<div class="col-lg-12 col-6"><h4 class="my-3">${arrayContent[i]}</h4>
      <div id="chb${arrayContent[i].split(' ')[0]}">`
      for(let it of arrayCb[i]){
          html+=`<div class="form-check">
                      <input class="form-check-input" type="checkbox" name="chb${arrayContent[i].split(' ')[0]}" value="${it.id}" id="chb${arrayContent[i].split(' ')[0]}${it.id}" />
                      <label class="form-check-label ms-3" for="chb${arrayContent[i].split(' ')[0]}${it.id}">
                      ${it.name}
                  </label>
                  </div>`;
                  
      }           
      html+=` </div></div>`; 

  }
  html+=`</div><button id='clear' class="btn w-100 rounded-0 my-4 rounded-bottom fs-6" > Clear filters  </button>`;
  
  parent.innerHTML=html;

}

function filterProducts(products, parent) {

  const selectedCategories = Array.from(document.querySelectorAll('input[name="chbCategories"]:checked')).map(checkbox => parseInt(checkbox.value));
  const selectedRatings = Array.from(document.querySelectorAll('input[name="chbRatings"]:checked')).map(checkbox => parseInt(checkbox.value));
  const searchKeyword = document.querySelector('#searchProduct').value;
  const $resultInfo = document.querySelector("#resultInfo");
  const $sortOption = document.querySelector("#sortOption").value;
  let filteredProducts;


  if (selectedCategories.length === 0 && selectedRatings.length === 0 && !searchKeyword.trim()) {
    // Show all products if nothing is selected and searchKeyword is empty
    filteredProducts = products;
} else {
    filteredProducts = products.filter(product => {
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const ratingMatch = selectedRatings.length === 0 || selectedRatings.includes(product.rating);
        const nameMatch = !searchKeyword.trim() || product.name.toLowerCase().includes(searchKeyword.toLowerCase());
        return categoryMatch && ratingMatch && nameMatch;
    });
}

let sortedProducts = [...filteredProducts];
if ($sortOption === 'nameAsc') {
    sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
} else if ($sortOption === 'nameDesc') {
    sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
} else if ($sortOption === 'priceAsc') {
    sortedProducts.sort((a, b) => a.price.new - b.price.new);
} else if ($sortOption === 'priceDesc') {
    sortedProducts.sort((a, b) => b.price.new - a.price.new);
}

if (filteredProducts.length > 0) {
  $resultInfo.innerHTML = `We found <span>${filteredProducts.length} </span> product${filteredProducts.length === 1 ? '' : 's'} for you`;
} else {
  $resultInfo.innerHTML = '<span>No products found</span> for given parameters.';
}

return generateProducts(sortedProducts, parent);
 
}

function clearFilters(){
  document.querySelectorAll("#chbContainer input[type='checkbox']").forEach((elem)=>elem.checked=false);
  document.querySelector("#searchProduct").value='';
  document.querySelector("#sortOption").selectedIndex=0;
  $productsContainer = document.querySelector('.products__container');
  filterProducts(products, $productsContainer);
}


function setLS(name,data){
  localStorage.setItem(name,JSON.stringify(data));
}
function getLS(name){
  return JSON.parse(localStorage.getItem(name));
}

function numProdutcsCart(){
  return JSON.parse(localStorage.getItem("cart"))==null?0:JSON.parse(localStorage.getItem("cart")).length
}

function showNumProductsInCart(){
  document.querySelector("#cart-count").innerHTML = numProdutcsCart();
}

function addToCart(){
  $(".action__btn.cart__btn").click(function(){
    console.log('alo');
      addProduct(this.dataset.id);
  })
}

function addProduct(id){
  let productsCart = getLS("cart");
  let checkCart = 0;
  if(productsCart!=null) checkCart=productsCart.filter(x=>x.id==id).length;

  if(productsCart!=null){
      if(checkCart>0){
          updateQuantity(id,productsCart);
      }else{
          productAddCart(id,productsCart);
          showNumProductsInCart();
      }
  }else{
      productAddCart(id,[]);
      showNumProductsInCart();
  }
  cartAddedAlert();
}

function updateQuantity(id,productsInCart){
  for(el of productsInCart){
      if(el.id==id) {
          el.quantity++;
          break;
      }
  }
  setLS("cart",productsInCart);
}


function productAddCart(id,productsInCart){
  let newProduct = products.filter(x=>x.id==id)[0];
  productsInCart.push({
      id: newProduct.id,
      name: newProduct.name,
      price: newProduct.price.new,
      image :newProduct.images[0],
      quantity:1
  })

  setLS("cart",productsInCart);
}
function cartAddedAlert(){
  divObj = document.querySelector("#cartAlert");
  divObj.classList.remove("d-none");
  divObj.classList.add("alert-opacity");
  divObj.classList.remove("alert-opac-0");
  setTimeout(function(){
    divObj.classList.remove("alert-opacity");
    divObj.classList.add("alert-opac-0");
      setTimeout(()=>divObj.classList.add("d-none"),750);
  },1500);
}

function populateCartFromLocalStorage() {
  if (numProdutcsCart() == 0) {
    var cartTotalElement = document.querySelector('.cart__total');
    if (cartTotalElement) {
      cartTotalElement.style.display = 'none';
    }
  }

  var cartItems = JSON.parse(localStorage.getItem("cart"));

  var table = document.querySelector(".table");

  function calculateSubtotal(item) {
    return item.price * item.quantity;
  }

  function calculateTotal(cartItems) {
    var total = 0;
    cartItems.forEach(function(item) {
      total += item.subtotal;
    });
    return total;
  }

  if (cartItems && cartItems.length > 0) {
    var tableHTML = "";
    cartItems.forEach(function(item) {
      item.subtotal = calculateSubtotal(item);
      tableHTML += generateCartItemHTML(item);
    });
    table.innerHTML += tableHTML;

    var cartSubtotal = document.querySelector(".cart__total-price");
    cartSubtotal.textContent = "$" + calculateTotal(cartItems).toFixed(2);
  } else {
    table.innerHTML = "<tr><td colspan='6'>Your cart is empty</td></tr>";
  }

  $("table .delete-btn").click(function(){
    deleteFromLS($(this).data("id"));
    console.log($(this).data("id"));
})

  $("input[type=number]").bind("blur change",function(){
   var itemId = Number($(this).data("item-id")); 
   var newQuantity = Number(this.value);
   if (newQuantity < 1) {
    newQuantity = 1; 
    this.value = newQuantity;
}
   var cartItems = getLS("cart");
   var itemToUpdate = cartItems.find(item => item.id === itemId);
   if (itemToUpdate) {
       itemToUpdate.quantity = newQuantity;
   }

    setLS("cart", cartItems);
    showEmptyCart();
    populateCartFromLocalStorage();
    
})
}

function generateCartItemHTML(item) {
  return `
    <tr>
      <td>
        <img src="${item.image.href}" alt="" class="table__img">
      </td>
      <td>
        <h3 class="table__title">${item.name}</h3>
      </td>
      <td><span class="table__price">$${item.price}</span></td>
      <td><input type="number" class="quantity" value="${item.quantity}" data-item-id="${item.id}"></td>
      <td><span class="table__subtotal">$${item.subtotal}</span></td>
      <td><i class="bx bx-trash table__trash delete-btn" data-id="${item.id}"></i></td>
    </tr>
  `;
  
}

function showEmptyCart(){
  document.querySelector(".table").innerHTML = `<thead>
  <th>Image</th>
  <th>Name</th>
  <th>Price</th>
  <th>Quantity</th>
  <th>Subtotal</th>
  <th>Remove</th>
</thead>`

var cartSubtotal = document.querySelector(".cart__total-price");
    cartSubtotal.innerHTML = "$0";
}

function deleteFromLS(id) {
  items = getLS("cart");
  items.filter(x=>x.id==id)[0].quantity=0;
  newItems = items.filter(x=>x.quantity>0);
  setLS('cart', newItems);
  showEmptyCart();
  populateCartFromLocalStorage();
  showNumProductsInCart();
}



const endTime = new Date('2024-05-01T00:00:00Z').getTime();

function updateCountdown() {
  const countdownInterval = setInterval(updateCountdown, 1000);
  const now = new Date().getTime();
  const timeDifference = endTime - now;

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  document.getElementById('days').innerText = formatTime(days);
  document.getElementById('hours').innerText = formatTime(hours);
  document.getElementById('minutes').innerText = formatTime(minutes);
  document.getElementById('seconds').innerText = formatTime(seconds);

  if (timeDifference <= 0) {
    clearInterval(countdownInterval);
  }
}
function formatTime(time) {
  return time < 10 ? `0${time}` : time;
}

function generateModalOrder(obj){
  $(obj).addClass("d-block");
  $(obj).animate({opacity:"1"},100);
  $('<div id="modalBg" class="modal-backdrop fade show"></div>').appendTo($("body"));

  $($(obj).find(".btn-close,.btn-secondary")).click(function(){
      let $p = $(this).parent().parent().parent().parent();
      $p.animate({opacity:"0"},100);
      setTimeout(function(){$($p).removeClass("d-block");},300);
      $('#modalBg').remove();
  })
  $("#buttonCheck").click(checkForm);
  
}

function printModalOrder(){
  let obj = document.querySelector("#orderModal");
  generateModalOrder(obj);
}

function checkFormOnBlur(inputFormObjects){
  const formaSelect = document.querySelector("select");
  var divCbx = document.querySelector(".form-floating.col-md-12 > .row");
  formaSelect.addEventListener('change',function(){
      let pom = Number(formaSelect.value);
      // console.log(pom);
      if(pom){
          
          
          // console.log(pom);
          // console.log(divCbx);

          if(pom==2){
              divCbx.innerHTML = ` <div class="form-floating col-md-12">
                  <input type="text" class="form-control" id="address" placeholder="Novoseljanski put 12"/>
                  <label for="address" class="form-label ps-4">Address <span class="text-danger"><i class="fa-regular fa-asterisk"></i></span></label>
                  <small class="text-danger mt-2 mb-0"></small>
              </div><div class="form-floating col-md-12 mt-3">
              <input type="text" class="form-control" id="city" placeholder="Belgrade"/>
              <label for="city" class="form-label ps-4">City <span class="text-danger"><i class="fa-regular fa-asterisk"></i></span></label>
              <small class="text-danger mt-2 mb-0"></small>
          </div>`;
              divCbx.classList.remove('d-none');
          }else{
              divCbx.innerHTML = ``;
              divCbx.classList.remove("d-none");
          }
       }else{
           formaSelect.previousElementSibling.classList.add("text-danger");
           formaSelect.previousElementSibling.classList.remove("text-success");
           divCbx.classList.add('d-none');
       }
  })
  
  inputFormObjects.forEach(function(element){
      element.addEventListener('blur',function(){
      if(!element.value.length){
          bool = false;
          element.classList.add("form-border");
          element.nextElementSibling.nextElementSibling.innerHTML = 'You haven\'t filled in the field.';
          element.nextElementSibling.nextElementSibling.classList.remove('d-none');
      }else{
          element.nextElementSibling.nextElementSibling.classList.add('d-none');
          checkFormElement(element);
      }
      
  })});
}

function checkFormElement(element){
  let check = true;
  //	0XX XXXX XXX
  let regexPhone = /^(06[^7]\/[0-9]{7})|(067\/7[0-9]{6})$/;
  let regexMail = /^[\w\_]{3,}\@[a-z]{3,}\.[a-z]{2,3}$/;
  let regexName = /^([A-ZČĆŽŠĐ][a-zčćžšđ]{2,})(\s[A-ZČĆŽŠĐ][a-zčćžšđ]{2,})*$/;
  let regexAddress = /^(((\d{2,4}\.?)((\s(([a-zčćžšđ]{3,}))+))+))|(([A-ZČĆŽŠĐ][a-zčćžšđ]{2,})(\s(\w+))*)$/;

          var name = /(?=(name|surname|city))/;
          if(element.id.match(name)){
            check = regexName.test(element.value);
              element.parentElement.lastElementChild.innerHTML ='You haven\'t filled in the field in the correct format (first letter capitalized, others lowercase).';
          }
          if(element.id =='email' || element.id =='email'){
            check = regexMail.test(element.value);
              element.parentElement.lastElementChild.innerHTML ='You haven\'t filled in the field in the correct format (example@gmail.com).';
          }
          if(element.id =='phone'){
              check = regexPhone.test(element.value);
              element.parentElement.lastElementChild.innerHTML ='You haven\'t filled in the field in the correct format (063/1235222).';
          }
          if(element.id =='address'){
            check = regexAddress.test(element.value);
              element.parentElement.lastElementChild.innerHTML ='You haven\'t filled in the field in the correct format  (npr. Street 27 ili 21 Street)';

          }
          if(!check){
              element.parentElement.lastElementChild.classList.remove('d-none');
              
          }else{
              element.parentElement.lastElementChild.classList.add('d-none');
          }
  return check;
}

function checkForm(){
  var bool = true;
  let inputFormObjects = this.parentElement.parentElement.querySelectorAll("input[type='text'],input[type='email']");
  let selectFormObject = document.querySelector("select");
  let radioObj = document.getElementsByName("contactType");
  let isSelected = false;

for (let i = 0; i < radioObj.length; i++) {
    if (radioObj[i].checked) {
        isSelected = true;
        break;
    }
}

if(selectFormObject.selectedIndex){
  selectFormObject.parentElement.lastElementChild.innerHTML = "";
}else {bool = false;  selectFormObject.parentElement.lastElementChild.innerHTML ='You haven\'t filled in the preferred delivery option.';};

  inputFormObjects.forEach((element,index) =>{
      if(!element.value.length){
          bool = false;
          element.nextElementSibling.nextElementSibling.innerHTML = 'You haven\'t filled in the field.';
          element.nextElementSibling.nextElementSibling.classList.remove('d-none');
      }else{
          if(!checkFormElement(element))bool=false;
      }
  });

  let br = 0;
 
  if(!isSelected){
      radioObj[0].parentElement.parentElement.nextElementSibling.classList.remove('d-none');
      bool = false;
      radioObj[0].parentElement.parentElement.lastElementChild.innerHTML ='You haven\'t filled in the preferred method of communication.';
  }else {
      radioObj[0].parentElement.parentElement.nextElementSibling.classList.add('d-none');
      radioObj[0].parentElement.parentElement.lastElementChild.innerHTML = "";
      
  }
  if(bool){
      this.parentElement.parentElement.innerHTML = `<p class="fs-3 fw-bold text-success">Your order is placed successfully!</p>`;
      
      setTimeout(function(){
          let $p = $("#orderModal");
          $p.animate({opacity:"0"},300);
          setTimeout(function(){$($p).removeClass("d-block");},200);
          $('#modalBg').remove();
          localStorage.clear();
          populateCartFromLocalStorage();
      },2000);

  }else{
      this.previousElementSibling.classList.add("text-danger")
      this.previousElementSibling.classList.remove("text-success");
      this.previousElementSibling.innerHTML = "You haven't filled in the form correctly!";
  }
  this.previousElementSibling.classList.remove("d-none");
}





