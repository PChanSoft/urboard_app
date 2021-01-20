import React from 'react';
import axios from 'axios';
import './App.css';
import parse from 'html-react-parser';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import ReactPlayer from 'react-player';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';


const BASE_URL='https://api.boardgameatlas.com/api/search?name=';
const client_id='&client_id=8KFAfbV6gn'
const mechanics_url='https://api.boardgameatlas.com/api/game/mechanics?client_id=8KFAfbV6gn'
const categories_url='https://api.boardgameatlas.com/api/game/categories?client_id=8KFAfbV6gn'
const videos_url='https://api.boardgameatlas.com/api/game/videos?client_id=8KFAfbV6gn&order_by=view_count&game_id='
const random_url='&random=true'
const pictures_url='https://api.boardgameatlas.com/api/game/images?client_id=8KFAfbV6gn'

class App extends React.Component{
  render(){
    return(
      <Router>
        <div>
            <ul>
              <li>
                <Link to ="/urboard_app">Rando Boardo</Link>
              </li>
              <li>
                <Link to="/urboard_app/search">Search for a Board Game</Link>
              </li>
              <li>
                <Link to = "/urboard_app/about">About this site</Link>
              </li>
            </ul>
        </div>
        <hr />
        <Switch>
          <Route exact path="/urboard_app">
            <Home />
          </Route>
          <Router path="/urboard_app/search">
            <Search />
          </Router>
          <Router path="/urboard_app/about">
            <About />
          </Router>
        </Switch>
      </Router>
    )
  }
}
class Home extends React.Component{
  constructor (props){
    super(props);
    this.state={};
  }
  componentDidMount(){
    this.getRandomGame()
  }
  async getRandomGame(e){
    try{
      const res = await axios.get(BASE_URL+random_url+client_id)
      this.setState({board:res.data.games})
      const picturesRes = await axios.get(pictures_url+`&game_id=${this.state.board[0].id}`)
      const categoriesRes= await axios.get(categories_url);
      const mechanicsRes= await axios.get(mechanics_url);
      this.setState({pictures:picturesRes.data.images, mech_data:mechanicsRes.data.mechanics, cat_data:categoriesRes.data.categories})
    }catch(e){
      console.error(e)
    }
  }
  render(){
    if(!this.state.board){
      return(
          <h2>...Loading Content...</h2>
      )
    }
    return(
      <div id='homeContainer'>
        <h1>Welcome</h1>
        <h2>Here is your Rando Boardo!</h2>
        {this.state.board && this.state.cat_data ? <RandomBoard board={this.state.board} pictures={this.state.pictures} board_cat={this.state.cat_data} board_mech={this.state.mech_data}/> : `Waiting...`}

      </div>
    )
  }
}
class Search extends React.Component{
  constructor (props){
    super (props)
    this.state={};
    this.baseState=this.state;
    this.getSearch=this.getSearch.bind(this)
    this.handleChange=this.handleChange.bind(this)
  }
  async getSearch(e){ 
    e.preventDefault();
    const searchCache=this.state.searchParam;
    this.setState(this.baseState);
    try{
      const res = await axios.get(BASE_URL+searchCache+client_id);
      const mechanicsRes= await axios.get(mechanics_url);
      const categoriesRes= await axios.get(categories_url);
      this.setState({board:res.data, mech_data:mechanicsRes.data, cat_data:categoriesRes.data})
    }catch (e){
      console.error(e);
    }
  }
  handleChange(e){
    this.setState({searchParam:e.target.value})
  }
  null_link(param){
    if(param===null || param===undefined){
      return 'No official link for this product.'
    }else {
      return 'Official Link'
    }
  }
  
