import {select, classNames, templates, settings} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    //console.log('thisCart.dom.totalPrice: ', thisCart.dom.totalPrice);

    //console.log('new Cart: ', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = element.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
    thisCart.dom.form = element.querySelector(select.cart.form);
    thisCart.dom.address = element.querySelector(select.cart.address);
    thisCart.dom.phone = element.querySelector(select.cart.phone);

  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();

      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
    
  }

  add(menuProduct){
    const thisCart = this;

    //console.log('adding product', menuProduct);

    const generetedHTML = templates.cartProduct(menuProduct);

    thisCart.element = utils.createDOMFromHTML(generetedHTML);

    const generetedDOM = utils.createDOMFromHTML(generetedHTML);

    thisCart.dom.productList.appendChild(generetedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generetedDOM));

    thisCart.update();
    //console.log('thisCart.products', thisCart.products);
  }

  update(){
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    console.log('this.product: ', thisCart.products);

    for(let product of thisCart.products){
      console.log('product: ', product);
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
      console.log('product.amount', product.amount);
    }

    if(thisCart.totalNumber === 0){
      thisCart.deliveryFee = 0;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    console.log('totalNumber: ', thisCart.totalNumber);
    console.log('subtotalPrice: ', thisCart.subtotalPrice);
    console.log('deliveryFee: ', thisCart.deliveryFee);
    console.log('thisCart.totalPrice: ', thisCart.totalPrice);
    for(let price of thisCart.dom.totalPrice){
      price.innerHTML = thisCart.totalPrice;
    }
    //thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
  }

  remove(instance){
    const thisCart = this;      

    const productList = thisCart.products;
    const productIndex = productList.indexOf(instance);

    productList.splice(productIndex, 1);
         
    
    thisCart.update(); 
  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    let payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };
    console.log('payload: ', payload);

    for(let prod of thisCart.products){
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }
}

export default Cart;