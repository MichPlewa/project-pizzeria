import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

const app = {

  activatePage: function(pageId){
    const thisApp = this;

    /* add class "active"  to matching pages, remove from non-matching */
    for(let page of thisApp.pages){  
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    /* add class "active"  to matching links, remove from non-matching */
    for(let link of thisApp.navLinks){  
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initBooking: function (){
    const thisApp = this;

    const containerBooking = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(containerBooking);
  },

  initPages: function (){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');

        thisApp.activatePage(id);

        window.location.hash = '#/' + id;
      });
    }
  },

  initMenu: function () {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parasedResponse){

        thisApp.data.products = parasedResponse;

        thisApp.initMenu();
      });
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', (event)=>{
      app.cart.add(event.detail.product);
    });
  },

  initHome(){
    const thisApp = this;

    const homeElement = document.querySelector(select.containerOf.home);

    thisApp.home = new Home(homeElement);
  },

  init: function () {
    const thisApp = this;

    thisApp.initHome();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initPages();
  },
};
app.init();