  render(){
    if (!this.state.board){
      return(
      <div>
        <h1>URBoard Search</h1>
      <form onSubmit={this.getSearch} onChange={this.handleChange}>
        <input type="text" name="grab" />
        <input type="submit" />
        </form>
      </div>
      )
    }
    if (this.state.board.games.length === 0){
      return (
        <div>
        <h1>URBoard Search</h1>
      <form onSubmit={this.getSearch} onChange={this.handleChange}>
        <input type="text" name="grab" />
        <input type="submit" />
        </form>
        <h5>No results, please try another search.</h5>
      </div>
      )
    }
    return(
      <div>
        <h1>URBoard Search</h1>
      <form onSubmit={this.getSearch} onChange={this.handleChange}>
        <input type="text" name="grab" />
        <input type="submit" />
        </form>
          <div id='searchContainer'>
            {this.state.board.games.length!==0 && this.state.board.games.map(boardGames =>
              <div className='resultBox' key={boardGames.id}>
              <div className='gameTitle'>{boardGames.name}</div>
              <div className='gameYear'>{boardGames.year_published}</div>
              <div className='gamePrice'>Price: {boardGames.price}</div>
              <div><Redirect to={{
                pathname: '/urboard_app/about',
              state:{about:boardGames.id}
            }} />
            </div>
                <Popup trigger={<button>Details</button>} modal>
                    <div>
                      <Details boardId={boardGames} boardCat={this.state.cat_data.categories} boardMech={this.state.mech_data.mechanics} />
                    </div>
                </Popup>
              <p>
                <img src={boardGames.images.small} alt='' />
              </p>
              <p>
              <a href={boardGames.official_url}>{this.null_link(boardGames.official_url)}</a>
              </p>
        </div>
        )
      }
        </div>
      
      </div>
    )
  }
}
class Details extends React.Component{
  constructor(props){
    super(props);
    this.state={
      board:this.props.boardId,
      categories:this.props.boardCat,
      mechanics:this.props.boardMech,
      videos:this.props.boardVid,
    };
  }
  //This is how we print out the correct mechanics and category information based on the id's given from the API.
  id_check(game_Id,data_Id){ 
    var result=[];
    if (game_Id.length > 0){
    for (let j=0;j<game_Id.length;j++){

      for (let i=0; i<data_Id.length;i++){
        if(game_Id[j].id===data_Id[i].id){ 
          result.push(data_Id[i].name)
          break;
        }
      }
    }
    return result.map(result => <div>
      <li>
        {result}
      </li>
    </div>)
    }else{
      return <p>N/A</p>
    }
  }
  componentDidMount(){
    this.getVideo();
  }
  async getVideo(e){
    try{
      let game_id = this.state.board.id
      const vidRes = await axios.get(videos_url+game_id)
      this.setState({videos:vidRes.data.videos})
    } catch(e){
      console.error(e)
    }
  }
  render(){
    return(
      <div className="popContainer">
        <div className="popTitle">{this.state.board.name}</div>
        <Year year={this.state.board.year_published} />
        <MinMaxPlayers min={this.state.board.min_players} max={this.state.board.max_players} />
        <MinMaxTime min={this.state.board.min_playtime} max={this.state.board.max_playtime} />
        <Age age={this.state.board.min_age} />
        <hr />
        <div className="popDescription">
          Description:
          {parse(`${this.state.board.description}`)}
        </div>
        <h5>Genre: {this.id_check(this.state.board.categories,this.state.categories)}</h5>
        <h5>Mechanics: 
            {this.id_check(this.state.board.mechanics,this.state.mechanics)}
        </h5>
        <hr />
        {this.state.videos&&this.state.videos.map(boardGames=>
          <div className='popVideoContainer'>
            <div>Title: {boardGames.title}</div>
            <ReactPlayer url={boardGames.url} />
          </div>)}
      </div>  
    )
  }
}
class About extends React.Component{
  render(){
    return(
      <h1>About This App</h1>
    )
  }
}
const RandomBoard=props=>
  <div id="randomContainer">
    <h2>{props.board[0].name}</h2>
    <div>
      <img src={props.board[0].images.medium} alt='' />
    </div>
    <Year year={props.board[0].year_published} />
    <MinMaxPlayers min={props.board[0].min_players} max={props.board[0].max_players}/>
    <MinMaxTime min={props.board[0].min_playtime} max={props.board[0].max_playtime} />
    <Age age={props.board[0].min_age} />
    <h4>Categories</h4>
    <ul><IdCatMatcher board={props.board[0].categories} board_cats={props.board_cat} /></ul>
    <h4>Mechanics</h4>
    <ul><IdMechMatcher board={props.board[0].mechanics} board_mech={props.board_mech} /></ul>
    <h3>Description</h3>
    <div>{parse(`${props.board[0].description}`)}</div>
    <div id="picturesContainer">
    <Carousel width='600px' dynamicHeight='true'>
      {props.pictures && props.pictures.map(pictures =>
        <div className="carImage">
          <img src={pictures.large} alt='' />
        </div>
      
      )}
    </Carousel>
    </div>
  </div>;
const IdCatMatcher=props=>{
  var result = [];
  if(props.board.length > 0){
    for (let i=0;i < props.board.length;i++){
      for(let j=0;j<props.board_cats.length;j++){
        if(props.board_cats[j].id===props.board[i].id){
          result.push(props.board_cats[j].name)
          break;
        }
      }
    }
    return result.map(result =>
      <li>
        {result}
      </li>
)
}else{
  return <p>N/A</p>
  }
}
const IdMechMatcher=props=>{
  var result = [];
  if(props.board.length > 0){
    for(let i=0;i < props.board.length;i++){
      for(let j=0;j<props.board_mech.length;j++){
        if(props.board_mech[j].id===props.board[i].id){
          result.push(props.board_mech[j].name)
          break;
        }
      }
    }
    return result.map(result =>
        <li>
          {result}
        </li>)
  }else{
    return <p>N/A</p>
  }
}
const MinMaxPlayers=props=>{
  if(props.min > 0 && props.min===props.max){
    if(props.min === 1){
      return (
        <div>{props.min} Player</div>
      )
    }else{
      return (
      <div>{props.min} Players</div>
    )
      }
  }else if(props.min < props.max){
    return(
      <div>{props.min} - {props.max} Players</div>
    )
  }else{
    return(
      <div></div>
    )
  }
}

const MinMaxTime=props=>{
  if(props.min > 0 && props.min===props.max){
    return(
      <div>{props.min} minutes</div>
    )
  }else if(props.min < props.max){
    return (
      <div>{props.min} - {props.max} minutes</div>
    )
  }else{
    return(
      <div></div>
    )
  }
}

const Age=props=>{
  if(props.age > 0){
    return(
      <div>For ages {props.age} and up</div>
    )
  }else{
    return(
      <div></div>
    )
  }
}

const Year=props=>{
  if(props.year > 0){
    return(
      <div>Year Released: {props.year}</div>
    )
  }else{
    return(
      <div></div>
    )
  }
}
export default App;