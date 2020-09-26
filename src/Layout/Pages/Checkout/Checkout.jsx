import React from "react";
import "./Checkout.css";
import firebase from "firebase";
import Login from "../../Components/login/Login";
import toaster from "toasted-notes";

export default class Checkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cart: [],
      openLogin: false,
      coupon: "",
      currentUser: "",
      loginStatus: "",
      email: "",
      address: "",
      phone: "",
      state: "",
      country: "",
      firstName: "",
      lastName: "",
      apartment: "",
      city: "",
      pincode: "",
      points: ""
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        firebase
          .firestore()
          .collection("users")
          .where("email", "==", user.email)
          .get()
          .then((snap) => {
            snap.forEach((doc) => {
              this.setState({
                cart: doc.data().cart,
                currentUser: doc.data(),
                email: doc.data().email,
                address: doc.data().address,
                phone: doc.data().phone,
                points: doc.data().points
              },()=>{
                this.state.currentUser.name.includes(
                  " "
                )
              ? this.setState({
                //first name
                firstName: this.state.currentUser.name.substr(
                  0,
                  this.state.currentUser.name.indexOf(" ")
                ),
                //last name
                lastName: this.state.currentUser.name.substr(
                  this.state.currentUser.name.indexOf(" "),
                  this.state.currentUser.name.length)
              })
              : 
              this.setState({
                firstName: this.state.currentUser.name
              })
              });
              console.log(doc.data().cart);
            });
          });
      } else {
        this.setState({
          cart: JSON.parse(localStorage.getItem("cart")),
          currentUser: "",
        });
      }
    });
    firebase
      .firestore()
      .collection("settings")
      .get()
      .then((snap) => {
        snap.forEach((doc) => {
          var coupons = doc.data().coupons;
          coupons.forEach((coupon) => {
            if (coupon.name === this.props.match.params.coupon) {
              this.setState({
                coupon: coupon,
              });
            }
          });
        });
      });
  }

  handlePay=(total)=>{
    if(this.state.email.length > 0 && this.state.country.length > 0 && this.state.state.length > 0 && this.state.phone.length > 0 && this.state.address.length > 0 && this.state.city.length > 0 && this.state.pincode.length > 0 && this.state.firstName.length > 0){
      const options = {
        key: "rzp_test_dxlgLQGi0JrIZp",
        name: "Marfit",
        amount: total*100,
        handler: async (response) => {
          console.log("succ");
          try {
            console.log("ess");
            // firebase
            //   .firestore()
            //   .collection("payments")
            //   .add({
            //     name: this.state.name,
            //     phone: this.state.phone,
            //     email: this.state.email,
            //     paymentId: response.razorpay_payment_id,
            //     amount: this.state.amount,
            //   })
              // .then(() => {
                console.log("done");
                firebase.firestore().collection("users").where("email", "==", this.state.currentUser.email).get().then((snap) => {
                  if(snap.size > 0){
                    snap.docChanges().forEach(changes => {
                      var products = changes.doc.data().orders.concat(this.state.cart);
                      firebase.firestore().collection("users").doc(changes.doc.id).update({
                        orders: products,
                        cart: [],
                        points: 0
                      }).then(()=>{
                        window.location.href = "/";
                      })
                    })
                  }
                })
              // });
          } catch (err) {
            console.log(err);
          }
        },
        prefill: {
          name: this.state.firstName,
          email: this.state.email,
          contact: this.state.phone,
        },
        theme: {
          color: "#2D499B",
        },
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    }else{
      toaster.notify("Please Fill in all the fields")
    }
  }

  handleChange=(e)=>{
    const { name, value } = e.target;
    this.setState({
      [name]: value
    })
  }

  render() {
    var subTotal = 0;
    var shipping = 0;
    for (var i = 0; i < this.state.cart.length; i++) {
      subTotal += this.state.cart[i].sp * this.state.cart[i].cartQuantity;
      shipping +=
        this.state.cart[i].shippingCharge * this.state.cart[i].cartQuantity;
    }
    console.log(this.state.currentUser.length);
    var total = shipping + subTotal - this.state.points;
    var value = "";
    var date = new Date();
    if (this.state.coupon !== "") {
      if (
        this.state.coupon.start.toDate() < date &&
        this.state.coupon.end.toDate() > date
      ) {
        if (this.state.coupon.type === "money") {
          total -= this.state.coupon.value;
          value = this.state.coupon.value;
        } else {
          value = total * (this.state.coupon.value / 100);
          total -= value;
        }
      }
    } else {
      value = 0;
    }

    return (
      <div className="checkout">
        <div className="left">
          {this.state.currentUser !== "" ? null : (
            <div className="already">
              <p>
                Already have an account?{" "}
                <span onClick={() => this.setState({ openLogin: true })}>
                  Log in
                </span>
              </p>
            </div>
          )}

          <main className="info">
            <div className="contact">
              <div className="contact-label">
                <p className="heading">Contact information</p>
              </div>
              <input
                type="email"
                className="email-input"
                placeholder="Email"
                name="email"
                value={
                  this.state.email
                }
                onChange={this.handleChange}
              />
            </div>
            <div className="shipping">
              <h2>Shipping address</h2>
              <div className="input-name">
                <input
                  type="text"
                  placeholder="First name"
                  name="firstName"
                  id="firstName"
                  required
                  value={
                    this.state.firstName 
                  }
                  onChange={this.handleChange}
                />
                <input
                  type="text"
                  placeholder="Last name"
                  name="lastName"
                  id="lastName"
                  required
                  value={
                    this.state.lastName
                  }
                  onChange={this.handleChange}
                />
              </div>
              <input
                type="text"
                placeholder="Address"
                name="address"
                id="address"
                required
                value={
                  this.state.address
                }
                onChange={this.handleChange}
              />
              <input
                type="text"
                placeholder="Appartment, suite, etc. (optional)"
                name="appartment"
                id="appartment"
                value={this.state.apartment}
                onChange={this.handleChange}
              />
              <div className="region">
              <input
                type="text"
                placeholder="Country / Nation"
                name="country"
                required
                id="country"
                value={this.state.country}
                onChange={this.handleChange}
              />
                <input
                type="text"
                placeholder="State"
                name="state"
                required
                id="state"
                value={this.state.state}
                onChange={this.handleChange}
              />
              </div>
              <div className="region">
              <input
                type="text"
                placeholder="City"
                name="city"
                required
                id="city"
                value={this.state.city}
                onChange={this.handleChange}
              />
                <input
                type="text"
                placeholder="Pincode"
                name="pincode"
                required
                id="pincode"
                value={this.state.pincode}
                onChange={this.handleChange}
              />
              </div>
              <input
                type="text"
                name="phone"
                id="phone"
                placeholder="Phone"
                value={
                  this.state.phone
                }
                onChange={this.handleChange}
              />
            </div>
          </main>
          <div className="placeOrder">
            <a>
              <i className="fas fa-chevron-left"></i>Return to cart
            </a>
            <div className="checkoutbtn" onClick={() => {this.handlePay(total)}}>
              <a>Place an Order</a>
            </div>
          </div>
        </div>
        <div className="right">
          <div className="items-container">
            {this.state.cart.map((item, index) => (
              <div className="item" key={index}>
                <img src={item.images[0]} alt=""/>
                <div className="item-info">
                  <p>{item.title}</p>
                  <div className="price-cont">
                    <p>&#8377; {item.sp}</p>
                    <p>Quantity: {item.cartQuantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="order-details">
            <div className="sub">
              <p className="sub-title">Subtotal</p>
              <p>&#8377; {subTotal}</p>
            </div>
            <div className="shipping-sub">
              <p className="sub-title">Shipping</p>
              <p>+ &#8377; {shipping}</p>
            </div>
            <div className="discount-sub">
              <p className="sub-title">Discount ({this.state.coupon.name})</p>
              <p>- &#8377; {value}</p>
            </div>
            <div className="points-sub">
              <p className="sub-title">Points ({this.state.points})</p>
              <p>- &#8377; {this.state.points}</p>
            </div>
          </div>
          <div className="total">
            <p>TOTAL</p>
            <p>&#8377; {total}</p>
          </div>
        </div>
        {this.state.openLogin ? (
          <Login
            close={(toggle) => this.setState({ openLogin: toggle })}
            login={(toggle) => {
              this.setState({ loginStatus: toggle });
            }}
          />
        ) : null}
      </div>
    );
  }
}
