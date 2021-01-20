import React from 'react';
import axios from 'axios';
import './App.css';
import parse from 'html-react-parser';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
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
                <Link to ="/">Rando Boardo</Link>
              </li>
              <li>
                <Link to="/search">Search for a Board Game</Link>
              </li>
            </ul>
        </div>
        <hr />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Router path="/search">
            <Search />
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
        <div>Welcome
          <div>Loading Content</div>
        </div>
      )
    }
    return(
      <div id='homeContainer'>
        <h1>Welcome</h1>
        <h2>Here is your Rando Boardo!</h2>
        {this.state.board && this.state.cat_data ? <RandomBoard board={this.state.board} pictures={this.state.pictures} board_cat={this.state.cat_data} board_mech={this.state.mech_data}/> : `Loading`}

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
        <h1>Welcome to URBoard</h1>
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
        <h1>Welcome to URBoard</h1>
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
        <h1>Welcome to URBoard</h1>
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
        <div className="popYear">Year Published: {this.state.board.year_published}</div>
        <div className="popPlayers">{this.state.board.min_players} - {this.state.board.max_players} Players</div>
        <div className="popTime">{this.state.board.min_playtime} - {this.state.board.max_playtime} minutes</div>
        <div className="popAge">Minimum recommended age: {this.state.board.min_age}</div>
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
            <div>Views: {boardGames.views}</div>
            <ReactPlayer url={boardGames.url} />
          </div>)}
      </div>  
    )
  }
}
const RandomBoard=props=>
  <div id="randomContainer">
    <div>{props.board[0].name}</div>
    <div>
      <img src={props.board[0].images.medium} alt='' />
    </div>
    <div>Year Released: {props.board[0].year_published}</div>
    <div>{props.board[0].min_players} - {props.board[0].max_players} players</div>
    <div>{props.board[0].min_playtime} - {props.board[0].max_playtime} minutes</div>
    <div>Age {props.board[0].min_age} and up.</div>
    <div><IdCatMatcher board={props.board[0].categories} board_cats={props.board_cat} board_mech={props.board_mech} /></div>
    <div>{parse(`${props.board[0].description}`)}</div>
    <div id="picturesContainer">
    <Carousel width='550px' dynamicHeight='true'>
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
  console.log(`Board Game Categories: ` + props.board)
  console.log(`Categories: `+props.board_cats[0])
  if(props.board.length > 0){
    for (let i=0;i < props.board.length;i++){
      for(let j=0;j<props.board_cat.length;i++){
        if(props.board_cat[j].id===props.board[i].id){
          result.push(props.board_cat[j].name)
        }
      }
    }
    return result.map(result =>
    <div>
      <li>
        {result}
      </li>
    </div>)
}else{
  return <p>N/A</p>
  }
}
export default App;