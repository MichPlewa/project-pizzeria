/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderFrom();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log('new product: ', thisProduct);
    }
    initAmountWidget(){
      const thisProduct = this;
      
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(event){
        event.preventDefault;
        thisProduct.processOrder();
      });
      
    }

    renderInMenu() {
      const thisProduct = this;

      const generetedHTML = templates.menuProduct(thisProduct.data);

      thisProduct.element = utils.createDOMFromHTML(generetedHTML);

      const menuContainer = document.querySelector(select.containerOf.menu);

      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;

      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      //clickableTrigger.addEventListener('click', function(event) {
      thisProduct.accordionTrigger.addEventListener('click', function(event){
        event.preventDefault();

        const activeProduct = document.querySelector(select.all.menuProductsActive);
        //console.log('activeProduct', activeProduct);
        //console.log(thisProduct.element);

        if(activeProduct && activeProduct != thisProduct.element){

          activeProduct.classList.remove('active');
          //console.log('if');

        }
        thisProduct.element.classList.toggle('active');
        
      });
    }

    initOrderFrom(){
      const thisProduct = this;
      //console.log('==initOrderFrom==');

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log('param: ', paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);
        
          //console.log('formData:  ', formData);

          if(formData[paramId] && formData[paramId].includes(optionId)){
            if(!option.default){
              price = price + option.price;
            }
          }
          else if (option.default == true){
            price = price - option.price;
            
          }
          const imageOption = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          
          if (imageOption && formData[paramId] && formData[paramId].includes(optionId)) {
            imageOption.classList.add(classNames.menuProduct.imageVisible);
            
          } else if (imageOption && formData[paramId] && formData[paramId].includes(optionId) != true) {
            imageOption.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
      thisProduct.priceSingle = price;

      price *=thisProduct.amountWidget.value;

      // update calculated price in the HTML

      thisProduct.priceElem.innerHTML = price;
    }
    
    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
      
    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {

        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      
      return(productSummary);
    }

    prepareCartProductParams() {
      const thisProduct = this;
    
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
    
      // for very category (param)
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
    
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        };
    
        // for every option in this category
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
          if(optionSelected) {
            // option is selected!
            params[paramId].options[optionId] = option.label;
          }
        }
      }

      return params;
    }
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;

      thisWidget.getElement (element);
      thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);


      this.initActions();

      //console.log('AmountWidget: ', thisWidget);
      //console.log('constructor argument: ', element);
    }

    getElement(element){
      const thisWidget = this;  
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      if(newValue !== thisWidget.value && !isNaN(newValue) && newValue <= settings.amountWidget.defaultMax && newValue >= settings.amountWidget.defaultMin){
        thisWidget.value = newValue;
      }
      
      thisWidget.input.value = thisWidget.value;

      thisWidget.announce();
      //console.log(newValue);
    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated',{
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }

    initActions(){
      const thisWidget = this;
      
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(element){
        element.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(element){
        element.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
  }

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

        thisCart.dom.form.addEventListener('submit', function(event){
          event.preventDefault();
          thisCart.sendOrder();
        });
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

      for(let product of thisCart.products){
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }

      if(thisCart.totalNumber === 0){
        thisCart.deliveryFee = 0;
      }

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

      /*console.log('totalNumber: ', totalNumber);
      console.log('subtotalPrice: ', subtotalPrice);
      console.log('deliveryFee: ', deliveryFee);
      console.log('thisCart.totalPrice: ', thisCart.totalPrice);*/
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

      for(let prod of thisCart.product){
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

  class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;

      console.log('thisCartProduct: ', thisCartProduct);

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }

    
    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidgetElem = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);

    }

    initAmountWidget(){
      const thisCartProduct = this;
      
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);
      thisCartProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      thisCartProduct.dom.wrapper.remove();
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault;
      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault;
        thisCartProduct.remove();
        //console.log('remove');
      });
    }

    getData(){
      const thisCartProduct = this;

      const orderData = {
        id: thisCartProduct.id,
        name: thisCartProduct.name,
        priceSingle: thisCartProduct.priceSingle,
        price: thisCartProduct.price,
        amount: thisCartProduct.amount,
        params: thisCartProduct.params
      };
      return orderData;
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;

      //console.log('thisApp.data: ', thisApp.data);

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
          console.log('parasedResponse: ', parasedResponse);

          thisApp.data.products = parasedResponse;

          thisApp.initMenu();
        });

      console.log('thisApp.data: ', JSON.stringify(thisApp.data));
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;

      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },
  };
  app.init();
}