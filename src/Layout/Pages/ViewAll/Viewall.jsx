import React, { Component } from "react";
import Card from "../../Components/Card/Card";
import firebase from "firebase";
import Lottie from "lottie-react-web";
import loading from "../../../assets/loading.json";
import "./ViewAll.css";
import Loader from "../../Components/Loader/Loader";

export default class Viewall extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "",
      loading: true,
    };
  }

  componentDidMount() {
    firebase
      .firestore()
      .collection("settings")
      .onSnapshot((snap) => {
        snap.docChanges().forEach((changes) => {
          changes.doc.data().sliders.forEach((item) => {
            console.log(item.title);
            if (this.props.match.params.id === item.title) {
              this.setState({
                data: item,
                loading: false,
              });
            }
          });
        });
      });
  }

  render() {
    return (
      <div className="Viewall">
        {this.state.loading ? (
          <Loader />
        ) : (
          <>
            <p>{this.state.data.title}</p>
            <div className="lines">
              <div className="horizontal"></div>
              <div className="rotated-line">
                <div className="line-through"></div>
                <div className="line-through"></div>
              </div>
              <div className="horizontal"></div>
            </div>
            <div className="ViewallProducts">
              {this.state.data.products.map((item) => {
                return <Card item={item} />;
              })}
            </div>
          </>
        )}
      </div>
    );
  }
}
