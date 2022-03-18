import { templates, select } from '../settings';
import utils from '../utils.js';

class Booking {
  constructor(element){
    const thisBooking = this;   

    thisBooking.render(element);
    thisBooking.initWidgets();
  }  

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.element = utils.createDOMFromHTML(generatedHTML);

    const bookingContainer = document.querySelector(select.containerOf.booking);

    thisBooking.dom = {
      wrapper: element,
    };

    bookingContainer.appendChild(thisBooking.element).innerHTML;
  }
}

export default Booking;