import React, { Component } from 'react';
import './App.css'
import logo from './images/logo.png'
import {Container, Row, Col, Card, CardText,CardBody,CardTitle, Button, CardSubtitle} from 'reactstrap';
class App extends Component {
  render() {
    return (
      <div className="App">
        <Header/>
        <Main>
        </Main>
      </div>
    );
  }
}

class Header extends React.Component {
   render() {
      return (
        <header className="App-header">
          <h1 className="App-title">Welcome to Park-Ranger app</h1>
          <img src={logo} style={{width: 100}} alt="logo"/>
        </header>
      );
   }
}

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      fetchAuth: new Buffer('fetchUser:'+"SD%RLn&v4Rb4sY$8").toString('base64'),
      updateAuth: new Buffer('updateUser:'+"Aw5v2+$Wk#YdaNMg").toString('base64')
    };

    // Bind the this context to the update function
    this.reportToOffice = this.reportToOffice.bind(this);
  }
  componentDidMount() {
    //If we need to fetch results from DB
    //We use session storage to make sure that the content dies when the window is closed
    if (sessionStorage.Rangers === undefined){
      var formData = new FormData();
      formData.append("action","fetch");
      fetch('https://ranger-api.herokuapp.com/', {method: "POST",
                                                  body: formData,
                                                  withCredentials: true,
                                                  credentials: 'include',
                                                  headers: {
                                                      'Authorization': 'Basic ' + this.state.fetchAuth}
                                                  })
        .then(res => res.json())
        .then(
          (result) => {
            var rangers = Object.values(result)[0];
            //Update session storage
            sessionStorage.Rangers = JSON.stringify(rangers);
            this.setState({
              isLoaded: true,
              items: rangers,
              currentRanger : this.getCurrentRanger(rangers)
            });
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            console.log(error);
            this.setState({
              isLoaded: true,
              error
            });
          }
        )
      }
      else {
        var rangers = Object.values(JSON.parse(sessionStorage.Rangers));
        this.setState({
          isLoaded: true,
          items: rangers,
          currentRanger : this.getCurrentRanger(rangers)
        });
      }
  }

  getCurrentRanger(data) {
    //Break the queryString
    var query = window.location.search.substring(1); //Remove the ?
    var params = query.split('&');
    var Ranger = false;
    //Iterate over all query strings to find the ranger param
    for (var i = 0; i < params.length; i++) {
      var current = params[i].split("=");
      if (typeof(decodeURIComponent(current[0])) !== 'string')
        break;
      if (decodeURIComponent(current[0].toLowerCase()) === 'ranger') {
        Ranger = current[1];
      }
    }

    //Default return value
    var returnArr = new Array();
    returnArr['Current'] = true;
    returnArr['id'] = 0;
    returnArr['Name'] = 'No Ranger selected';
    if (Ranger === false) {
      //If we didn't find anything - return
      return returnArr;
    }

    //Go over the data array and find the correct ranger
    for (var i = 0; i < data.length; i++) {
      if (Ranger.toLowerCase() === data[i]['Unq'].toLowerCase()) {
        returnArr["Name"] = data[i]['Name'];
        returnArr["Count"] = data[i]['Count'];
        returnArr['CurrentCount'] = 0;
        returnArr['relatedKey'] = i;
        returnArr['relatedID'] = data[i]['id'];
        break;
      }
    }
    return returnArr;
  }

  reportToOffice(markedTrees){
    //We will put the new val as is to update the session storage
    var newVal = parseInt(this.state.items[this.state.currentRanger['relatedKey']]['Count']) + markedTrees;
    this.state.items[this.state.currentRanger['relatedKey']]['Count'] = newVal;
    sessionStorage.Rangers = JSON.stringify(this.state.items);

    //Set state to render the App
    this.setState({
        isLoaded: true,
        items: this.state.items,
        currentRanger : this.getCurrentRanger(this.state.items)
      });

    //Send data to API in order to update data json and send event to requestbin
    var formData = new FormData();
    formData.append("action","update");
    formData.append("rangerID", this.state.currentRanger['relatedID']);
    formData.append("newCount",markedTrees);
    fetch('https://ranger-api.herokuapp.com/', {method: "POST",
                                                body: formData,
                                                withCredentials: true,
                                                credentials: 'include',
                                                headers: {
                                                    'Authorization': 'Basic ' + this.state.updateAuth}
                                                })
      .then(
        (result) => {
            console.log("New event: Ranger reported to office. Visit http://requestbin.fullcontact.com/16gffks1?inspect");
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            console.log(error);
            this.setState({
              isLoaded: true,
              error
            });
          }
      );
  }

  render() {
    const { error, isLoaded, items, currentRanger} = this.state;
      return(
        <main>
          <Container>
            <Row>
                <Col lg={{size: 6}}>
                  <div className="allRangers">
                      <h2>Rangers</h2>
                  </div>
                  <div className="Loading">
                    {items.map(item => (
                      <Ranger data={item}/>
                    ))}
                   </div>
                </Col>
                <Col lg={{size: 6}}>
                  <div>
                      <h2>Current Ranger:</h2>
                  </div>
                  {
                    <Ranger data={currentRanger} callback={this.reportToOffice}/>
                  }
                </Col>
            </Row>
          </Container>
        </main>
      );
    }
  }

class Ranger extends React.Component {
  constructor(props){
    super(props);
  }

  markTree(){
    this.props.data.CurrentCount++;
    //Set state to render the app
    this.setState({});
    //Update requestbin that an event had occurred
    fetch('https://ranger-api.herokuapp.com/?event=userMarkedTree',
      {method: "GET"
      }
          )
          .then(
            (res) => {
              console.log("New event: Ranger marked a tree. Visit http://requestbin.fullcontact.com/16gffks1?inspect");
            },
            (error) => {
              console.log(error);
              this.setState({
                isLoaded: true,
                error
              });
            });
  }

  render() {
    if (this.props.data !== undefined) {
      if (this.props.data.Current !== undefined){
        //If this is the selected ranger and one is selected
        if (this.props.data.Count !== undefined) {
          return (
            <Card className="Card" key={this.props.data.id}>
              <CardBody>
                 <CardTitle><b>{this.props.data.Name}</b></CardTitle>
                 <CardSubtitle>Current Count</CardSubtitle>
                 <CardText>{this.props.data.CurrentCount}</CardText>
                 <CardSubtitle>Total Count</CardSubtitle>
                 <CardText>{this.props.data.Count}</CardText>
                   <Button color="primary"  onClick={() => this.markTree()}>Mark Tree</Button>
                   <Button color="secondary" onClick={() => this.props.callback(this.props.data.CurrentCount)}>Report to office</Button>             
              </CardBody>
             </Card>
            );
        }
        else {
          return(
           <Card key={this.props.data.id}>
              <CardBody>
                 <CardTitle><b>{this.props.data.Name}</b></CardTitle>
              </CardBody>
             </Card>
          );
        }
      }
      else {
        var container = document.getElementsByClassName('Loading')[0];
        if (container !== undefined) {
          container.setAttribute('class','RangersContainer');
        }
        return (
          <Card className="Card" key={this.props.data.id}>
            <CardBody>
               <CardTitle><b>{this.props.data.Name} ({this.props.data.Unq})</b></CardTitle>
               <CardSubtitle>Total Count</CardSubtitle>
               <CardText>{this.props.data.Count}</CardText>
            </CardBody>
           </Card>
          );
      }
    }
    else {    
      //Put loader until all data is fetched
      return(
          <Card>
            <CardBody className="Loading"/>
          </Card>
        );
    }
  }
}

export default App;
