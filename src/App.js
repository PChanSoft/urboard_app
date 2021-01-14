import React from 'react';
import axios from 'axios';
import parse from 'html-react-parser';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const BASE_URL='https://api.boardgameatlas.com/api/search?name=';
const client_id='&client_id=8KFAfbV6gn'
// const search_limit='&limit=10'
const mechanics_url='https://api.boardgameatlas.com/api/game/mechanics?client_id=8KFAfbV6gn'
const categories_url='https://api.boardgameatlas.com/api/game/categories?client_id=8KFAfbV6gn'



class App extends React.Component{
  render(){
    return(
      <Router>
        <div>
            <ul>
              <li>
                <Link to ="/">Home</Link>
              </li>
              <li>
                <Link to="/search">Search</Link>
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
  render(){
    return(
      <div>
        <h1>Welcome</h1>
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
    console.log(this.state.searchParam)
  }
  null_link(param){
    if(param===null || param===undefined){
      return 'No official link for this product.'
    }else {
      return 'Official Link'
    }
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
  render(){
    return(
      <div>
      <h1>Welcome to URBoard</h1>
      <form onSubmit={this.getSearch} onChange={this.handleChange}>
        <input type="text" name="grab" />
        <input type="submit" />
      {this.state.board && this.state.board.games.map(boardGames =>
        <div key={boardGames.id}>
          <h2>{boardGames.name}</h2>
          <h4>Game Id: {boardGames.id}</h4>
          <h5>Genre: {this.id_check(boardGames.categories,this.state.cat_data.categories)}</h5>
          Description:
          {parse(`${boardGames.description}`)}
          {/* {boardGames.description_preview} */}
          <h5>Mechanics: 
            {this.id_check(boardGames.mechanics,this.state.mech_data.mechanics)}
          </h5>
          <p>
            <img src={boardGames.images.small} alt='' />
            {" "}<a href={boardGames.official_url}>{this.null_link(boardGames.official_url)}</a>
          </p>
          <hr />
        </div>
        )
      }
      </form>
      </div>
    )
}
}


export default App;
