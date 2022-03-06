/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
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
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
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

      console.log('new product: ', thisProduct);
    }
    initAmountWidget(){
      const thisProduct = this;
      
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElm);
      thisProduct.amountWidgetElm.addEventListener('updated', function(event){
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
      thisProduct.amountWidgetElm = thisProduct.element.querySelector(select.menuProduct.amountWidget);
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
      console.log('==initOrderFrom==');

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
      });
    }

    processOrder(){
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);

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

      price *=thisProduct.amountWidget.value;

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;

      thisWidget.getElement (element);
      thisWidget.setValue(thisWidget.input.value);

      this.initActions();

      console.log('AmountWidget: ', thisWidget);
      console.log('constructor argument: ', element);
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
        thisWidget.value = settings.amountWidget.defaultValue;
        thisWidget.value = newValue;
      }
      
      thisWidget.input.value = thisWidget.value;

      thisWidget.announce();
      //console.log(newValue);
    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated');
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

  const app = {
    initMenu: function () {
      const thisApp = this;

      console.log('thisApp.data: ', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;

      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };
  app.init();
}
