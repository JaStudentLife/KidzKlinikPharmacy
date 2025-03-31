import React from "react";
import "./App.css";

function Contact() {
  return (
    <div className="container">
      <h2>Contact Kidz Klinik</h2>
      <p><strong>Address:</strong> El Shaddai Medical Centre, 94¼ Old Hope Road, Kingston 6</p>
      <p><strong>Phone:</strong> (876) 555-1234</p>
      <p><strong>Email:</strong> contact@kidzklinik.com</p>

      <form action="#" method="POST">
        <label htmlFor="name">Full Name:</label>
        <input type="text" id="name" name="name" required />

        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="message">Message:</label>
        <textarea id="message" name="message" rows="5" required></textarea>

        <button type="submit">Send Message</button>
      </form>

      <div className="about">
        <p>
          We are <strong>Kidz Klinik</strong>, and we've been serving our customers for over 20 years now.
          Founded in 1982 by Dr. John Royes, we value our customers by providing them with exceptional customer service and putting their health first.
        </p>
        <p>
          Located at El Shaddai Medical Centre, 94¼ Old Hope Road, Kingston 6,
          we are committed to providing you with the best medications. We got you!!
        </p>
        <p><strong>Thank you for choosing Kidz Klinik!</strong></p>
      </div>
    </div>
  );
}

export default Contact;
