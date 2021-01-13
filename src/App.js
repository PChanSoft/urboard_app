import React from 'react';
import axios from 'axios';
import parse from 'html-react-parser';

const BASE_URL='https://api.boardgameatlas.com/api/search?name=Monopoly';
const client_id='&client_id=8KFAfbV6gn'
// const search_limit='&limit=10'
const mechanics_url='https://api.boardgameatlas.com/api/game/mechanics?client_id=8KFAfbV6gn'
const categories_url='https://api.boardgameatlas.com/api/game/categories?client_id=8KFAfbV6gn'



class App extends React.Component{
  constructor(props){
    super(props);
    this.state={};
    this.someFunction=this.someFunction.bind(this)
  }
  async someFunction(e){
    try{
      const res = await axios.get(BASE_URL+client_id);
      const mechanicsRes= await axios.get(mechanics_url);
      const categoriesRes= await axios.get(categories_url);
      this.setState({board:res.data, mech_data:mechanicsRes.data, cat_data:categoriesRes.data})
      
    }catch (e){
      console.error(e);
    }
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
      <button onClick={() => this.someFunction()}>Click me</button>
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
        </div>
        )
      }
      </div>
    )
  }
}

export default App;
